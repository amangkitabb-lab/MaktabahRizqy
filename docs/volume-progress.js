/* Maktabahrizqy v0.7: per-juz/jilid progress, backward-compatible with v0.6.
 * Pure data helpers. No PDF content or private Drive URLs are stored in source.
 */
(() => {
  'use strict';
  const MAX_VOLUMES = 999;
  const MAX_PAGES = 100000;
  const integer = (v, min, max, fallback) => {
    if (v === undefined || v === null || v === '') return fallback;
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
  };
  const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : '';
  const when = value => Date.parse(value || '') || 0;
  const countOf = b => integer(b?.total_volumes, 1, MAX_VOLUMES, 1);
  const volumeOf = b => integer(b?.current_volume, 1, countOf(b), 1);
  const toEntry = (v, fallbackDate = '') => {
    const total_pages = integer(v?.total_pages, 0, MAX_PAGES, 0);
    const page = integer(v?.page, 0, total_pages || MAX_PAGES, 0);
    return {page, total_pages, updated_at:validDate(v?.updated_at) || fallbackDate, reset:v?.reset===true};
  };
  function entriesOf(book) {
    const result = {};
    const raw = book?.volume_progress;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      for (const [key, value] of Object.entries(raw)) {
        if (!/^[1-9][0-9]{0,2}$/.test(key) || Number(key) > MAX_VOLUMES || !value || typeof value !== 'object' || Array.isArray(value)) continue;
        result[key] = toEntry(value, validDate(book.updated_at));
      }
    }
    const active = String(volumeOf(book));
    if (!result[active]) {
      const total_pages = integer(book?.total_pages, 0, MAX_PAGES, 0);
      result[active] = {
        page:integer(book?.current_page, 0, total_pages || MAX_PAGES, 0),
        total_pages,
        updated_at:validDate(book?.updated_at),reset:false,
      };
    }
    return result;
  }
  function normalize(book) {
    const base = {...(book || {})};
    const total_volumes = countOf(base);
    const current_volume = volumeOf(base);
    const volume_progress = entriesOf(base);
    const selected = volume_progress[current_volume] || toEntry(null);
    return {
      ...base, total_volumes, current_volume, volume_progress,
      current_page:selected.page, total_pages:selected.total_pages,
    };
  }
  function allVolumesComplete(book) {
    const n = normalize(book);
    for (let v=1;v<=n.total_volumes;v++) {
      const item = n.volume_progress[v];
      if (!item || !item.total_pages || item.page < item.total_pages) return false;
    }
    return true;
  }
  function percentage(book) {
    const n = normalize(book);
    if (n.total_volumes === 1) return n.total_pages ? Math.round(100 * n.current_page / n.total_pages) : 0;
    let sum = 0;
    for (let v=1;v<=n.total_volumes;v++) {
      const item = n.volume_progress[v];
      if (item?.total_pages) sum += Math.min(1, Math.max(0, item.page / item.total_pages));
    }
    return Math.max(0,Math.min(100,Math.round(100*sum/n.total_volumes)));
  }
  function setActive(book, options = {}) {
    const n = normalize(book);
    const now = validDate(options.now) || new Date().toISOString();
    const total_volumes = integer(options.total_volumes,1,MAX_VOLUMES,n.total_volumes);
    const current_volume = integer(options.current_volume,1,total_volumes,n.current_volume<=total_volumes?n.current_volume:total_volumes);
    const previous = n.volume_progress[current_volume] || toEntry(null);
    const total_pages = integer(options.total_pages,0,MAX_PAGES,previous.total_pages);
    const page = integer(options.page,0,total_pages||MAX_PAGES,previous.page);
    const changed = page !== previous.page || total_pages !== previous.total_pages;
    const reset = changed ? ((page===0 && previous.page>0)||(total_pages===0 && previous.total_pages>0)) : previous.reset;
    const entry = {page,total_pages,updated_at:changed?now:previous.updated_at,reset:!!reset};
    const volume_progress = {...n.volume_progress,[current_volume]:entry};
    // Keep previously recorded entries even when the number of jilid is reduced.
    const updated = {...n,total_volumes,current_volume,volume_progress,
      current_page:entry.page,total_pages:entry.total_pages,
      updated_at:now,
    };
    return updated;
  }
  function savePage(book, options={}) {
    const n = normalize(book);
    const volume = integer(options.volume,1,n.total_volumes,n.current_volume);
    const prev = n.volume_progress[volume] || toEntry(null);
    const page = integer(options.page,0,prev.total_pages || MAX_PAGES,0);
    const actual = options.source === 'auto' ? Math.max(prev.page,page) : page;
    const now = validDate(options.now) || new Date().toISOString();
    const updated = setActive(n,{current_volume:volume,page:actual,now});
    updated.last_read_at = actual ? now : null;
    updated.status = allVolumesComplete(updated) ? 'selesai' : (anyPage(updated) ? 'sedang' : 'belum');
    return updated;
  }
  function anyPage(book) {
    return Object.values(normalize(book).volume_progress).some(x=>x.page>0);
  }
  function setDocumentPages(book, pageCount) {
    const n = normalize(book);
    const number = integer(pageCount,1,MAX_PAGES,0);
    if (!number) return n;
    return setActive(n,{total_pages:number});
  }
  function mergeVolumes(older, newer, mixed) {
    // Select each volume by its own edit time, not by the other jilid's edit time.
    const first=normalize(older),last=normalize(newer);
    const volume_progress={...first.volume_progress};
    for (const [vol,entry] of Object.entries(last.volume_progress)) {
      const original=volume_progress[vol];
      if (!original) { volume_progress[vol]={...entry}; continue; }
      const oldMeaningful=original.page>0||original.total_pages>0;
      const newMeaningful=entry.page>0||entry.total_pages>0;
      // A fresh blank seed may have a newer global updated_at than actual reading data.
      if(oldMeaningful&&!newMeaningful&&!entry.reset)continue;
      if(newMeaningful&&!oldMeaningful&&!original.reset){volume_progress[vol]={...entry};continue;}
      if(when(entry.updated_at)>=when(original.updated_at))volume_progress[vol]={...entry};
    }
    const total_volumes=countOf(last);
    const current_volume=volumeOf(last);
    const selected=volume_progress[current_volume]||toEntry(null);
    const result={...mixed,volume_progress,total_volumes,current_volume,current_page:selected.page,total_pages:selected.total_pages};
    if(result.status==='belum'&&Object.values(volume_progress).some(p=>p.page>0))result.status='sedang';
    return result;
  }
  window.MAKTABAH_VOLUMES = {normalize,countOf,volumeOf,entriesOf,setActive,savePage,
    setDocumentPages,allVolumesComplete,percentage,mergeVolumes,MAX_VOLUMES,MAX_PAGES};
})();