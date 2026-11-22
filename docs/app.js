/* Maktabahrizqy GitHub Pages v0.3 — browser-local catalogue, no account, no server. */
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
  };
  const ico = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
  const escape = (text) => String(text == null ? '' : text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = value => { try { const v = new URL(value); return ['http:', 'https:'].includes(v.protocol) ? v.href : ''; } catch { return ''; } };
  const displayTitle = {home:'Web Utama', explore:'Jelajahi Bacaan', collection:'Koleksi Ku'};
  const memoryStore = {};
  const storage = {
    get: key => {try {return window.localStorage.getItem(key) ?? memoryStore[key] ?? null} catch (_) {return memoryStore[key] ?? null}},
    set: (key,value) => {memoryStore[key] = value;try {window.localStorage.setItem(key,value)} catch (_) {}},
  };
  const FANN = ['Belum Diklasifikasikan', 'Fiqh', 'Aqidah', 'Mantiq', 'Nahwu', 'Sharaf', 'Ushul Fiqh', 'Kaidah Fiqh', 'Tafsir', 'Hadis', 'Tasawuf', 'Akhlak', 'Doa & Wirid', 'Faraidh', 'Tajwid', 'Balaghah', 'Sejarah', 'Bahasa Arab', 'Lainnya'];
  const demoBooks = [];
  const state = {
    preview: false,
    theme: storage.get('maktabah_theme') === 'dark' ? 'dark' : 'light',
    view:'home', books:[], query:'', category:'Semua', kind:'Semua',
    me:null, dialog:null, viewer:null, busy:false
  };

  const mockLoad = () => {
    try {
      const s = storage.get('maktabahrizqy_browser_books_v1');
      if (s) { const parsed = JSON.parse(s); if (Array.isArray(parsed)) return parsed; }
    } catch (_) {}
    return demoBooks.map(x => ({...x}));
  };
  const mockSave = () => storage.set('maktabahrizqy_browser_books_v1', JSON.stringify(state.books));
  async function api(path, method='GET', data) {
    if (PREVIEW) {
      if (path === '/api/me') return {authenticated:true,configured:false,email:'',csrf:''};
      if (path === '/api/books' && method === 'GET') return {books:mockLoad()};
      if (path === '/api/drive/sync') return {ok:true,created:0,scanned:0};
      if (path === '/api/logout') return {ok:true};
      const match = path.match(/^\/api\/books\/([^/]+)(\/progress)?$/);
      if (method === 'POST' && path === '/api/books') {
        const book={...data,id:'lokal-'+(crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-'+Math.random().toString(36).slice(2)),current_page:0,status:'belum',drive_file_id:null,last_read_at:null,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
        state.books.unshift(book); mockSave(); return {book};
      }
      if (match) {
        const b=state.books.find(x=>x.id===match[1]);
        if (!b) throw new Error('Bacaan tidak ditemukan.');
        if (method==='PATCH') Object.assign(b,data,{updated_at:new Date().toISOString()});
        if (method==='POST' && match[2]) {
          b.current_page=data.source==='auto'?Math.max(b.current_page||0,Number(data.page)||0):Number(data.page)||0;
          b.status= b.current_page===0?'belum':(b.total_pages && b.current_page>=b.total_pages?'selesai':'sedang');
          b.last_read_at=b.current_page?new Date().toISOString():null;
          b.updated_at=new Date().toISOString();
        }
        if (method==='DELETE') state.books=state.books.filter(x=>x.id!==b.id);
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
  function progressPct(book) {return book.total_pages > 0 ? Math.min(100,Math.max(0,Math.round(100 * book.current_page / book.total_pages))) : 0;}
  function progressMarkup(book) {const pct=progressPct(book);return `<div class="progress-rail"><progress value="${pct}" max="100" aria-label="Progres ${pct} persen"></progress></div><div class="progress-row"><span>${book.current_page?`Hal. ${book.current_page} ${book.total_pages?'/ '+book.total_pages:''}`:'Belum dimulai'}</span><span>${pct}%</span></div>`;}
  function coverMarkup(book, extra='') {
    const tone=[...book.title].reduce((a,c)=>a+c.charCodeAt(0),0)%6;
    const image = url(book.cover_url)||(book.drive_file_id&&!PREVIEW?`/api/books/${encodeURIComponent(book.id)}/cover`:'');
    const kind=book.kind==='buku'?'BUKU BACAAN':book.fann==='Belum Diklasifikasikan'?'KITAB':`FANN ${book.fann}`;
    const text=`<div class="book-cover-art"><span class="cover-overline">MAKTABAHRIZQY • ${escape(kind)}</span><span class="cover-title">${escape(book.title)}</span><span class="cover-ornament">❧</span></div>`;
    return `<div class="book-cover tone-${tone} ${extra}">${text}${image?`<img src="${escape(image)}" loading="lazy" alt="Sampul ${escape(book.title)}">`:''}</div>`;
  }
  function bookCard(book) {
    const status=book.status==='selesai'?'Selesai':book.status==='sedang'?'Sedang dibaca':'Belum dibaca';
    const kind=book.kind==='buku'?'Buku Bacaan':`Kitab · ${book.fann}`;
    return `<button type="button" class="book-card" data-open="${escape(book.id)}" aria-label="Lihat ${escape(book.title)}">${coverMarkup(book)}<span class="cover-status">${status}</span><div class="book-meta"><span class="card-overline">${escape(kind)}</span><span class="book-name">${escape(book.title)}</span><span class="book-author">${escape(book.author||'Pengarang belum dicatat')}</span>${progressMarkup(book)}</div></button>`;
  }
  const grid = books => books.length ? `<div class="book-grid">${books.map(bookCard).join('')}</div>` : emptyMarkup();
  function emptyMarkup(mode='list') {
    return `<div class="empty-state"><div class="empty-icon">${ico('book-open')}</div><h3>${mode==='list'?'Rak ini masih kosong':'Belum ada yang cocok'}</h3><p>${mode==='list'?'Tambahkan kitab atau buku pertamamu. Sampul dan tautan PDF bisa dilengkapi kapan saja.':'Coba ubah kata pencarian atau kategori yang kamu pilih.'}</p>${mode==='list'?`<button type="button" class="btn btn-primary" data-action="add">${ico('plus')} Tambah Bacaan</button>`:''}</div>`;
  }
  function pageHeader(title, subtitle, eyebrow='RUANG BACA') {return `<div class="page-heading"><div><div class="eyebrow">${escape(eyebrow)}</div><h1 class="page-title">${title}</h1><p class="page-subtitle">${escape(subtitle)}</p></div></div>`;}
  function stat(label,number,subtitle,icon) {return `<div class="stat"><div class="stat-head"><span>${label}</span>${ico(icon)}</div><div class="stat-num">${number}</div><div class="stat-bottom">${subtitle}</div></div>`;}
  function homeMarkup() {
    const list=state.books;
    const underway=list.filter(x=>x.status==='sedang');
    const finished=list.filter(x=>x.status==='selesai');
    const pages=list.reduce((a,b)=>a+(Number(b.current_page)||0),0);
    const recent=[...underway].sort((a,b)=>(b.last_read_at||'').localeCompare(a.last_read_at||''));
    const current=recent[0];
    const latest=[...list].sort((a,b)=>(b.updated_at||'').localeCompare(a.updated_at||'')).slice(0,4);
    return `
      ${pageHeader('Selamat datang di <em>rak bacamu.</em>','Ruang tenang untuk menyimpan, menemukan, dan melanjutkan setiap bacaan.','RAK DIGITALMU')}
      <section class="hero"><div class="hero-content"><div class="eyebrow">مكتبة رزقي • MAKTABAHRIZQY</div><h2 class="hero-title">Satu rak. <em>Seribu</em> pengetahuan.</h2><p class="hero-description">Simpan kitab dan buku pilihanmu. Kembali ke halaman terakhir, kapan pun kamu ingin melanjutkan.</p><button class="btn hero-action" type="button" data-nav="explore">Jelajahi Bacaan ${ico('arrow-right')}</button></div><div class="hero-art" aria-hidden="true"><div class="hero-card"><span class="arabic">اقرأ</span></div><span class="hero-vertical">READ · REFLECT · REMEMBER</span></div></section>
      <div class="stats">${stat('Total Koleksi',list.length,'Kitab & buku tercatat','layers')}${stat('Sedang Dibaca',underway.length,'Bacaan yang berjalan','book')}${stat('Selesai Dibaca',finished.length,'Bacaan tuntas','check')}${stat('Halaman Terbaca',pages.toLocaleString('id-ID'),'Terakumulasi di koleksi','clock')}</div>
      ${current?`<section class="section"><div class="section-head"><div><h2>Lanjutkan membaca</h2><p>Lanjut tepat dari tempat kamu berhenti.</p></div></div><div class="continue-panel">${coverMarkup(current)}<div class="continue-copy"><div class="eyebrow">BACAAN TERAKHIR</div><h3>${escape(current.title)}</h3><p>${escape(current.author||current.fann)}</p>${progressMarkup(current)}</div><button type="button" class="btn btn-primary" data-open="${escape(current.id)}">Lanjutkan ${ico('arrow-right')}</button></div></section>`:''}
      <section class="section"><div class="section-head"><div><h2>${list.length?'Baru di rakmu':'Mulai membangun rakmu'}</h2><p>${list.length?'Bacaan yang terakhir kamu simpan atau perbarui.':'Semua kitab dan buku nantinya tersusun rapi di sini.'}</p></div>${list.length?`<button class="plain-link" data-nav="collection" type="button">Lihat Koleksi Ku ${ico('arrow-up-right')}</button>`:''}</div>${grid(latest)}</section>`;
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
      <div class="section-head"><div><h2>Seluruh katalog</h2><p>${filtered.length} judul ditemukan · tersimpan pada perangkat ini</p></div><button type="button" class="plain-link" data-action="backup">${ico('download')} Ekspor Cadangan</button></div>
      ${filtered.length?grid(filtered):emptyMarkup(state.books.length?'search':'list')}`;
  }
  function collectionMarkup() {
    const visible=state.books.filter(b=>state.kind==='Semua'||(state.kind==='Kitab'?b.kind==='kitab':b.kind==='buku'));
    const groups={};
    visible.forEach(b=>{const key=b.kind==='buku'?'Buku Bacaan':`Kitab · Fann ${b.fann}`;(groups[key]||=[]).push(b);});
    const order=Object.keys(groups).sort((a,b)=>a==='Buku Bacaan'?1:b==='Buku Bacaan'?-1:a.localeCompare(b,'id'));
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
  function renderBody() {
    if (!state.me?.authenticated) return;
    $('#content').innerHTML=state.view==='home'?homeMarkup():state.view==='explore'?exploreMarkup():collectionMarkup();
    activateNav();
  }
  function go(view) {
    if (!(view in displayTitle) || !state.me?.authenticated) return;
    state.view=view;state.query='';state.category='Semua';state.kind='Semua';
    document.body.classList.remove('sidebar-open');renderBody();window.scrollTo({top:0,behavior:'instant'});
  }
  function setTheme(value) {
    state.theme=value; document.body.dataset.theme=value;
    storage.set('maktabah_theme',value);
    const btn=$('#theme-btn');
    btn.innerHTML=ico(value==='dark'?'sun':'moon');
    btn.setAttribute('aria-label',value==='dark'?'Aktifkan mode terang':'Aktifkan mode gelap');
  }
  function renderLogin() { // GitHub Pages never uses login.
    toast('Login tidak digunakan pada versi GitHub Pages.');
  }
  function clearDialog(){state.dialog=null;$('#dialog-root').innerHTML='';}
  const fannOptions=(current)=>FANN.map(f=>`<option value="${escape(f)}" ${f===current?'selected':''}>${escape(f)}</option>`).join('');
  function bookForm(book=null) {
    const edit=!!book;
    const b=book||{title:'',author:'',kind:'kitab',fann:'Belum Diklasifikasikan',total_pages:0,pdf_url:'',cover_url:'',notes:'',status:'belum'};
    state.dialog={type:'form',id:book?.id||null};
    $('#dialog-root').innerHTML=`<div class="modal-shade" data-dismiss="true"><div class="modal" role="dialog" aria-modal="true" aria-label="${edit?'Ubah':'Tambah'} Bacaan"><div class="modal-top"><div><div class="eyebrow">KATALOG DI PERANGKAT</div><h2 class="modal-title">${edit?'Ubah data bacaan':'Tambah bacaan baru'}</h2><p class="modal-sub">Judul wajib diisi. Sampul dan PDF boleh menyusul.</p></div><button class="icon-btn" data-action="close" type="button" aria-label="Tutup">${ico('x')}</button></div>
      <form id="book-form"><div class="form-grid">
        <div class="field wide"><label for="book-title">Judul kitab / buku *</label><input id="book-title" name="title" maxlength="260" required value="${escape(b.title)}" placeholder="Misalnya: Fathul Mu'in"></div>
        <div class="field"><label for="book-author">Pengarang</label><input id="book-author" name="author" maxlength="200" value="${escape(b.author)}" placeholder="Nama pengarang"></div>
        <div class="field"><label for="book-kind">Jenis bacaan</label><select id="book-kind" name="kind"><option value="kitab" ${b.kind==='kitab'?'selected':''}>Kitab</option><option value="buku" ${b.kind==='buku'?'selected':''}>Buku Bacaan</option></select></div>
        <div class="field"><label for="book-fann">Fann / kategori</label><select id="book-fann" name="fann">${fannOptions(b.fann)}</select></div>
        <div class="field"><label for="book-total">Jumlah halaman</label><input id="book-total" name="total_pages" type="number" min="0" max="100000" value="${Number(b.total_pages)||0}"></div>
        <div class="field wide"><label for="book-pdf">Tautan PDF (opsional)</label><input id="book-pdf" name="pdf_url" type="url" maxlength="1500" value="${escape(b.pdf_url)}" placeholder="https://drive.google.com/file/d/..."><span class="field-hint">Progres otomatis saat PDF berhasil ditampilkan di pembaca web. Untuk Google Drive privat gunakan halaman manual atau pilih PDF dari perangkat.</span></div>
        <div class="field wide"><label for="book-cover">Tautan gambar sampul (opsional)</label><input id="book-cover" name="cover_url" type="url" maxlength="1500" value="${escape(b.cover_url)}" placeholder="https://.../cover.jpg"></div>
        <div class="field wide"><label for="book-notes">Catatan pribadi</label><textarea id="book-notes" name="notes" maxlength="4000" placeholder="Catatan singkat tentang bacaan ini...">${escape(b.notes)}</textarea></div>
        ${edit?`<div class="field"><label for="book-status">Status</label><select id="book-status" name="status"><option value="belum" ${b.status==='belum'?'selected':''}>Belum dibaca</option><option value="sedang" ${b.status==='sedang'?'selected':''}>Sedang dibaca</option><option value="selesai" ${b.status==='selesai'?'selected':''}>Selesai</option></select></div>`:''}
      </div><div class="modal-actions"><button type="button" data-action="close" class="btn btn-ghost">Batal</button><button type="submit" class="btn btn-primary">${ico('check')} ${edit?'Simpan Perubahan':'Tambah ke Koleksi'}</button></div></form></div></div>`;
    setTimeout(()=>$('#book-title')?.focus(),80);
  }
  function detail(book) {
    if (!book) return;
    state.dialog={type:'detail',id:book.id};
    const links=[];
    const external=url(book.pdf_url);
    if (external) links.push(`<button type="button" class="btn btn-primary" data-action="read" data-id="${escape(book.id)}">${ico('book-open')} Baca dalam Web</button>`);
    links.push(`<button type="button" class="btn btn-secondary" data-action="open-local" data-id="${escape(book.id)}">${ico('upload')} Pilih PDF dari Perangkat</button>`);
    if (external) links.push(`<a href="${escape(external)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${ico('link')} Buka Tautan PDF ${ico('arrow-up-right')}</a>`);
    $('#dialog-root').innerHTML=`<div class="modal-shade" data-dismiss="true"><div class="modal" role="dialog" aria-modal="true" aria-label="Detail ${escape(book.title)}"><div class="modal-top"><div class="eyebrow">DETAIL BACAAN</div><button type="button" class="icon-btn" data-action="close" aria-label="Tutup">${ico('x')}</button></div><div class="detail-layout">${coverMarkup(book)}<div><div class="detail-topline">${escape(book.kind==='buku'?'BUKU BACAAN':'KITAB · FANN '+book.fann)}</div><h2 class="detail-name">${escape(book.title)}</h2><div class="detail-author">${escape(book.author||'Pengarang belum dicatat')}</div><div class="detail-chips"><span class="detail-chip">${escape(book.status==='belum'?'Belum dibaca':book.status==='sedang'?'Sedang dibaca':'Selesai')}</span><span class="detail-chip">${book.total_pages?'Total '+book.total_pages+' halaman':'Halaman belum diketahui'}</span></div>${progressMarkup(book)}${book.notes?`<p class="detail-note">${escape(book.notes)}</p>`:''}<div class="detail-actions">${links.join('')}</div><p class="field-hint">PDF tidak diunggah ke situs. Progres otomatis berlaku hanya jika PDF berhasil dirender di sini; pembukaan tautan eksternal tidak dapat dilacak.</p></div></div>
    <div class="detail-progress"><h4>Tandai halaman terakhir secara manual</h4><div class="progress-inline"><span>Halaman</span><input type="number" id="manual-page" min="0" max="${book.total_pages||100000}" value="${book.current_page}" aria-label="Halaman terakhir dibaca"><span>${book.total_pages?'dari '+book.total_pages+' halaman':'belum ada total halaman'}</span><button type="button" class="btn btn-secondary" data-action="save-progress" data-id="${escape(book.id)}">${ico('check')} Simpan Progres</button></div></div>
    <div class="modal-actions"><button type="button" class="btn btn-danger" data-action="delete" data-id="${escape(book.id)}">${ico('trash')} Hapus dari Katalog</button><button type="button" class="btn btn-secondary" data-action="edit" data-id="${escape(book.id)}">${ico('edit')} Ubah Data</button></div></div></div>`;
  }
  function readerMarkup() {
    const r=state.viewer;if(!r)return '';
    return `<div class="reader-shade" role="dialog" aria-label="Baca PDF" aria-modal="true"><div class="reader-top"><button class="icon-btn" type="button" data-action="close-reader" aria-label="Kembali">${ico('chevron-left')}</button><div class="reader-title"><h2>${escape(r.book.title)}</h2><p>PEMBACA PDF · halaman tersimpan setelah berhasil ditampilkan</p></div><button class="icon-btn" type="button" data-action="close-reader" aria-label="Tutup pembaca">${ico('x')}</button></div><div class="reader-main" id="reader-main"><canvas class="reader-page" id="reader-canvas" role="img" aria-label="Halaman PDF ${r.page}"></canvas></div><div class="reader-bottom"><button type="button" class="btn btn-secondary" data-action="page-prev" ${r.page<=1?'disabled':''}>${ico('chevron-left')} Sebelumnya</button><div class="reader-page-num">${r.page} / ${r.total}</div><button type="button" class="btn btn-primary" data-action="page-next" ${r.page>=r.total?'disabled':''}>Berikutnya ${ico('chevron-right')}</button><span class="reader-tip">Gunakan tombol panah pada keyboard</span></div></div>`;
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
      book.total_pages=doc.numPages;
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
      const response=await api(`/api/books/${encodeURIComponent(book.id)}/progress`,'POST',{page,source:'auto'});
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
    return {
      id:'impor-'+index+'-'+(crypto.randomUUID?crypto.randomUUID():Date.now()),
      title,author:String(b.author||'').slice(0,200),kind:b.kind==='buku'?'buku':'kitab',
      fann:String(b.fann||'Belum Diklasifikasikan').slice(0,100),
      pdf_url:url(b.pdf_url)||'',cover_url:url(b.cover_url)||'',notes:String(b.notes||'').slice(0,4000),
      total_pages:total,current_page:page,status:['belum','sedang','selesai'].includes(b.status)?b.status:(page?'sedang':'belum'),
      last_read_at:typeof b.last_read_at==='string'?b.last_read_at:null,
      created_at:typeof b.created_at==='string'?b.created_at:new Date().toISOString(),
      updated_at:new Date().toISOString(),drive_file_id:null
    };
  }
  async function importBackup(file){
    if(!file)return;
    if(file.size>5*1024*1024){toast('Cadangan terlalu besar (maksimum 5 MB).');return;}
    try {
      const data=JSON.parse(await file.text());
      if(data?.format!=='maktabahrizqy-browser-backup'||data?.version!==1||!Array.isArray(data.books)||data.books.length>3000){throw new Error('Format cadangan tidak dikenali.');}
      const books=data.books.map(normalizedBackupBook);
      if(!window.confirm(`Ganti ${state.books.length} bacaan yang sekarang tersimpan di browser ini dengan ${books.length} bacaan dari cadangan? Jika belum dicadangkan, data lama akan hilang.`))return;
      state.books=books;mockSave();clearDialog();renderBody();toast(`${books.length} bacaan berhasil dipulihkan di browser ini.`);
    }catch(e){toast(e.message||'Cadangan tidak dapat dibaca.');}
  }
  async function init() {
    setTheme(state.theme);
    $$('[data-icon]').forEach(el=>{el.innerHTML=ico(el.dataset.icon)});
    $('#demo-pill').hidden=true;
    try {
      state.me=await api('/api/me');

      $('#sidebar-user').textContent='Tersimpan di browser ini';
      await reloadBooks();
    }catch(e){$('#content').innerHTML=`<div class="empty-state"><h3>Tidak dapat memuat perpustakaan</h3><p>${escape(e.message)}</p><button type="button" class="btn btn-secondary" data-action="retry">Coba lagi</button></div>`;}
  }

  document.addEventListener('click', async event=>{
    const nav=event.target.closest('[data-nav]');if(nav){go(nav.dataset.nav);return;}
    if(event.target.closest('#theme-btn')){setTheme(state.theme==='dark'?'light':'dark');return;}
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
    if(a==='open-local'&&b){state.pendingFileBookId=b.id;$('#local-pdf-input').click();return;}
    if(a==='edit'&&b){bookForm(b);return;}
    if(a==='read'&&b){await openReader(b);return;}
    if(a==='close-reader'){closeReader();return;}
    if(a==='page-prev'){moveReader(-1);return;}
    if(a==='page-next'){moveReader(1);return;}
    if(a==='delete'&&b){
      if(!window.confirm(`Hapus "${b.title}" dari katalog? File PDF asli tidak akan dihapus.`))return;
      try {await api(`/api/books/${encodeURIComponent(b.id)}`,'DELETE');clearDialog();await reloadBooks();toast('Catatan dihapus dari katalog. PDF asli tetap aman.');}catch(e){toast(e.message);}return;
    }
    if(a==='save-progress'&&b){
      const page=Number($('#manual-page')?.value);
      if(!Number.isInteger(page)||page<0||(b.total_pages>0&&page>b.total_pages)){toast('Nomor halaman tidak valid.');return;}
      try {const r=await api(`/api/books/${encodeURIComponent(b.id)}/progress`,'POST',{page,source:'manual'});
        state.books=state.books.map(x=>x.id===b.id?r.book:x);detail(r.book);renderBody();toast('Progres bacaan tersimpan.');}
      catch(e){toast(e.message);}return;
    }
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
  document.addEventListener('input',event=>{
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
    if(!data.title){toast('Judul bacaan wajib diisi.');return;}
    if((data.pdf_url&&!url(data.pdf_url))||(data.cover_url&&!url(data.cover_url))){toast('Tautan harus dimulai dengan https:// atau http://');return;}
    const editing=state.dialog?.id;
    if(editing)data.status=String(fd.get('status')||'belum');
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
    if(event.key==='Escape') {if(state.viewer)closeReader();else if(state.dialog)clearDialog();else document.body.classList.remove('sidebar-open');}
    if(state.viewer&&event.key==='ArrowRight'){event.preventDefault();moveReader(1);}
    if(state.viewer&&event.key==='ArrowLeft'){event.preventDefault();moveReader(-1);}
  });
  let touchX=null;
  document.addEventListener('touchstart',event=>{if(state.viewer)touchX=event.touches[0].clientX;},{passive:true});
  document.addEventListener('touchend',event=>{if(!state.viewer||touchX===null)return;const delta=event.changedTouches[0].clientX-touchX;if(Math.abs(delta)>90)moveReader(delta<0?1:-1);touchX=null;},{passive:true});
  init();
})();
