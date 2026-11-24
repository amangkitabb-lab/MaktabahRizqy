/* Maktabahrizqy v0.8: private khatam counter with conflict-safe event IDs.
 * Each +1 is a unique event, so concurrent reading updates from two devices merge.
 */
(() => {
  'use strict';
  const MAX=9999, MAX_EVENTS=500;
  const date = value => typeof value==='string' && Number.isFinite(Date.parse(value))?value:'';
  const tick = value => Date.parse(value||'')||0;
  const number = value => Number.isFinite(Number(value))?Math.max(0,Math.min(MAX,Math.floor(Number(value)))):0;
  function eventsOf(raw, resetAt='') {
    if(!Array.isArray(raw))return [];
    const seen=new Set(),events=[];
    for(const entry of raw.slice(0,MAX_EVENTS*2)) {
      if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!/^kh-[a-z0-9-]{8,80}$/i.test(entry.id))continue;
      const at=date(entry.at);
      if(!at || tick(at)<=tick(resetAt) || seen.has(entry.id))continue;
      seen.add(entry.id);events.push({id:entry.id,at});
      if(events.length>=MAX_EVENTS)break;
    }
    return events.sort((a,b)=>a.at.localeCompare(b.at));
  }
  function normalize(book={}) {
    const reset=date(book.khatam_reset_at);
    const ev=eventsOf(book.khatam_events,reset);
    const base=book.khatam_base!==undefined?number(book.khatam_base):number(book.khatam_count);
    const count=Math.min(MAX,base+ev.length);
    return {...book,
      khatam_base:base,khatam_events:ev,khatam_reset_at:reset,
      khatam_count:count,
      last_khatam_at:ev.at(-1)?.at||date(book.last_khatam_at)||null,
    };
  }
  function add(book,{now=new Date().toISOString(),id}={}) {
    const b=normalize(book);
    if(b.khatam_count>=MAX)throw new Error('Batas catatan 9.999 kali khatam telah tercapai.');
    if(b.khatam_events.length>=MAX_EVENTS)throw new Error('Riwayat khatam terlalu panjang untuk sinkronisasi. Simpan cadangan sebelum melanjutkan.');
    const at=date(now);
    if(!at)throw new Error('Waktu khatam tidak valid.');
    const random = typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+'-'+Date.now();
    const evId=id||'kh-'+random;
    if(!/^kh-[a-z0-9-]{8,80}$/i.test(evId))throw new Error('Penanda catatan khatam tidak valid.');
    if(b.khatam_events.some(x=>x.id===evId))return b;
    const ev=[...b.khatam_events,{id:evId,at}].sort((a,b)=>a.at.localeCompare(b.at));
    return {...b,khatam_events:ev,khatam_count:b.khatam_base+ev.length,last_khatam_at:at,updated_at:at,status:'selesai'};
  }
  function setCount(book,value,now=new Date().toISOString()) {
    const b=normalize(book),valueInt=number(value);
    if(!Number.isInteger(Number(value))||Number(value)<0||Number(value)>MAX)throw new Error('Jumlah khatam harus antara 0 dan 9.999.');
    if(valueInt===b.khatam_count)return b;
    const at=date(now);
    if(!at)throw new Error('Waktu koreksi khatam tidak valid.');
    return {...b,khatam_base:valueInt,khatam_events:[],khatam_reset_at:at,
      khatam_count:valueInt,last_khatam_at:valueInt?b.last_khatam_at:null,updated_at:at};
  }
  function merge(older,newer,mixed) {
    const a=normalize(older),b=normalize(newer);
    const atA=tick(a.khatam_reset_at),atB=tick(b.khatam_reset_at);
    const evidenceA=atA>0||a.khatam_base>0||a.khatam_events.length>0;
    const evidenceB=atB>0||b.khatam_base>0||b.khatam_events.length>0;
    // Old browsers without khatam fields must not erase a newer khatam record.
    const latest=(evidenceA!==evidenceB)?(evidenceA?a:b):(atB>=atA?b:a);
    const reset=latest.khatam_reset_at;
    const events=eventsOf([...a.khatam_events,...b.khatam_events],reset);
    if(events.length>MAX_EVENTS)throw new Error('Riwayat khatam terlalu panjang untuk disinkronkan.');
    const base=latest.khatam_base;
    const count=Math.min(MAX,base+events.length);
    const last=events.at(-1)?.at || (tick(a.last_khatam_at)>tick(b.last_khatam_at)?a.last_khatam_at:b.last_khatam_at)||null;
    return {...mixed,khatam_base:base,khatam_events:events,khatam_reset_at:reset,
      khatam_count:count,last_khatam_at:count?last:null};
  }
  window.MAKTABAH_KHATAM={normalize,add,setCount,merge,MAX};
})();