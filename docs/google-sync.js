/* Maktabahrizqy Cloud Sync v0.7: Google Identity Services + private Drive appDataFolder.
 * OAuth access tokens only live in memory. No server, database, or client secret.
 */
(() => {
  'use strict';

  const API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
  const USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo';
  const SCOPE_DATA = 'https://www.googleapis.com/auth/drive.appdata';
  const SCOPE_EMAIL = 'https://www.googleapis.com/auth/userinfo.email';
  const FILE_NAME = 'maktabahrizqy-collection-v1.json';
  const LOCK_KEY = 'maktabahrizqy_cloud_account_lock_v1';
  const MAX_BOOKS = 5000;
  const DEFAULT_STATUS = 'Belum masuk Google. Koleksi tetap tersimpan di browser.';
  const config = window.MAKTABAH_GOOGLE_CONFIG || {};
  const clientId = String(config.clientId || '').trim();
  const ownerEmail = String(config.ownerEmail || '').trim().toLowerCase();

  let hooks = null;
  let token = '';
  let expiresAt = 0;
  let email = '';
  let fileId = '';
  let busy = false;
  let pending = false;
  let changes = 0;
  let timer = null;
  let tokenClient = null;
  let status = DEFAULT_STATUS;

  const configured = () => /^[\w.-]+\.apps\.googleusercontent\.com$/.test(clientId);
  const connected = () => Boolean(token) && Date.now() < expiresAt;
  const localGet = (key) => { try { return localStorage.getItem(key) || ''; } catch (_) { return ''; } };
  const localSet = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const timestamp = (value) => { const n = Date.parse(value || ''); return Number.isFinite(n) ? n : 0; };
  const validRecord = (book) => Boolean(book && typeof book === 'object' && !Array.isArray(book) && typeof book.id === 'string' && book.id.length <= 150 && typeof book.title === 'string' && book.title.length <= 500);
  const formatDate = (value) => new Date(Number(value)).toISOString();

  function announce(message) {
    status = message;
    hooks?.onStatus?.({configured:configured(), connected:connected(), email, busy, message});
  }
  function fail(error) {
    announce(`Sinkronisasi belum selesai: ${error.message || error}`);
    hooks?.onError?.(String(error.message || error));
  }
  function tokenExpired() {
    token = ''; expiresAt = 0; fileId = '';
    announce('Sesi Google berakhir. Login lagi untuk menyinkronkan.');
  }
  async function googleRequest(endpoint, options = {}) {
    if (!connected()) { tokenExpired(); throw new Error('Sesi Google telah berakhir. Login ulang.'); }
    const response = await fetch(endpoint, {
      ...options,
      headers: {'Authorization':`Bearer ${token}`, ...(options.headers || {})},
    });
    if (response.status === 401) { tokenExpired(); throw new Error('Sesi Google telah berakhir. Login ulang.'); }
    if (!response.ok) {
      let desc = '';
      try { const body = await response.json(); desc = body?.error?.message || ''; } catch (_) {}
      throw new Error(`Google Drive ${response.status}${desc ? ': ' + desc : ''}`);
    }
    return response;
  }

  function getLocal() {
    const books = hooks?.getBooks?.() || [];
    const deleted = hooks?.getDeleted?.() || {};
    return {books:Array.isArray(books) ? books.filter(validRecord) : [], deleted:deleted && typeof deleted === 'object' && !Array.isArray(deleted) ? deleted : {}};
  }

  function isDefaultSeed(b) {
    if (!String(b?.id || '').startsWith('mb-')) return false;
    return !b.pdf_url && !b.cover_url && !b.author && !b.notes && !Number(b.current_page) && !Number(b.total_pages) && Number(b.total_volumes || 1) === 1 &&
      !Object.values(b.volume_progress||{}).some(p=>Number(p?.page)>0||Number(p?.total_pages)>0) &&
      (!b.status || b.status === 'belum');
  }

  function mergeBooks(local, remote) {
    const output = new Map();
    const order = [];
    const seen = new Set();
    const pushOrder = (b) => { if (!seen.has(b.id)) { seen.add(b.id); order.push(b.id); } };
    const localList = (local.books || []).filter(validRecord).slice(0, MAX_BOOKS);
    const remoteList = (remote.books || []).filter(validRecord).slice(0, MAX_BOOKS);
    for (const b of localList) { output.set(b.id, {...b}); pushOrder(b); }
    for (const b of remoteList) {
      pushOrder(b);
      const prior = output.get(b.id);
      if (!prior) { output.set(b.id, {...b}); continue; }
      // Seed records generated separately on two devices have different timestamps.
      // Never allow an untouched seed to overwrite a recorded reading or PDF link.
      const localIsSeed = isDefaultSeed(prior);
      const remoteIsSeed = isDefaultSeed(b);
      let newer, older;
      if (localIsSeed !== remoteIsSeed) [newer, older] = localIsSeed ? [b, prior] : [prior, b];
      else [newer, older] = timestamp(b.updated_at) > timestamp(prior.updated_at) ? [b, prior] : [prior, b];
      const merged = {...older, ...newer};
      // A page update on one device should not silently erase a private PDF link on another.
      for (const field of ['pdf_url', 'cover_url', 'author', 'notes']) {
        if (!merged[field] && older[field]) merged[field] = older[field];
      }
      if (!Number(merged.total_pages) && Number(older.total_pages)) merged.total_pages = older.total_pages;
      if (!Number(merged.current_page) && Number(older.current_page) && newer.status === 'belum' && !remoteIsSeed && !localIsSeed) {
        // Respect an explicit reset made later by a user. Only seed detection overrides defaults.
      } else if (!Number(merged.current_page) && Number(older.current_page) && (localIsSeed || remoteIsSeed)) {
        merged.current_page = older.current_page;
        merged.status = older.status;
        merged.last_read_at = older.last_read_at;
      }
      const withJilid=window.MAKTABAH_VOLUMES ? window.MAKTABAH_VOLUMES.mergeVolumes(older,newer,merged) : merged;
      output.set(b.id, withJilid);
    }
    const deleted = Object.create(null);
    for (const source of [remote.deleted, local.deleted]) {
      if (!source || typeof source !== 'object' || Array.isArray(source)) continue;
      for (const [id, value] of Object.entries(source)) {
        if (typeof id !== 'string' || id.length > 150 || !Number.isFinite(timestamp(value))) continue;
        if (timestamp(value) > timestamp(deleted[id])) deleted[id] = String(value);
      }
    }
    const result = [];
    for (const id of order) {
      const b = output.get(id);
      const deletedAt = timestamp(deleted[id]);
      const modified = timestamp(b.updated_at) || timestamp(b.created_at);
      if (deletedAt && (deletedAt >= modified || isDefaultSeed(b))) continue;
      if (deletedAt && modified > deletedAt) delete deleted[id];
      result.push(b);
    }
    if (result.length > MAX_BOOKS) throw new Error('Koleksi terlalu besar untuk sinkronisasi otomatis.');
    return {version:1, format:'maktabahrizqy-cloud-collection', books:result, deleted};
  }

  function parseCloud(value) {
    if (value == null) return {books:[], deleted:{}};
    if (!value || value.format !== 'maktabahrizqy-cloud-collection' || value.version !== 1 || !Array.isArray(value.books) || value.books.length > MAX_BOOKS) {
      throw new Error('Format cadangan Google Drive tidak dikenal. Data lama tidak akan ditimpa.');
    }
    return {books:value.books.filter(validRecord), deleted:value.deleted || {}};
  }

  async function findCloudFile() {
    if (fileId) return fileId;
    const query = new URLSearchParams({
      spaces:'appDataFolder',
      q:`name = '${FILE_NAME}' and 'appDataFolder' in parents and trashed = false`,
      fields:'nextPageToken,files(id,name,modifiedTime)',
      pageSize:'100',
    });
    const response = await googleRequest(`${API}?${query.toString()}`);
    const result = await response.json();
    const files = Array.isArray(result.files) ? result.files : [];
    if (result.nextPageToken) throw new Error('Ada terlalu banyak file sinkronisasi. Diperlukan pemeriksaan manual.');
    if (files.length > 1) throw new Error('Ada lebih dari satu cadangan Google yang sama. Tidak ada yang ditimpa.');
    fileId = files[0]?.id || '';
    return fileId;
  }

  async function fetchRemote(id) {
    if (!id) return {books:[], deleted:{}};
    const response = await googleRequest(`${API}/${encodeURIComponent(id)}?alt=media`);
    const body = await response.json();
    return parseCloud(body);
  }

  async function createRemote(content) {
    const boundary = `maktabah_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const metadata = {name:FILE_NAME, mimeType:'application/json', parents:['appDataFolder']};
    const multipart = [
      `--${boundary}`, 'Content-Type: application/json; charset=UTF-8', '',
      JSON.stringify(metadata), `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8', '', content,
      `--${boundary}--`, '',
    ].join('\r\n');
    const response = await googleRequest(`${UPLOAD}?uploadType=multipart&fields=id,name`, {
      method:'POST', headers:{'Content-Type':`multipart/related; boundary=${boundary}`}, body:multipart,
    });
    const body = await response.json();
    if (!body.id) throw new Error('Google Drive tidak mengembalikan ID berkas sinkronisasi.');
    fileId = body.id;
  }

  async function updateRemote(id, content) {
    await googleRequest(`${UPLOAD}/${encodeURIComponent(id)}?uploadType=media`, {
      method:'PATCH', headers:{'Content-Type':'application/json'}, body:content,
    });
  }

  async function syncNow() {
    if (!connected()) { tokenExpired(); return false; }
    if (busy) { pending = true; return false; }
    busy = true;
    announce('Menyinkronkan dengan Google Drive...');
    try {
      const id = await findCloudFile();
      const remote = await fetchRemote(id);
      const local = getLocal();
      const merged = mergeBooks(local, remote);
      const versionAtWrite = changes;
      const content = JSON.stringify({...merged, updated_at:new Date().toISOString()});
      if (content.length > 4.5 * 1024 * 1024) throw new Error('Koleksi melebihi batas sinkronisasi. Simpan cadangan JSON.');
      if (id) await updateRemote(id, content);
      else await createRemote(content);
      if (versionAtWrite === changes) hooks?.applyMerged?.(merged.books, merged.deleted);
      else pending = true;
      announce(`Tersinkron dengan Google (${email}). ${merged.books.length} bacaan.`);
      return true;
    } catch (error) { fail(error); return false; }
    finally {
      busy = false;
      if (pending && connected()) {
        pending = false;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { void syncNow(); }, 1800);
      }
    }
  }

  function notifyLocalChange() {
    changes += 1;
    if (!connected()) return;
    if (timer) clearTimeout(timer);
    if (busy) { pending = true; return; }
    announce('Ada perubahan lokal. Menyiapkan sinkronisasi...');
    timer = setTimeout(() => { void syncNow(); }, 1700);
  }

  function connect() {
    if (!configured()) {
      announce('Login Google belum aktif. OAuth Client ID perlu ditambahkan oleh pemilik situs.');
      hooks?.onError?.('Login Google belum diatur. Buka PANDUAN_LOGIN_GOOGLE.md pada repositori GitHub.');
      return;
    }
    if (!window.google?.accounts?.oauth2?.initTokenClient) {
      hooks?.onError?.('Pustaka login Google belum siap. Periksa koneksi internet atau pemblokir skrip.');
      return;
    }
    if (connected()) { void syncNow(); return; }
    announce('Meminta izin akses terbatas ke Google Drive...');
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id:clientId,
        scope:`${SCOPE_DATA} ${SCOPE_EMAIL}`,
        callback: async (response) => {
          if (response?.error || !response?.access_token) {
            fail(new Error(response?.error_description || response?.error || 'Google tidak memberikan token.'));
            return;
          }
          if (!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPE_DATA, SCOPE_EMAIL)) {
            fail(new Error('Izin penyimpanan aplikasi dan email belum lengkap.'));
            return;
          }
          token = response.access_token;
          expiresAt = Date.now() + Math.max(60, Number(response.expires_in || 3600) - 45) * 1000;
          try {
            const userResponse = await googleRequest(USERINFO);
            const user = await userResponse.json();
            const actual = String(user.email || '').trim().toLowerCase();
            if (!actual || user.email_verified === false) throw new Error('Identitas Google belum terverifikasi.');
            const lock = localGet(LOCK_KEY).trim().toLowerCase();
            if ((ownerEmail && actual !== ownerEmail) || (lock && lock !== actual)) {
              throw new Error('Akun Google berbeda dari akun penyimpanan yang sudah dipakai di browser ini. Gunakan akun yang sama untuk menghindari tercampurnya koleksi.');
            }
            email = actual;
            fileId = '';
            // Lock the local device to this cloud account before first upload.
            localSet(LOCK_KEY, actual);
            await syncNow();
          } catch (error) {
            fail(error);
            token = ''; expiresAt = 0; email = '';
            announce('Login Google dibatalkan. Koleksi lokal tidak berubah.');
          }
        },
        error_callback: (response) => { fail(new Error(response?.message || response?.type || 'Jendela login Google gagal dibuka.')); },
      });
      tokenClient.requestAccessToken({prompt:'select_account'});
    } catch (error) { fail(error); }
  }

  function disconnect() {
    if (timer) { clearTimeout(timer); timer = null; }
    pending = false;
    const oldToken = token;
    token = ''; expiresAt = 0; email = ''; fileId = '';
    if (oldToken && window.google?.accounts?.oauth2?.revoke) {
      try { window.google.accounts.oauth2.revoke(oldToken, () => {}); } catch (_) {}
    }
    announce('Keluar dari Google. Koleksi di browser tetap tersedia.');
  }

  function install(callbacks) {
    hooks = callbacks;
    announce(configured() ? DEFAULT_STATUS : 'Perlu konfigurasi OAuth Client ID agar bisa login Google.');
  }

  window.MAKTABAH_CLOUD = {
    install, connect, disconnect, syncNow, notifyLocalChange,
    isConfigured:configured,
    // Pure function used by offline regression tests; contains no credentials.
    _mergeForTests:mergeBooks,
  };
})();