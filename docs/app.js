/* Maktabahrizqy GitHub Pages v0.9 — F15-inspired editorial shelves, settings and accessible themes. */
(() => {
  'use strict';
  const PREVIEW = true; // Reuse local-data operations; there is no backend in Pages edition.
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const icons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-2.5 5.9-5.9 2.5 2.5-5.9z"/>',
    library: '<path d="M3 3v18h5V3zM10 4v17h5V4zM18 5l4 15-4 1-4-15z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    moon: '<path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    bookmark: '<path d="M5 4h14v17l-7-5-7 5z"/>',
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    'arrow-right': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
    book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zm0 0v14"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'chevron-left': '<path d="m15 18-6-6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    x: '<path d="M5 5l14 14M19 5 5 19"/>',
    edit: '<path d="m15 5 4 4M3 21l4.5-1 12-12a2.8 2.8 0 1 0-4-4l-12 12z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6M14 11v6"/>',
    refresh: '<path d="M20 6v6h-6M4 18v-6h6M6.2 9a7 7 0 0 1 12.2-2L20 12M4 12l1.6 4a7 7 0 0 0 12.3-1"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3A5 5 0 0 0 13 2.9L11 5M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1L13 19"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    'book-open': '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14"/>',
    upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 17v4h16v-4"/>',
    download: '<path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3"/>',
    settings: '<path d="M12 15.3a3.3 3.3 0 1 0 0-6.6 3.3 3.3 0 0 0 0 6.6z"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l-2.1 2.1a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66v.6h-3v-.6a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-2 .36l-2.1-2.1a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.66-1.1H4v-3h.6a1.8 1.8 0 0 0 1.66-1.1 1.8 1.8 0 0 0-.36-2l2.1-2.1a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 11.1 4.4V4h3v.4A1.8 1.8 0 0 0 15.2 6a1.8 1.8 0 0 0 2-.36l2.1 2.1a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.66 1.1h.4v3h-.4a1.8 1.8 0 0 0-1.2 1.16z"/>',
  };
  const ico = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
  const escape = (text) => String(text == null ? '' : text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = value => { try { const v = new URL(value); return ['http:', 'https:'].includes(v.protocol) ? v.href : ''; } catch { return ''; } };
  const displayTitle = {home:'Web Utama', explore:'Jelajahi Bacaan', collection:'Koleksi Ku'};
  const memoryStore = {};
  const storage = {
    get: key => {try {return window.localStorage.getItem(key) ?? memoryStore[key] ?? null} catch (_) {return memoryStore[key] ?? null}},
    set: (key,value) => {memoryStore[key] = value;try {window.localStorage.setItem(key,value);return true} catch (_) {return false}},
  };
  const FANN = ["Maraji' Fiqh Travelling", 'Belum Diklasifikasikan', 'Fiqh', 'Aqidah', 'Mantiq', 'Nahwu', 'Sharaf', 'Ushul Fiqh', 'Kaidah Fiqh', 'Tafsir', 'Hadis', 'Tasawuf', 'Akhlak', 'Doa & Wirid', 'Faraidh', 'Tajwid', 'Balaghah', 'Sejarah', 'Bahasa Arab', 'Lainnya'];
  const demoBooks = Array.isArray(window.MAKTABAH_SEED_BOOKS) ? window.MAKTABAH_SEED_BOOKS : [];
  const SEED_FLAG = 'maktabahrizqy_seed_v04';
  const MARAJI = "Maraji' Fiqh Travelling";
  const MARAJI_SEED_FLAG = 'maktabahrizqy_maraji_v08';
  const BOOKS_KEY = 'maktabahrizqy_browser_books_v1';
  const DELETED_KEY = 'maktabahrizqy_browser_deleted_v1';
  const readDeletions = () => {
    try {
      const value = JSON.parse(storage.get(DELETED_KEY) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  };
  const saveDeletions = data => storage.set(DELETED_KEY, JSON.stringify(data));
  const recordDeleted = id => {
    const current = readDeletions();
    current[id] = new Date().toISOString();
    saveDeletions(current);
  };
  const state = {
    preview: false,
    theme: ['light','cream','dark'].includes(storage.get('maktabah_theme')) ? storage.get('maktabah_theme') : 'cream',
    textSize: ['small','standard','large'].includes(storage.get('maktabah_text_size')) ? storage.get('maktabah_text_size') : 'standard',
    view:'home', books:[], query:'', category:'Semua', kind:'Semua',
    me:null, dialog:null, viewer:null, busy:false
  };

  const mockLoad = () => {
    let saved=[];
    try { const parsed=JSON.parse(storage.get(BOOKS_KEY) || '[]'); if(Array.isArray(parsed)) saved=parsed; } catch (_) {}
    // Import the initial public shelf only once, preserving any pre-existing local books.
    // Deleting an imported title will not bring it back on the next reload.
    if (storage.get(SEED_FLAG) !== '1') {
      const knownIds=new Set(saved.map(x=>x.id));
      const key=x=>String(x.title||'').trim().toLocaleLowerCase('id-ID');
      const knownTitles=new Set(saved.map(key));
      const now=new Date().toISOString();
      const fresh=demoBooks.filter(x=>!knownIds.has(x.id) && !knownTitles.has(key(x)))
        .map(x=>({...x,author:x.author||'',pdf_url:'',cover_url:'',notes:'',total_pages:0,current_page:0,status:'belum',last_read_at:null,created_at:now,updated_at:now,drive_file_id:null}));
      saved=[...saved,...fresh];
      // First persist the catalogue, then mark migration completed.
      storage.set(BOOKS_KEY,JSON.stringify(saved));
      storage.set(SEED_FLAG,'1');
    }
    // One-time additive migration of the special Maraji' shelf, without losing
    // covers, annotations, per-volume progress or earlier link imports.
    if(storage.get(MARAJI_SEED_FLAG)!=='1'){
      const now=new Date().toISOString();
      const cleanTitle=value=>String(value||'').toLocaleLowerCase('id-ID').trim().replace(/\s+/g,' ');
      for(const seed of demoBooks.filter(x=>x.fann===MARAJI)){
        const already=saved.find(b=>b.id===seed.id||cleanTitle(b.title)===cleanTitle(seed.title));
        if(already){
          if(already.fann!==MARAJI){already.fann=MARAJI;already.updated_at=now;}
        }else{
          saved.push({...seed,author:seed.author||'',pdf_url:'',cover_url:'',notes:'',
            total_pages:0,current_page:0,status:'belum',last_read_at:null,
            created_at:now,updated_at:now,drive_file_id:null});
        }
      }
      storage.set(BOOKS_KEY,JSON.stringify(saved));
      storage.set(MARAJI_SEED_FLAG,'1');
    }
    return saved.map(b=>window.MAKTABAH_KHATAM.normalize(window.MAKTABAH_VOLUMES.normalize(b)));
  };
  const mockSave = () => {
    const stored=storage.set(BOOKS_KEY, JSON.stringify(state.books));
    window.MAKTABAH_CLOUD?.notifyLocalChange();
    return stored;
  };
  async function api(path, method='GET', data) {
    if (PREVIEW) {
      if (path === '/api/me') return {authenticated:true,configured:false,email:'',csrf:''};
      if (path === '/api/books' && method === 'GET') return {books:mockLoad()};
      if (path === '/api/drive/sync') return {ok:true,created:0,scanned:0};
      if (path === '/api/logout') return {ok:true};
      const match = path.match(/^\/api\/books\/([^/]+)(\/progress)?$/);
      if (method === 'POST' && path === '/api/books') {
        const now=new Date().toISOString();
        const book=window.MAKTABAH_KHATAM.normalize(window.MAKTABAH_VOLUMES.normalize({...data,id:'lokal-'+(crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2)),status:Number(data.khatam_count)>0?'selesai':Number(data.current_page)?'sedang':'belum',drive_file_id:null,last_read_at:Number(data.current_page)?now:null,created_at:now,updated_at:now}));
        state.books.unshift(book); mockSave(); return {book};
      }
      if (match) {
        const b=state.books.find(x=>x.id===match[1]);
        if (!b) throw new Error('Bacaan tidak ditemukan.');
        if (method==='PATCH') Object.assign(b,data,{updated_at:new Date().toISOString()});
        if (method==='POST' && match[2]) Object.assign(b,window.MAKTABAH_VOLUMES.savePage(b,{volume:data.volume,page:data.page,source:data.source}));
        if (method==='DELETE') { recordDeleted(b.id); state.books=state.books.filter(x=>x.id!==b.id); }
        mockSave();return {book:b,ok:true};
      }
      throw new Error('Fitur ini memerlukan sambungan aplikasi asli.');
    }
    const opts = {method, credentials:'same-origin',headers:{'Accept':'application/json'}};
    if (method !== 'GET') {
      opts.headers['X-CSRF-Token'] = state.me?.csrf || '';
      if (data !== undefined) {opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(data);}
    }
    let res;
    try { res=await fetch(path, opts); } catch (_) { throw new Error('Server tidak dapat dihubungi.'); }
    let payload={};try {payload=await res.json();} catch (_) {}
    if (!res.ok) {
      if (res.status===401) {state.me=null; state.dialog=null; renderLogin(true);}
      const message=typeof payload.detail==='string'?payload.detail:res.status===422?'Data tidak valid. Periksa isianmu.':`Gagal memproses permintaan (${res.status}).`;
      throw new Error(message);
    }
    return payload;
  }

  function toast(message) {
    const node=document.createElement('div');node.className='toast';node.textContent=message;
    $('#toast-root').appendChild(node);setTimeout(()=>node.remove(),4100);
  }
  function progressPct(book) {return window.MAKTABAH_VOLUMES?.percentage(book)||0;}
  function progressMarkup(book) {
    const n=window.MAKTABAH_VOLUMES.normalize(book);
    const pct=progressPct(n);
    const volume=n.total_volumes>1?'Juz/Jilid '+n.current_volume+'/'+n.total_volumes+' · ':'';
    const page=n.current_page?'Hal. '+n.current_page+(n.total_pages?' / '+n.total_pages:''):'Belum dimulai';
    const percentLabel=n.total_volumes>1?'Progres seluruh jilid '+pct+' persen':'Progres '+pct+' persen';
    return `<div class="progress-rail"><progress value="${pct}" max="100" aria-label="${escape(percentLabel)}"></progress></div><div class="progress-row"><span>${escape(volume+page)}</span><span>${pct}%</span></div>`;
  }
  function coverMarkup(book, extra='') {
    const tone=[...book.title].reduce((a,c)=>a+c.charCodeAt(0),0)%6;
    const image = window.MAKTABAH_COVERS?.coverSrc(book) || url(book.cover_url) || '';
    const kind=book.kind==='buku'?'BUKU BACAAN':book.fann==='Belum Diklasifikasikan'?'KITAB':`FANN ${book.fann}`;
    const lang=/[\u0600-\u06FF]/.test(book.title)?' lang="ar" dir="rtl"':'';
    const text=`<div class="book-cover-art"><span class="cover-overline">MAKTABAHRIZQY • ${escape(kind)}</span><span class="cover-title"${lang}>${escape(book.title)}</span><span class="cover-ornament">❧</span></div>`;
    return `<div class="book-cover tone-${tone} ${extra}">${text}${image?`<img src="${escape(image)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="Sampul ${escape(book.title)}">`:''}</div>`;
  }
  function bookCard(book) {
    const status=book.status==='selesai'?'Selesai':book.status==='sedang'?'Sedang dibaca':'Belum dibaca';
    const kind=book.kind==='buku'?'Buku Bacaan':`Kitab · ${book.fann}`;
    return `<button type="button" class="book-card" data-open="${escape(book.id)}" aria-label="Lihat ${escape(book.title)}">${coverMarkup(book)}<span class="cover-status">${status}</span><div class="book-meta"><span class="card-overline">${escape(kind)}</span><span class="book-name"${/[\u0600-\u06FF]/.test(book.title)?' lang="ar" dir="rtl"':''}>${escape(book.title)}</span><span class="book-author"${/[\u0600-\u06FF]/.test(book.author||'')?' lang="ar" dir="rtl"':''}>${escape(book.author||'Pengarang belum dicatat')}</span>${window.MAKTABAH_KHATAM.normalize(book).khatam_count?`<span class="khatam-chip">✦ Khatam ×${window.MAKTABAH_KHATAM.normalize(book).khatam_count}</span>`:''}${progressMarkup(book)}</div></button>`;
  }
  const grid = books => books.length ? `<div class="book-grid">${books.map(bookCard).join('')}</div>` : emptyMarkup();
  function emptyMarkup(mode='list') {
    return `<div class="empty-state"><div class="empty-icon">${ico('book-open')}</div><h3>${mode==='list'?'Rak ini masih kosong':'Belum ada yang cocok'}</h3><p>${mode==='list'?'Tambahkan kitab atau buku pertamamu. Sampul dan tautan PDF bisa dilengkapi kapan saja.':'Coba ubah kata pencarian atau kategori yang kamu pilih.'}</p>${mode==='list'?`<button type="button" class="btn btn-primary" data-action="add">${ico('plus')} Tambah Bacaan</button>`:''}</div>`;
  }
  function pageHeader(title, subtitle, eyebrow='RUANG BACA') {return `<div class="page-heading"><div><div class="eyebrow">${escape(eyebrow)}</div><h1 class="page-title">${title}</h1><p class="page-subtitle">${escape(subtitle)}</p></div></div>`;}
  function stat(label,number,subtitle,icon) {return `<div class="stat"><div class="stat-head"><span>${label}</span>${ico(icon)}</div><div class="stat-num">${number}</div><div class="stat-bottom">${subtitle}</div></div>`;}

  function shelfMarkup(id,books,title,description,options={}) {
    if(!books.length)return '';
    const action=options.category
      ? `<button class="plain-link" type="button" data-side-category="${escape(options.category)}">Lihat semua ${ico('arrow-right')}</button>`
      : options.view
      ? `<button class="plain-link" type="button" data-nav="${escape(options.view)}">Lihat semua ${ico('arrow-right')}</button>` : '';
    return `<section class="section library-shelf">
      <div class="section-head"><div><h2>${escape(title)}</h2><p>${escape(description)}</p></div>
      <div class="shelf-controls">${action}
        <button type="button" class="shelf-arrow" data-scroll-target="${escape(id)}" data-scroll-dir="-1" aria-label="Geser ${escape(title)} ke kiri">${ico('chevron-left')}</button>
        <button type="button" class="shelf-arrow" data-scroll-target="${escape(id)}" data-scroll-dir="1" aria-label="Geser ${escape(title)} ke kanan">${ico('chevron-right')}</button>
      </div></div><div class="editorial-shelf" id="${escape(id)}">${books.map(bookCard).join('')}</div>
    </section>`;
  }
  function homeMarkup() {
    const list=state.books;
    const underway=list.filter(x=>x.status==='sedang');
    const finished=list.filter(x=>x.status==='selesai');
    const pages=list.reduce((sum,b)=>sum+Object.values(window.MAKTABAH_VOLUMES.entriesOf(b)).reduce((v,p)=>v+(Number(p.page)||0),0),0);
    const khatamTotal=list.reduce((sum,b)=>sum+window.MAKTABAH_KHATAM.normalize(b).khatam_count,0);
    const maraji=list.filter(b=>b.fann===MARAJI);
    const recent=[...list].sort((a,b)=>(b.updated_at||'').localeCompare(a.updated_at||'')).slice(0,10);
    const readRecently=[...underway].sort((a,b)=>(b.last_read_at||'').localeCompare(a.last_read_at||''));
    const current=readRecently[0];
    const recentIds=new Set(recent.map(b=>b.id));
    const overlooked=list.filter(b=>b.status==='belum'&&!recentIds.has(b.id)&&b.fann!==MARAJI).slice(0,10);
    let html=pageHeader('Karena bacaan kamu belakangan ini','Koleksi dan rujukan yang dekat dengan perjalanan bacamu.','PERPUSTAKAAN PRIBADI');
    html+=shelfMarkup('shelf-recent',recent,'Baru ditambahkan','Judul yang terakhir kamu masukkan atau perbarui.',{view:'collection'});
    if(current)html+=`<section class="section"><div class="section-head"><div><h2>Lanjutkan membaca</h2><p>Sambung dari halaman dan jilid terakhir yang tersimpan.</p></div></div><div class="continue-panel">${coverMarkup(current)}<div class="continue-copy"><div class="eyebrow">BACAAN TERAKHIR</div><h3>${escape(current.title)}</h3><p>${escape(current.author||current.fann)}</p>${progressMarkup(current)}</div><button type="button" class="btn btn-primary" data-open="${escape(current.id)}">Lanjutkan ${ico('arrow-right')}</button></div></section>`;
    html+=shelfMarkup('shelf-maraji',maraji,"Maraji' Fiqh Travelling",`${maraji.length} rujukan fiqh safar dalam rak khusus.`,{category:MARAJI});
    html+=shelfMarkup('shelf-missed',overlooked.length?overlooked:list.filter(b=>!recentIds.has(b.id)).slice(0,10),'Buku yang mungkin terlewat','Temukan bacaan lama yang bisa kamu mulai lagi.',{view:'explore'});
    html+=`<section class="section library-summary"><div class="section-head"><div><h2>Jejak bacamu</h2><p>Progres dan khatam yang kamu catat sendiri.</p></div></div>
      <div class="stats">${stat('Total Koleksi',list.length,'Kitab & buku tercatat','layers')}${stat('Sedang Dibaca',underway.length,'Bacaan yang berjalan','book')}${stat('Selesai Dibaca',finished.length,'Bacaan tuntas','check')}${stat('Halaman Terbaca',pages.toLocaleString('id-ID'),'Terakumulasi di koleksi','clock')}${stat('Total Khatam',khatamTotal.toLocaleString('id-ID'),'Khatam seluruh kitab','check')}</div>
    </section>`;
    html+='<p class="catalogue-hint">Tautan PDF pribadi dan progres hanya disimpan di browser atau akun Google yang kamu sambungkan. Katalog publik tidak membuka akses ke file Drive pribadimu.</p>';
    return html;
  }
  function exploreMarkup() {
    const fannValues=['Semua',...new Set(state.books.map(b=>b.kind==='buku'?'Buku Bacaan':b.fann))];
    const q=state.query.trim().toLocaleLowerCase('id-ID');
    const filtered=state.books.filter(b=> {
      const inText = `${b.title} ${b.author} ${b.fann} ${b.kind==='buku'?'Buku Bacaan':'Kitab'} ${b.notes||''}`.toLocaleLowerCase('id-ID').includes(q);
      const inCategory=state.category==='Semua'||(state.category==='Buku Bacaan'?b.kind==='buku':b.kind==='kitab'&&b.fann===state.category);
      return inText && inCategory;
    });
    return `${pageHeader('Jelajahi <em>Bacaan</em>','Cari judul, pengarang, atau fann. Semua bacaanmu ada di satu tempat.','TEMUKAN LAGI')}
      <div class="toolbar"><div class="search-wrap">${ico('search')}<input type="search" class="input-search" id="search-input" placeholder="Cari judul, pengarang, atau fann..." autocomplete="off" value="${escape(state.query)}" aria-label="Cari bacaan"></div><div class="search-count">${filtered.length} dari ${state.books.length} bacaan</div></div>
      <div class="filter-row">${fannValues.map(f=>`<button type="button" class="filter-chip ${f===state.category?'active':''}" data-category="${escape(f)}">${escape(f)}</button>`).join('')}</div>
      <div class="section-head"><div><h2>Seluruh katalog</h2><p>${filtered.length} judul ditemukan · tersimpan di rak bacaanmu</p></div><div class="catalogue-actions"><button type="button" class="plain-link" data-action="import-drive-links">${ico('link')} Impor Tautan PDF</button><button type="button" class="plain-link" data-action="backup">${ico('download')} Ekspor Cadangan</button></div></div>
      ${filtered.length?grid(filtered):emptyMarkup(state.books.length?'search':'list')}`;
  }
  function collectionMarkup() {
    const visible=state.books.filter(b=>state.kind==='Semua'||(state.kind==='Kitab'?b.kind==='kitab':b.kind==='buku'));
    const groups={};
    visible.forEach(b=>{const key=b.kind==='buku'?'Buku Bacaan':b.fann===MARAJI?MARAJI:`Kitab · Fann ${b.fann}`;(groups[key]||=[]).push(b);});
    const order=Object.keys(groups).sort((a,b)=>a===MARAJI?-1:b===MARAJI?1:a==='Buku Bacaan'?1:b==='Buku Bacaan'?-1:a.localeCompare(b,'id'));
    return `${pageHeader('Koleksi <em>Ku</em>','Rak pribadi yang dibagi menurut buku bacaan dan disiplin keilmuan kitab.','RAK BACAANMU')}
    <div class="collection-intro"><div class="collection-banner"><div><h3>Kitab</h3><p>Fiqh, Aqidah, Mantiq, Nahwu, Sharaf, dan berbagai fann lainnya.</p></div><div class="banner-mark">الكتب</div></div><div class="collection-banner"><div><h3>Buku Bacaan</h3><p>Nonfiksi, sejarah, pengembangan diri, dan bacaan lainnya.</p></div><div class="banner-mark">01</div></div></div>
    <div class="filter-row">${['Semua','Kitab','Buku Bacaan'].map(f=>`<button type="button" class="filter-chip ${state.kind===f?'active':''}" data-kind="${f}">${f}</button>`).join('')}</div>
    ${order.length?order.map(name=>`<section class="shelf-block"><div class="shelf-title"><h3>${escape(name)}</h3><span class="shelf-count">${groups[name].length} bacaan</span></div>${grid(groups[name])}</section>`).join(''):emptyMarkup()}`;
  }
  function activateNav() {
    $$('.nav-link,.bottom-link').forEach(b=>{b.classList.toggle('active',b.dataset.nav===state.view);if(b.dataset.nav===state.view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
    $('#crumb-current').textContent=displayTitle[state.view];
    document.title=`${displayTitle[state.view]} — Maktabahrizqy`;
  }
  function renderSidebarCategories() {
    const root=$('#sidebar-category-list');if(!root)return;
    const totals=new Map();
    state.books.forEach(book=>{
      const category=book.kind==='buku'?'Buku Bacaan':String(book.fann||'Belum Diklasifikasikan');
      totals.set(category,(totals.get(category)||0)+1);
    });
    const names=[...totals.keys()].sort((a,b)=>a===MARAJI?-1:b===MARAJI?1:a.localeCompare(b,'id'));
    const count=$('#sidebar-category-count');if(count)count.textContent=String(names.length);
    const active=(key)=>state.view==='explore'&&state.category===key;
    root.innerHTML=`<button type="button" class="sidebar-category ${active('Semua')?'active':''}" data-side-category="Semua" ${active('Semua')?'aria-current="page"':''}><span>Semua koleksi</span><span class="genre-count">${state.books.length}</span></button>`
      +names.map(name=>`<button type="button" class="sidebar-category ${active(name)?'active':''}" data-side-category="${escape(name)}" ${active(name)?'aria-current="page"':''}><span title="${escape(name)}">${escape(name)}</span><span class="genre-count">${totals.get(name)}</span></button>`).join('');
  }
  function renderBody() {
    if (!state.me?.authenticated) return;
    $('#content').innerHTML=state.view==='home'?homeMarkup():state.view==='explore'?exploreMarkup():collectionMarkup();
    activateNav();
    renderSidebarCategories();
  }
  function go(view) {
    if (!(view in displayTitle) || !state.me?.authenticated) return;
    state.view=view;state.query='';state.category='Semua';state.kind='Semua';
    document.body.classList.remove('sidebar-open');renderBody();window.scrollTo({top:0,behavior:'instant'});
  }

  function setTheme(value) {
    if(!['light','cream','dark'].includes(value))value='cream';
    state.theme=value;
    document.body.dataset.theme=value;
    storage.set('maktabah_theme',value);
    const meta=$('meta[name="theme-color"]');
    if(meta)meta.content=value==='dark'?'#121416':value==='cream'?'#f7f5ee':'#f9f9f8';
    const btn=$('#theme-btn');
    if(btn){
      const next=value==='dark'?'Krem':'Gelap';
      btn.innerHTML=ico(value==='dark'?'sun':'moon')+`<span class="theme-label">Mode ${next.toLowerCase()}</span>`;
      btn.setAttribute('aria-label','Aktifkan mode '+next.toLowerCase());
      btn.title='Aktifkan mode '+next.toLowerCase();
    }
    refreshSettingsControls();
  }
  function setTextSize(value) {
    if(!['small','standard','large'].includes(value))value='standard';
    state.textSize=value;
    document.body.dataset.textSize=value;
    storage.set('maktabah_text_size',value);
    refreshSettingsControls();
  }
  function refreshSettingsControls() {
    $$('.settings-segmented [data-setting-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.settingTheme===state.theme)));
    $$('.settings-segmented [data-setting-size]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.settingSize===state.textSize)));
  }
  function openSettings() {
    const themeOptions=[['light','Terang'],['cream','Krem'],['dark','Gelap']];
    const sizeOptions=[['small','Kecil'],['standard','Standar'],['large','Besar']];
    const segment=(items,attribute,current)=>items.map(([value,label])=>`<button type="button" ${attribute}="${value}" aria-pressed="${String(value===current)}">${label}</button>`).join('');
    const cloudMessage=$('#cloud-status')?.textContent||'Koleksi disimpan di browser ini.';
    const cloudAccount=$('#sidebar-user')?.textContent||'Rak Bacaan Lokal';
    const el=$('#settings-root');
    if(!el)return;
    el.innerHTML=`<div class="settings-overlay" data-settings-dismiss="true">
      <section class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title" tabindex="-1">
        <div class="settings-heading"><h2 id="settings-title">Pengaturan</h2>
          <button type="button" class="settings-close" data-settings-close="true" aria-label="Tutup pengaturan">${ico('x')}</button></div>
        <div class="settings-group"><label id="settings-font-label">Ukuran teks</label>
          <div class="settings-segmented" role="group" aria-labelledby="settings-font-label">${segment(sizeOptions,'data-setting-size',state.textSize)}</div>
        </div>
        <div class="settings-group"><label id="settings-theme-label">Tema</label>
          <div class="settings-segmented" role="group" aria-labelledby="settings-theme-label">${segment(themeOptions,'data-setting-theme',state.theme)}</div>
          <p class="settings-description">Krem adalah warna kertas netral, bukan filter sepia. Tema gelap memakai teks terang dengan kontras tinggi.</p>
        </div>
        <div class="settings-divider"></div>
        <div class="settings-group"><label>Akun & sinkronisasi</label>
          <div class="settings-account"><div><strong>${escape(cloudAccount)}</strong><br><small>Data pribadi di perangkat dan Google jika terhubung</small></div>
            <button type="button" class="btn btn-secondary" data-settings-action="sync">Kelola</button></div>
          <p class="settings-status">${escape(cloudMessage)}</p>
        </div>
        <div class="settings-group"><label>Cadangan koleksi</label>
          <div class="settings-actions"><button type="button" data-settings-action="backup">${ico('download')} Ekspor JSON</button>
            <button type="button" data-settings-action="restore">${ico('upload')} Impor JSON</button></div>
        </div>
        <div class="settings-divider"></div>
        <p class="settings-description">Maktabahrizqy bisa dipasang melalui menu browser <strong>Tambahkan ke layar utama</strong> jika tersedia. Progres, cover, dan penghitung khatam tidak diubah oleh pengaturan tampilan.</p>
      </section></div>`;
    document.body.classList.add('settings-open');
    el.querySelector('.settings-close')?.focus();
  }
  function closeSettings() {
    document.body.classList.remove('settings-open');
    const el=$('#settings-root');if(el)el.innerHTML='';
  }
  function renderCloudStatus(info) {
    const message=$('#cloud-status');
    if(message)message.textContent=info.message||'';
    const login=$('#cloud-login-btn');
    const sync=$('#cloud-sync-btn');
    const logout=$('#cloud-logout-btn');
    if(login) { login.hidden=info.connected; login.disabled=!!info.busy; }
    if(sync) { sync.hidden=!info.connected; sync.disabled=!!info.busy; }
    if(logout) logout.hidden=!info.connected;
    const title=$('#cloud-account-title');
    if(title)title.textContent=info.connected?'Rak Tersambung Google':'Rak Bacaan Lokal';
    const user=$('#sidebar-user');
    if(user)user.textContent=info.connected?('Google: '+info.email):'Tersimpan di browser ini';
    const label=$('.privacy-label');
    if(label)label.innerHTML='<span class="privacy-dot"></span> '+(info.connected?'DATA BROWSER + GOOGLE':'DATA DI BROWSER');
  }
  function renderLogin() { // Authentication is only used for optional cloud synchronization.
    toast('Login tidak digunakan pada versi GitHub Pages.');
  }
  function clearDialog(){state.dialog=null;$('#dialog-root').innerHTML='';}
  const fannOptions=(current)=>FANN.map(f=>`<option value="${escape(f)}" ${f===current?'selected':''}>${escape(f)}</option>`).join('');
  function bookForm(book=null) {
    const edit=!!book;
    const b=window.MAKTABAH_KHATAM.normalize(window.MAKTABAH_VOLUMES.normalize(book||{title:'',author:'',kind:'kitab',fann:'Belum Diklasifikasikan',total_pages:0,pdf_url:'',cover_url:'',notes:'',status:'belum'}));
    state.volumeFormDraft=b;
    state.volumeFormSelected=b.current_volume;
    state.dialog={type:'form',id:book?.id||null};
    $('#dialog-root').innerHTML=`<div class="modal-shade" data-dismiss="true"><div class="modal" role="dialog" aria-modal="true" aria-label="${edit?'Ubah':'Tambah'} Bacaan"><div class="modal-top"><div><div class="eyebrow">KATALOG DI PERANGKAT</div><h2 class="modal-title">${edit?'Ubah data bacaan':'Tambah bacaan baru'}</h2><p class="modal-sub">Judul wajib diisi. Sampul dan PDF boleh menyusul.</p></div><button class="icon-btn" data-action="close" type="button" aria-label="Tutup">${ico('x')}</button></div>
      <form id="book-form"><div class="form-grid">
        <div class="field wide"><label for="book-title">Judul kitab / buku *</label><input id="book-title" name="title" maxlength="260" required value="${escape(b.title)}" placeholder="Misalnya: Fathul Mu'in"></div>
        <div class="field"><label for="book-author">Pengarang</label><input id="book-author" name="author" maxlength="200" value="${escape(b.author)}" placeholder="Nama pengarang"></div>
        <div class="field"><label for="book-kind">Jenis bacaan</label><select id="book-kind" name="kind"><option value="kitab" ${b.kind==='kitab'?'selected':''}>Kitab</option><option value="buku" ${b.kind==='buku'?'selected':''}>Buku Bacaan</option></select></div>
        <div class="field"><label for="book-fann">Fann / kategori</label><select id="book-fann" name="fann">${fannOptions(b.fann)}</select></div>
        <div class="field wide volume-form-label">Pengaturan Juz / Jilid <span>untuk kitab mujallad dan buku berseri</span></div>
        <div class="field"><label for="book-volume-total">Jumlah Juz / Jilid</label><input id="book-volume-total" name="total_volumes" type="number" min="1" max="999" step="1" value="${b.total_volumes}"></div>
        <div class="field"><label for="book-volume-active">Juz / Jilid yang dibaca</label><input id="book-volume-active" name="current_volume" type="number" min="1" max="${b.total_volumes}" step="1" value="${b.current_volume}"></div>
        <div class="field"><label for="book-total">Jumlah halaman <span class="volume-number-label">Juz / Jilid ${b.current_volume}</span></label><input id="book-total" name="total_pages" type="number" min="0" max="100000" value="${Number(b.total_pages)||0}"></div>
        <div class="field"><label for="book-page">Halaman terakhir <span class="volume-number-label">Juz / Jilid ${b.current_volume}</span></label><input id="book-page" name="current_page" type="number" min="0" max="${b.total_pages||100000}" value="${Number(b.current_page)||0}"></div>
        <div class="field wide"><small class="field-hint">Halaman terakhir disimpan terpisah untuk tiap juz/jilid. Jika berganti jilid, nomor halaman jilid sebelumnya tetap tersimpan.</small></div>
        <div class="field wide"><label for="book-pdf">Tautan PDF (opsional)</label><input id="book-pdf" name="pdf_url" type="url" maxlength="1500" value="${escape(b.pdf_url)}" placeholder="https://drive.google.com/file/d/..."><span class="field-hint">Progres otomatis saat PDF berhasil ditampilkan di pembaca web. Untuk Google Drive privat gunakan halaman manual atau pilih PDF dari perangkat.</span></div>
        <div class="field wide"><label for="book-cover">Tautan gambar sampul (opsional)</label><input id="book-cover" name="cover_url" type="url" maxlength="1500" value="${escape(url(b.cover_url))}" placeholder="https://.../cover.jpg"><span class="field-hint">Cover lokal / halaman pertama PDF: simpan bacaan lalu buka Detail → Kelola Cover. Cover tersimpan pribadi di browser dan ikut sinkron Google jika login.</span></div>
        <div class="field"><label for="book-khatam">Sudah khatam (kali)</label><input id="book-khatam" name="khatam_count" type="number" min="0" max="9999" step="1" value="${b.khatam_count||0}"></div>
        <div class="field wide"><span class="field-hint">Jumlah khatam tersimpan untuk setiap judul. Tambahkan khatam baru dari Detail Bacaan (+1 Khatam) agar tercatat sebagai peristiwa tersendiri.</span></div>
        <div class="field wide"><label for="book-notes">Catatan pribadi</label><textarea id="book-notes" name="notes" maxlength="4000" placeholder="Catatan singkat tentang bacaan ini...">${escape(b.notes)}</textarea></div>
        ${edit?`<div class="field"><label for="book-status">Status</label><select id="book-status" name="status"><option value="belum" ${b.status==='belum'?'selected':''}>Belum dibaca</option><option value="sedang" ${b.status==='sedang'?'selected':''}>Sedang dibaca</option><option value="selesai" ${b.status==='selesai'?'selected':''}>Selesai</option></select></div>`:''}
      </div><div class="modal-actions"><button type="button" data-action="close" class="btn btn-ghost">Batal</button><button type="submit" class="btn btn-primary">${ico('check')} ${edit?'Simpan Perubahan':'Tambah ke Koleksi'}</button></div></form></div></div>`;
    setTimeout(()=>$('#book-title')?.focus(),80);
  }
  function stashFormVolume() {
    if(!state.volumeFormDraft)return false;
    const total=Number($('#book-total')?.value||0);
    const page=Number($('#book-page')?.value||0);
    if(!Number.isInteger(total)||total<0||total>100000||!Number.isInteger(page)||page<0||page>100000||(total&&page>total)){
      toast('Nomor halaman tidak valid untuk juz/jilid ini.');
      return false;
    }
    state.volumeFormDraft=window.MAKTABAH_VOLUMES.setActive(state.volumeFormDraft,{
      current_volume:state.volumeFormSelected,total_pages:total,page
    });
    return true;
  }
  function selectFormVolume(number,volumeTotal) {
    const m=window.MAKTABAH_VOLUMES;
    const count=Math.max(1,Math.min(999,Math.floor(Number(volumeTotal)||1)));
    const vol=Math.max(1,Math.min(count,Math.floor(Number(number)||1)));
    state.volumeFormDraft=m.setActive(state.volumeFormDraft,{total_volumes:count,current_volume:vol});
    state.volumeFormSelected=vol;
    $('#book-volume-active').max=String(count);
    $('#book-volume-active').value=String(vol);
    $('#book-volume-total').value=String(count);
    $('#book-total').value=String(state.volumeFormDraft.total_pages||0);
    $('#book-page').value=String(state.volumeFormDraft.current_page||0);
    $('#book-page').max=String(state.volumeFormDraft.total_pages||100000);
    $('.volume-number-label').forEach(el=>el.textContent='Juz / Jilid '+vol);
  }
  function detail(book) {
    if (!book) return;
    book=window.MAKTABAH_KHATAM.normalize(window.MAKTABAH_VOLUMES.normalize(book));
    state.dialog={type:'detail',id:book.id};
    const links=[];
    const external=url(book.pdf_url);
    if (external) links.push(`<button type="button" class="btn btn-primary" data-action="read" data-id="${escape(book.id)}">${ico('book-open')} Baca dalam Web</button>`);
    links.push(`<button type="button" class="btn btn-secondary" data-action="open-local" data-id="${escape(book.id)}">${ico('upload')} Pilih PDF dari Perangkat</button>`);
    if (external) links.push(`<a href="${escape(external)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${ico('link')} Buka Tautan PDF ${ico('arrow-up-right')}</a>`);
    const coverTools=`<section class="detail-cover-tools">
      <h4>Kelola Cover</h4>
      <p>PDF Drive akan dicoba tampil sebagai pratinjau halaman pertama. Jika gagal, pilih PDF dari perangkat untuk membuat cover otomatis, atau unggah JPG/PNG/WebP.</p>
      <div class="cover-tool-actions">
        ${external?`<button type="button" class="btn btn-secondary" data-action="cover-auto-link" data-id="${escape(book.id)}">${ico('refresh')} Ambil dari Tautan</button>`:''}
        <button type="button" class="btn btn-secondary" data-action="cover-pdf-local" data-id="${escape(book.id)}">${ico('book-open')} Cover dari PDF Lokal</button>
        <button type="button" class="btn btn-secondary" data-action="cover-image-local" data-id="${escape(book.id)}">${ico('upload')} Upload Cover Lokal</button>
        ${book.cover_url?`<button type="button" class="btn btn-ghost" data-action="cover-remove" data-id="${escape(book.id)}">Hapus cover pilihan</button>`:''}
      </div>
      <small>Cover dibuat ringkas dan tersimpan bersama catatan di browser; jika login Google aktif, cover pilihan ikut tersinkron melalui Drive aplikasi. Tidak ada PDF asli yang diunggah.</small>
    </section>`;
    const volumeControl=book.total_volumes>1&&book.total_volumes<=50?
      `<select id="manual-volume" aria-label="Nomor juz atau jilid">${Array.from({length:book.total_volumes},(_,i)=>i+1).map(n=>`<option value="${n}" ${n===book.current_volume?'selected':''}>Jilid ${n}</option>`).join('')}</select>`:
      `<input type="number" id="manual-volume" min="1" max="${book.total_volumes}" step="1" value="${book.current_volume}" aria-label="Nomor juz atau jilid">`;
    const khatamTracker=`<section class="detail-khatam" aria-label="Tracker khatam bacaan">
      <div class="khatam-info"><div class="khatam-eyebrow">JEJAK KHATAM</div><strong class="khatam-number">${book.khatam_count} <span>kali khatam</span></strong><small>${book.last_khatam_at?'Terakhir '+new Date(book.last_khatam_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}):'Belum ada khatam yang dicatat'}</small></div>
      <button type="button" class="btn btn-khatam" data-action="khatam-add" data-id="${escape(book.id)}">${ico('check')} +1 Khatam</button>
      <p>Tekan setelah menuntaskan satu kitab. Catatan khatam tidak menghapus progres halaman atau jilid yang sudah tersimpan.</p>
    </section>`;
    $('#dialog-root').innerHTML=`<div class="modal-shade" data-dismiss="true"><div class="modal" role="dialog" aria-modal="true" aria-label="Detail ${escape(book.title)}"><div class="modal-top"><div class="eyebrow">DETAIL BACAAN</div><button type="button" class="icon-btn" data-action="close" aria-label="Tutup">${ico('x')}</button></div><div class="detail-layout">${coverMarkup(book)}<div><div class="detail-topline">${escape(book.kind==='buku'?'BUKU BACAAN':'KITAB · FANN '+book.fann)}</div><h2 class="detail-name"${/[\u0600-\u06FF]/.test(book.title)?' lang="ar" dir="rtl"':''}>${escape(book.title)}</h2><div class="detail-author">${escape(book.author||'Pengarang belum dicatat')}</div><div class="detail-chips"><span class="detail-chip">${escape(book.status==='belum'?'Belum dibaca':book.status==='sedang'?'Sedang dibaca':'Selesai')}</span><span class="detail-chip">${book.total_pages?'Total '+book.total_pages+' halaman':'Halaman belum diketahui'}</span>${book.total_volumes>1?`<span class="detail-chip">Juz/Jilid ${book.current_volume} dari ${book.total_volumes}</span>`:''}</div>${progressMarkup(book)}${book.notes?`<p class="detail-note">${escape(book.notes)}</p>`:''}<div class="detail-actions">${links.join('')}</div><p class="field-hint">PDF tidak diunggah ke situs. Progres otomatis berlaku hanya jika PDF berhasil dirender di sini; pembukaan tautan eksternal tidak dapat dilacak.</p></div></div>
    <div class="detail-progress"><h4>Tandai juz / jilid dan halaman terakhir</h4><div class="progress-inline volume-progress-inline"><label for="manual-volume">Juz / Jilid</label>${volumeControl}<span>dari ${book.total_volumes}</span><label for="manual-page">Halaman</label><input type="number" id="manual-page" min="0" max="${book.total_pages||100000}" value="${book.current_page}" aria-label="Halaman terakhir dibaca"><span id="manual-page-hint">${book.total_pages?'dari '+book.total_pages+' halaman':'belum ada total halaman'}</span><button type="button" class="btn btn-secondary" data-action="save-progress" data-id="${escape(book.id)}">${ico('check')} Simpan Progres</button></div><small class="field-hint">Pindah Juz / Jilid untuk melihat atau mencatat halaman terakhir pada jilid tersebut.</small></div>
    ${khatamTracker}${coverTools}<div class="modal-actions"><button type="button" class="btn btn-danger" data-action="delete" data-id="${escape(book.id)}">${ico('trash')} Hapus dari Katalog</button><button type="button" class="btn btn-secondary" data-action="edit" data-id="${escape(book.id)}">${ico('edit')} Ubah Data</button></div></div></div>`;
  }
  function saveChosenCover(book, cover, pages=0) {
    if(!window.MAKTABAH_COVERS) throw new Error('Modul cover belum termuat.');
    if(cover && !window.MAKTABAH_COVERS.safeCover(cover)) throw new Error('Format cover tidak aman atau terlalu besar.');
    const prior=state.books;
    const current=prior.find(x=>x.id===book.id);
    if(!current) throw new Error('Bacaan tidak ditemukan.');
    const updated={...current,cover_url:cover,updated_at:new Date().toISOString()};
    if(pages && !updated.total_pages)Object.assign(updated,window.MAKTABAH_VOLUMES.setDocumentPages(updated,pages));
    const next=prior.map(x=>x.id===book.id?updated:x);
    if(JSON.stringify(next).length>window.MAKTABAH_COVERS.MAX_BOOKS_JSON)throw new Error('Ukuran koleksi terlalu besar untuk cover tambahan. Hapus cover lain atau simpan cadangan.');
    state.books=next;
    if(!mockSave()){
      state.books=prior;
      storage.set(BOOKS_KEY,JSON.stringify(prior));
      throw new Error('Ruang penyimpanan browser penuh. Cover tidak disimpan; coba gambar lebih kecil.');
    }
    renderBody();
    if(state.dialog?.type==='detail'&&state.dialog?.id===book.id) detail(updated);
    return updated;
  }
  function readerMarkup() {
    const r=state.viewer;if(!r)return '';
    return `<div class="reader-shade" role="dialog" aria-label="Baca PDF" aria-modal="true"><div class="reader-top"><button class="icon-btn" type="button" data-action="close-reader" aria-label="Kembali">${ico('chevron-left')}</button><div class="reader-title"><h2>${escape(r.book.title)}</h2><p>PEMBACA PDF ${r.book.total_volumes>1?'· JUZ/JILID '+r.book.current_volume+'/'+r.book.total_volumes+' ':''}· halaman tersimpan setelah berhasil ditampilkan</p></div><button class="icon-btn" type="button" data-action="close-reader" aria-label="Tutup pembaca">${ico('x')}</button></div><div class="reader-main" id="reader-main"><canvas class="reader-page" id="reader-canvas" role="img" aria-label="Halaman PDF ${r.page}"></canvas></div><div class="reader-bottom"><button type="button" class="btn btn-secondary" data-action="page-prev" ${r.page<=1?'disabled':''}>${ico('chevron-left')} Sebelumnya</button><div class="reader-page-num">${r.page} / ${r.total}</div><button type="button" class="btn btn-primary" data-action="page-next" ${r.page>=r.total?'disabled':''}>Berikutnya ${ico('chevron-right')}</button><span class="reader-tip">Gunakan tombol panah pada keyboard</span></div></div>`;
  }
  async function openReader(book, file=null) {
    if (!window.pdfjsLib) {toast('Pustaka pembaca PDF belum termuat. Periksa internet atau gunakan penanda halaman manual.');return;}
    if (!file && !url(book.pdf_url)) {toast('Tambahkan tautan PDF atau pilih file PDF dari perangkat.');return;}
    clearDialog();
    $('#dialog-root').innerHTML=`<div class="reader-shade"><div class="loading-state"><span class="loader"></span><p>Memuat PDF di perangkatmu...</p></div></div>`;
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const source=file?{data:new Uint8Array(await file.arrayBuffer())}:{url:url(book.pdf_url)};
      const doc=await pdfjsLib.getDocument(source).promise;
      if (!doc.numPages) throw new Error('Tidak ada halaman.');
      // A local PDF can automatically supply its first page as cover.
      if(file && !book.cover_url && window.MAKTABAH_COVERS) {
        try {
          const cover=await window.MAKTABAH_COVERS.fromLoadedPdf(doc);
          book=saveChosenCover(book,cover,doc.numPages);
        } catch(error) { console.warn('Cover otomatis dilewati:',error); }
      }
      Object.assign(book,window.MAKTABAH_VOLUMES.setDocumentPages(book,doc.numPages));
      mockSave();
      const r={book,pdf:doc,total:doc.numPages,page:Math.min(doc.numPages,Math.max(1,book.current_page||1)),renderEpoch:0,renderTask:null};
      state.viewer=r;
      renderReader();
    } catch(e) {
      clearDialog();
      toast('PDF tidak dapat dibaca langsung. Tautan Google Drive sering dibatasi browser. Pilih PDF dari perangkat atau tandai halaman manual.');
      console.warn('PDF tidak terbuka dalam pembaca web:',e);
    }
  }
  function renderReader() {
    const r=state.viewer;if(!r)return;
    const epoch=++r.renderEpoch;
    if(r.renderTask) {try {r.renderTask.cancel();}catch(_){}}
    $('#dialog-root').innerHTML=readerMarkup();
    document.body.style.overflow='hidden';
    const main=$('#reader-main');if(main)main.scrollTop=0;
    const pageNum=r.page;
    (async()=>{
      try {
        const page=await r.pdf.getPage(pageNum);
        if(state.viewer!==r||epoch!==r.renderEpoch)return;
        const canvas=$('#reader-canvas'),box=$('#reader-main');if(!canvas||!box)return;
        const original=page.getViewport({scale:1});
        const scale=Math.max(0.35,Math.min(2,(box.clientWidth-40)/original.width));
        const viewport=page.getViewport({scale});
        const ratio=Math.min(window.devicePixelRatio||1,2);
        canvas.width=Math.ceil(viewport.width*ratio);
        canvas.height=Math.ceil(viewport.height*ratio);
        canvas.style.width=viewport.width+'px';
        canvas.style.height=viewport.height+'px';
        const context=canvas.getContext('2d');
        const task=page.render({canvasContext:context,viewport,transform:ratio!==1?[ratio,0,0,ratio,0,0]:null});
        r.renderTask=task;
        await task.promise;
        if(state.viewer===r&&epoch===r.renderEpoch)await saveViewedPage(r.book,pageNum);
      } catch(e) {if(e?.name!=='RenderingCancelledException') {console.warn('Gagal merender PDF:',e);toast('Halaman PDF gagal ditampilkan.');}}
    })();
  }
  async function saveViewedPage(book,page) {
    try {
      const response=await api(`/api/books/${encodeURIComponent(book.id)}/progress`,'POST',{page,volume:book.current_volume,source:'auto'});
      const i=state.books.findIndex(b=>b.id===book.id);
      if(i!==-1)state.books[i]=response.book;
      if(state.viewer?.book.id===book.id)state.viewer.book=response.book;
    } catch(e) {toast('Progres belum tersimpan: '+e.message);}
  }
  function moveReader(dir) {
    const r=state.viewer;if(!r)return;
    const next=r.page+dir;
    if(next<1||next>r.total)return;
    r.page=next;renderReader();
  }
  function closeReader(){
    const r=state.viewer;
    if(r){r.renderEpoch++;try{r.renderTask?.cancel();}catch(_){} try{r.pdf?.destroy();}catch(_){}}
    state.viewer=null;document.body.style.overflow='';clearDialog();renderBody();
  }
  async function reloadBooks(){const response=await api('/api/books');state.books=response.books;renderBody();}
  function exportBackup(){
    const data={format:'maktabahrizqy-browser-backup',version:1,exported_at:new Date().toISOString(),books:state.books};
    const objectUrl=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const anchor=document.createElement('a');
    anchor.href=objectUrl;anchor.download='Maktabahrizqy_Cadangan_'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),5000);
    toast('Cadangan koleksi diunduh ke perangkatmu.');
  }
  function normalizedBackupBook(b,index){
    if(!b||typeof b!=='object'||Array.isArray(b))throw new Error('Format daftar bacaan tidak valid.');
    const title=String(b.title||'').slice(0,260).trim();if(!title)throw new Error('Judul kosong dalam cadangan.');
    const total=Math.max(0,Math.min(100000,Math.floor(Number(b.total_pages)||0)));
    const page=Math.max(0,Math.min(total||100000,Math.floor(Number(b.current_page)||0)));
    return window.MAKTABAH_KHATAM.normalize(window.MAKTABAH_VOLUMES.normalize({
      id:typeof b.id==='string' && /^[A-Za-z0-9_-]{3,120}$/.test(b.id) ? b.id : 'impor-'+index+'-'+(crypto.randomUUID?crypto.randomUUID():Date.now()),
      title,author:String(b.author||'').slice(0,200),kind:b.kind==='buku'?'buku':'kitab',
      fann:String(b.fann||'Belum Diklasifikasikan').slice(0,100),
      pdf_url:url(b.pdf_url)||'',cover_url:window.MAKTABAH_COVERS?.safeCover(b.cover_url)||url(b.cover_url)||'',notes:String(b.notes||'').slice(0,4000),
      total_pages:total,current_page:page,total_volumes:b.total_volumes,current_volume:b.current_volume,volume_progress:b.volume_progress,
      khatam_count:b.khatam_count,khatam_base:b.khatam_base,khatam_events:b.khatam_events,
      khatam_reset_at:b.khatam_reset_at,last_khatam_at:b.last_khatam_at,
      status:['belum','sedang','selesai'].includes(b.status)?b.status:(page?'sedang':'belum'),
      last_read_at:typeof b.last_read_at==='string'?b.last_read_at:null,
      created_at:typeof b.created_at==='string'?b.created_at:new Date().toISOString(),
      updated_at:new Date().toISOString(),drive_file_id:null
    }));
  }
  async function importBackup(file){
    if(!file)return;
    if(file.size>5*1024*1024){toast('Cadangan terlalu besar (maksimum 5 MB).');return;}
    try {
      const data=JSON.parse(await file.text());
      if(data?.format!=='maktabahrizqy-browser-backup'||data?.version!==1||!Array.isArray(data.books)||data.books.length>3000){throw new Error('Format cadangan tidak dikenali.');}
      const books=data.books.map(normalizedBackupBook);
      if(!window.confirm(`Ganti ${state.books.length} bacaan yang sekarang tersimpan di browser ini dengan ${books.length} bacaan dari cadangan? Jika belum dicadangkan, data lama akan hilang.`))return;
      const incomingIds=new Set(books.map(book=>book.id));
       for(const old of state.books)if(!incomingIds.has(old.id))recordDeleted(old.id);
       state.books=books;mockSave();clearDialog();renderBody();toast(`${books.length} bacaan berhasil dipulihkan di browser ini.`);
    }catch(e){toast(e.message||'Cadangan tidak dapat dibaca.');}
  }
  async function importPrivateLinks(file) {
    if(!file)return;
    if(file.size>1024*1024){toast('Berkas tautan terlalu besar (maksimum 1 MB).');return;}
    try {
      const data=JSON.parse(await file.text());
      if(data?.format!=='maktabahrizqy-private-drive-links'||data?.version!==1||!Array.isArray(data.links)||data.links.length>3000)throw new Error('Format tautan PDF tidak dikenali.');
      const links=new Map();
      for(const entry of data.links){
        if(typeof entry?.id!=='string' || typeof entry?.pdf_url!=='string')continue;
        const link=url(entry.pdf_url);
        if(!link || new URL(link).hostname!=='drive.google.com' || !/^\/file\/d\//.test(new URL(link).pathname))continue;
        links.set(entry.id,link);
      }
      const matches=state.books.filter(b=>links.has(b.id));
      if(!matches.length){toast('Tidak ada judul yang cocok. Periksa apakah katalog awal sudah tersedia.');return;}
      if(!window.confirm(`Tambahkan tautan PDF Drive untuk ${matches.length} judul? Tautan tidak diunggah ke GitHub; jika login Google aktif, tautan ikut tersinkron secara privat di Drive aplikasimu.`))return;
      let changed=0;
      state.books=state.books.map(b=>{
        const link=links.get(b.id);
        if(!link || b.pdf_url)return b; // Preserve links set manually.
        changed++;return {...b,pdf_url:link,updated_at:new Date().toISOString()};
      });
      mockSave();renderBody();toast(`${changed} tautan PDF tersimpan secara pribadi di browser ini.`);
    }catch(e){toast(e.message||'Berkas tautan PDF tidak dapat dibaca.');}
  }

  async function init() {
    setTheme(state.theme);
    setTextSize(state.textSize);
    $$('[data-icon]').forEach(el=>{el.innerHTML=ico(el.dataset.icon)});
    $('#demo-pill').hidden=true;
    try {
      state.me=await api('/api/me');

      $('#sidebar-user').textContent='Tersimpan di browser ini';
      await reloadBooks();
      if(window.MAKTABAH_CLOUD) {
        window.MAKTABAH_CLOUD.install({
          getBooks:()=>state.books,
          getDeleted:readDeletions,
          applyMerged:(books,deleted)=>{
            state.books=books.map(b=>window.MAKTABAH_KHATAM.normalize(window.MAKTABAH_VOLUMES.normalize(b)));
            storage.set(BOOKS_KEY,JSON.stringify(state.books));
            saveDeletions(deleted);
            renderBody();
          },
          onStatus:renderCloudStatus,
          onError:toast,
        });
      }
    }catch(e){$('#content').innerHTML=`<div class="empty-state"><h3>Tidak dapat memuat perpustakaan</h3><p>${escape(e.message)}</p><button type="button" class="btn btn-secondary" data-action="retry">Coba lagi</button></div>`;}
  }

  document.addEventListener('click', async event=>{
    if(event.target.closest('#cloud-login-btn')){window.MAKTABAH_CLOUD?.connect();return;}
    if(event.target.closest('#cloud-sync-btn')){await window.MAKTABAH_CLOUD?.syncNow();return;}
    if(event.target.closest('#cloud-logout-btn')){window.MAKTABAH_CLOUD?.disconnect();return;}
    if(event.target.closest('#settings-btn,#settings-top-btn')){openSettings();return;}
    if(event.target.closest('[data-settings-close]') || event.target.matches('[data-settings-dismiss="true"]')){closeSettings();return;}
    const themeOption=event.target.closest('[data-setting-theme]');
    if(themeOption){setTheme(themeOption.dataset.settingTheme);return;}
    const sizeOption=event.target.closest('[data-setting-size]');
    if(sizeOption){setTextSize(sizeOption.dataset.settingSize);return;}
    const settingsAction=event.target.closest('[data-settings-action]');
    if(settingsAction){
      const action=settingsAction.dataset.settingsAction;
      closeSettings();
      if(action==='backup')exportBackup();
      else if(action==='restore')$('#restore-file')?.click();
      else if(action==='sync'){
        document.body.classList.add('sidebar-open');
        const panel=$('.cloud-panel');panel?.scrollIntoView({behavior:'smooth',block:'nearest'});
        const btn=$('#cloud-sync-btn')?.hidden?$('#cloud-login-btn'):$('#cloud-sync-btn');
        btn?.focus();
      }
      return;
    }
    const sideGenre=event.target.closest('[data-side-category]');
    if(sideGenre){
      state.view='explore';state.query='';state.kind='Semua';state.category=sideGenre.dataset.sideCategory||'Semua';
      document.body.classList.remove('sidebar-open');renderBody();
      window.scrollTo({top:0,behavior:'instant'});
      return;
    }
    const shelfArrow=event.target.closest('[data-scroll-target]');
    if(shelfArrow){
      const area=document.getElementById(shelfArrow.dataset.scrollTarget);
      if(area)area.scrollBy({left:Number(shelfArrow.dataset.scrollDir||1)*Math.max(300,area.clientWidth*.8),behavior:'smooth'});
      return;
    }
    const nav=event.target.closest('[data-nav]');if(nav){go(nav.dataset.nav);return;}
    if(event.target.closest('#quick-search-btn')){go('explore');$('#search-input')?.focus();return;}
    if(event.target.closest('#theme-btn')){setTheme(state.theme==='dark'?'cream':'dark');return;}
    if(event.target.closest('#menu-btn')){document.body.classList.toggle('sidebar-open');return;}
    if(event.target.id==='mobile-shade'){document.body.classList.remove('sidebar-open');return;}
    if(event.target.closest('#add-btn')){if(state.me?.authenticated)bookForm();return;}
    if(event.target.closest('#backup-btn')){exportBackup();return;}
    if(event.target.closest('#restore-btn')){$('#restore-file').click();return;}
    const open=event.target.closest('[data-open]');
    if(open){const book=state.books.find(b=>b.id===open.dataset.open);detail(book);return;}
    if(event.target.matches('[data-dismiss="true"]')){clearDialog();return;}
    const category=event.target.closest('[data-category]');
    if(category){state.category=category.dataset.category;const input=$('#search-input');state.query=input?.value||state.query;renderBody();return;}
    const kind=event.target.closest('[data-kind]');if(kind){state.kind=kind.dataset.kind;renderBody();return;}
    const action=event.target.closest('[data-action]');if(!action)return;
    const a=action.dataset.action;const b=state.books.find(x=>x.id===action.dataset.id);
    if(a==='close'){clearDialog();return;}
    if(a==='add'){bookForm();return;}
    if(a==='retry'){init();return;}
    if(a==='backup'){exportBackup();return;}
    if(a==='import-drive-links'){$('#private-link-file').click();return;}
    if(a==='open-local'&&b){state.pendingFileBookId=b.id;$('#local-pdf-input').click();return;}
    if(a==='cover-pdf-local'&&b){state.pendingCoverPdfId=b.id;$('#cover-pdf-input').click();return;}
    if(a==='cover-image-local'&&b){state.pendingCoverImageId=b.id;$('#cover-image-input').click();return;}
    if(a==='cover-remove'&&b) {
      if(!window.confirm('Hapus cover pilihan untuk bacaan ini? Pratinjau Drive atau sampul teks tetap tersedia.'))return;
      try{saveChosenCover(b,'');toast('Cover pilihan dihapus.');}catch(error){toast(error.message);}
      return;
    }
    if(a==='cover-auto-link'&&b) {
      if(!window.MAKTABAH_COVERS){toast('Modul cover belum siap. Muat ulang halaman.');return;}
      toast('Mencoba membaca halaman pertama dari tautan PDF...');
      try{
        const result=await window.MAKTABAH_COVERS.fromPdfUrl(b.pdf_url);
        saveChosenCover(b,result.cover,result.pages);toast('Cover dari halaman pertama PDF berhasil disimpan.');
      }catch(error){toast(error.message||'PDF tidak dapat dibaca langsung. Gunakan PDF lokal.');}
      return;
    }
    if(a==='edit'&&b){bookForm(b);return;}
    if(a==='read'&&b){await openReader(b);return;}
    if(a==='close-reader'){closeReader();return;}
    if(a==='page-prev'){moveReader(-1);return;}
    if(a==='page-next'){moveReader(1);return;}
    if(a==='delete'&&b){
      if(!window.confirm(`Hapus "${b.title}" dari katalog? File PDF asli tidak akan dihapus.`))return;
      try {await api(`/api/books/${encodeURIComponent(b.id)}`,'DELETE');clearDialog();await reloadBooks();toast('Catatan dihapus dari katalog. PDF asli tetap aman.');}catch(e){toast(e.message);}return;
    }
    if(a==='open-maraji'){
      state.view='explore';state.query='';state.category=MARAJI;state.kind='Semua';
      document.body.classList.remove('sidebar-open');renderBody();window.scrollTo({top:0,behavior:'instant'});return;
    }
    if(a==='khatam-add'&&b){
      const current=window.MAKTABAH_KHATAM.normalize(b);
      // One-tap khatam: native window.confirm is suppressed in some mobile/in-app browsers.
      // Mistakes are corrected with "Sudah khatam (kali)" in Edit Bacaan.
      if(state.lastKhatamAt && Date.now()-state.lastKhatamAt<650)return;
      state.lastKhatamAt=Date.now();
      const before=state.books;
      try{
        const updated=window.MAKTABAH_KHATAM.add(current);
        state.books=state.books.map(x=>x.id===b.id?updated:x);
        if(!mockSave())throw new Error('Penyimpanan browser penuh; catatan khatam belum tersimpan.');
        detail(updated);renderBody();toast(`Alhamdulillah, sudah ${updated.khatam_count} kali khatam.`);
      }catch(err){state.books=before;storage.set(BOOKS_KEY,JSON.stringify(before));toast(err.message);}
      return;
    }
    if(a==='save-progress'&&b){
      const volume=Number($('#manual-volume')?.value);
      const page=Number($('#manual-page')?.value);
      const volumeCount=window.MAKTABAH_VOLUMES.countOf(b);
      const progress=window.MAKTABAH_VOLUMES.entriesOf(b)[String(volume)];
      const volumeTotal=Number(progress?.total_pages)||0;
      if(!Number.isInteger(volume)||volume<1||volume>volumeCount){toast('Nomor juz/jilid tidak valid.');return;}
      if(!Number.isInteger(page)||page<0||page>100000||(volumeTotal>0&&page>volumeTotal)){toast('Nomor halaman tidak valid untuk juz/jilid ini.');return;}
      try {const r=await api(`/api/books/${encodeURIComponent(b.id)}/progress`,'POST',{page,volume,source:'manual'});
        state.books=state.books.map(x=>x.id===b.id?r.book:x);detail(r.book);renderBody();toast('Progres Juz/Jilid '+volume+' tersimpan.');}
      catch(e){toast(e.message);}return;
    }
  });
  $('#private-link-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';await importPrivateLinks(file);
  });
  $('#restore-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';await importBackup(file);
  });
  $('#local-pdf-input').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';
    const book=state.books.find(x=>x.id===state.pendingFileBookId);
    state.pendingFileBookId=null;
    if(file&&book){if(!/\.pdf$/i.test(file.name)&&file.type!=='application/pdf'){toast('Pilih berkas PDF.');return;}await openReader(book,file);}
  });
  $('#cover-image-input').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';
    const book=state.books.find(x=>x.id===state.pendingCoverImageId);state.pendingCoverImageId=null;
    if(!file||!book)return;
    toast('Memproses gambar cover di perangkat...');
    try{const image=await window.MAKTABAH_COVERS.fromImageFile(file);saveChosenCover(book,image);toast('Cover lokal berhasil disimpan.');}
    catch(error){toast(error.message||'Cover gagal diproses.');}
  });
  $('#cover-pdf-input').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';
    const book=state.books.find(x=>x.id===state.pendingCoverPdfId);state.pendingCoverPdfId=null;
    if(!file||!book)return;
    toast('Membuat cover dari halaman pertama PDF...');
    try{const result=await window.MAKTABAH_COVERS.fromPdfFile(file);saveChosenCover(book,result.cover,result.pages);toast('Cover PDF halaman pertama berhasil disimpan.');}
    catch(error){toast(error.message||'PDF tidak dapat dijadikan cover.');}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='book-volume-total'||event.target.id==='book-volume-active'){
      if(!state.volumeFormDraft||!stashFormVolume()){
        if(event.target.id==='book-volume-active')event.target.value=String(state.volumeFormSelected||1);
        return;
      }
      selectFormVolume($('#book-volume-active').value,$('#book-volume-total').value);
    }
    if(event.target.id==='book-total'){
      const page=$('#book-page');
      if(page)page.max=String(Number(event.target.value)||100000);
    }
    if(event.target.id==='manual-volume')refreshManualVolumePreview(event.target);
  });
  function refreshManualVolumePreview(control){
    const id=state.dialog?.id;
    const book=state.books.find(b=>b.id===id);
    if(!book)return;
    const n=window.MAKTABAH_VOLUMES.normalize(book);
    const volume=Number(control.value);
    if(!Number.isInteger(volume)||volume<1||volume>n.total_volumes)return;
    const current=n.volume_progress[String(volume)]||{page:0,total_pages:0};
    const page=$('#manual-page'),hint=$('#manual-page-hint');
    if(page){page.value=String(current.page||0);page.max=String(current.total_pages||100000);}
    if(hint)hint.textContent=current.total_pages?'dari '+current.total_pages+' halaman':'belum ada total halaman';
  }
  document.addEventListener('input',event=>{
    // Number inputs emit input before blur; update the page field immediately.
    if(event.target.id==='manual-volume' && event.target.type==='number'){
      refreshManualVolumePreview(event.target);return;
    }
    if(event.target.id==='search-input'){
      const cursor=event.target.selectionStart;
      state.query=event.target.value;renderBody();
      const input=$('#search-input');input?.focus();if(input&&cursor!==null)input.setSelectionRange(cursor,cursor);
    }
  });
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='book-form')return;
    event.preventDefault();
    const form=event.target;const fd=new FormData(form);
    const data={title:String(fd.get('title')||'').trim(),author:String(fd.get('author')||'').trim(),kind:fd.get('kind'),fann:String(fd.get('fann')||''),pdf_url:String(fd.get('pdf_url')||''),cover_url:String(fd.get('cover_url')||''),total_pages:Number(fd.get('total_pages')||0),notes:String(fd.get('notes')||'')};
    const count=Number(fd.get('total_volumes')),active=Number(fd.get('current_volume'));
    if(!Number.isInteger(count)||count<1||count>999||!Number.isInteger(active)||active<1||active>count){toast('Jumlah atau nomor juz/jilid tidak valid.');return;}
    if(active!==state.volumeFormSelected) {
      if(!stashFormVolume())return;
      selectFormVolume(active,count);
    }
    if(!stashFormVolume())return;
    state.volumeFormDraft=window.MAKTABAH_VOLUMES.setActive(state.volumeFormDraft,{total_volumes:count,current_volume:active});
    const volumeData=state.volumeFormDraft;
    Object.assign(data,{
      total_volumes:volumeData.total_volumes,
      current_volume:volumeData.current_volume,
      volume_progress:volumeData.volume_progress,
      total_pages:volumeData.total_pages,
      current_page:volumeData.current_page
    });
    if(!data.title){toast('Judul bacaan wajib diisi.');return;}
    if((data.pdf_url&&!url(data.pdf_url))||(data.cover_url&&!url(data.cover_url))){toast('Tautan harus dimulai dengan https:// atau http://');return;}
    const requestedKhatam=Number(fd.get('khatam_count'));
    if(!Number.isInteger(requestedKhatam)||requestedKhatam<0||requestedKhatam>9999){toast('Jumlah khatam harus bilangan bulat 0 sampai 9.999.');return;}
    const editing=state.dialog?.id;
    const oldBook=editing?state.books.find(b=>b.id===editing):null;
    const khatamData=window.MAKTABAH_KHATAM.setCount(oldBook||{},requestedKhatam);
    Object.assign(data,{khatam_base:khatamData.khatam_base,khatam_events:khatamData.khatam_events,
      khatam_reset_at:khatamData.khatam_reset_at,khatam_count:khatamData.khatam_count,last_khatam_at:khatamData.last_khatam_at});
    if(editing){
      data.status=String(fd.get('status')||'belum');
      const previous=state.books.find(b=>b.id===editing);
      if(!data.cover_url && window.MAKTABAH_COVERS?.safeDataImage(previous?.cover_url))data.cover_url=previous.cover_url;
    }
    const submit=form.querySelector('button[type=submit]');submit.disabled=true;
    try {
      await api(editing?`/api/books/${encodeURIComponent(editing)}`:'/api/books',editing?'PATCH':'POST',data);
      clearDialog();await reloadBooks();toast(editing?'Perubahan bacaan disimpan.':'Bacaan berhasil ditambahkan.');
    }catch(e){toast(e.message);} finally{submit.disabled=false;}
  });
  document.addEventListener('error', event=>{
    if (event.target?.matches?.('.book-cover img')) event.target.remove();
  }, true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') {
      if(document.body.classList.contains('settings-open'))closeSettings();
      else if(state.viewer)closeReader();
      else if(state.dialog)clearDialog();
      else document.body.classList.remove('sidebar-open');
    }
    if(state.viewer&&event.key==='ArrowRight'){event.preventDefault();moveReader(1);}
    if(state.viewer&&event.key==='ArrowLeft'){event.preventDefault();moveReader(-1);}
  });
  let touchX=null;
  document.addEventListener('touchstart',event=>{if(state.viewer)touchX=event.touches[0].clientX;},{passive:true});
  document.addEventListener('touchend',event=>{if(!state.viewer||touchX===null)return;const delta=event.changedTouches[0].clientX-touchX;if(Math.abs(delta)>90)moveReader(delta<0?1:-1);touchX=null;},{passive:true});
  init();
})();