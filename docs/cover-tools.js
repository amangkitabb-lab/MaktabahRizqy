/* Maktabahrizqy v0.6: private, browser-generated cover thumbnails.
 * Never embeds Drive file IDs in published source; Drive preview is best-effort.
 * Local covers are compact data URLs, so existing cloud appData sync can carry them.
 */
(() => {
  'use strict';
  const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
  const MAX_PDF_BYTES = 95 * 1024 * 1024;
  const MAX_DATA_URL = 21000;
  const MAX_BOOKS_JSON = 3.8 * 1024 * 1024;

  const webUrl = input => {
    try {
      const u = new URL(String(input || ''));
      return ['https:', 'http:'].includes(u.protocol) ? u.href : '';
    } catch (_) { return ''; }
  };
  function safeDataImage(input) {
    return typeof input === 'string' && input.length <= MAX_DATA_URL &&
      /^data:image\/(?:webp|jpeg|png);base64,[a-zA-Z0-9+/=]+$/.test(input) ? input : '';
  }
  function safeCover(input) { return safeDataImage(input) || webUrl(input); }
  function driveFileId(input) {
    const raw = webUrl(input);
    if (!raw) return '';
    const u = new URL(raw);
    if (u.hostname !== 'drive.google.com' && u.hostname !== 'www.drive.google.com') return '';
    const match = u.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{20,})(?:\/|$)/);
    if (match) return match[1];
    const id = u.searchParams.get('id') || '';
    return /^[-_A-Za-z0-9]{20,}$/.test(id) && /^(?:\/open|\/uc)$/.test(u.pathname) ? id : '';
  }
  function bestEffortThumbnail(input) {
    const id = driveFileId(input);
    return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w400` : '';
  }
  function coverSrc(book) {
    const own = safeCover(book?.cover_url);
    // The personal Maraji' shelf deliberately has no automatic Drive thumbnails.
    // The owner selects the cover locally for each reference.
    if (book?.fann === "Maraji' Fiqh Travelling") return own || '';
    return own || bestEffortThumbnail(book?.pdf_url);
  }
  function ensurePdfJs() {
    if (!window.pdfjsLib?.getDocument) throw new Error('Pembaca PDF belum termuat. Muat ulang halaman dan periksa internet.');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return window.pdfjsLib;
  }
  function shrink(source) {
    if (!source?.width || !source?.height) throw new Error('Gambar sampul kosong.');
    const maxWidths = [280, 245, 210, 180, 160, 145, 130];
    const qualities = [0.72, 0.58, 0.45, 0.32];
    for (const width of maxWidths) {
      const ratio = Math.min(1, width / source.width, 390 / source.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(source.width * ratio));
      canvas.height = Math.max(1, Math.round(source.height * ratio));
      const ctx = canvas.getContext('2d', {alpha:false});
      if (!ctx) throw new Error('Perangkat tidak dapat membuat gambar sampul.');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      for (const quality of qualities) {
        // Browsers without WebP canvas support may return PNG; use JPEG instead.
        let result = canvas.toDataURL('image/webp', quality);
        if (!result.startsWith('data:image/webp;')) result = canvas.toDataURL('image/jpeg', quality);
        if (safeDataImage(result)) return result;
      }
    }
    throw new Error('Gambar terlalu kompleks untuk disimpan sebagai cover ringkas. Pilih gambar yang lebih sederhana.');
  }
  async function fromImageFile(file) {
    if (!file) throw new Error('Pilih berkas gambar.');
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Gambar terlalu besar. Maksimum 12 MB.');
    if (!/\.(jpe?g|png|webp)$/i.test(file.name || '') && !/^(image\/jpeg|image\/png|image\/webp)$/.test(file.type || '')) {
      throw new Error('Pilih cover JPG, PNG, atau WebP (bukan SVG).');
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Gambar tidak dapat dibuka.'));
        image.src = objectUrl;
      });
      return shrink(img);
    } finally { URL.revokeObjectURL(objectUrl); }
  }
  async function fromLoadedPdf(pdf) {
    if (!pdf?.numPages) throw new Error('PDF kosong atau belum terbuka.');
    const page = await pdf.getPage(1);
    const size = page.getViewport({scale:1});
    const scale = Math.min(1.7, 360 / size.width, 490 / size.height);
    const viewport = page.getViewport({scale:Math.max(0.1, scale)});
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const ctx = canvas.getContext('2d', {alpha:false});
    if (!ctx) throw new Error('Canvas tidak tersedia.');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
    const render = page.render({canvasContext:ctx,viewport});
    await render.promise;
    try { return shrink(canvas); }
    finally { try { page.cleanup(); } catch (_) {} }
  }
  async function fromPdfFile(file) {
    if (!file) throw new Error('Pilih berkas PDF.');
    if (file.size > MAX_PDF_BYTES) throw new Error('PDF lebih dari 95 MB. Gunakan cover JPG/PNG lokal.');
    if (!/\.pdf$/i.test(file.name || '') && file.type !== 'application/pdf') throw new Error('Pilih berkas PDF.');
    const lib = ensurePdfJs();
    const pdf = await lib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
    try { return {cover: await fromLoadedPdf(pdf), pages:pdf.numPages}; }
    finally { await pdf.destroy(); }
  }
  async function fromPdfUrl(source) {
    const external = webUrl(source);
    if (!external) throw new Error('Tambahkan tautan PDF yang valid dahulu.');
    if (driveFileId(external)) {
      throw new Error('PDF Drive privat tidak bisa dibaca otomatis dengan izin Google saat ini. Pratinjau Drive dicoba di rak; untuk menyimpan cover asli, pilih PDF dari perangkat.');
    }
    const lib=ensurePdfJs();
    const pdf=await lib.getDocument({url:external,withCredentials:false}).promise;
    try { return {cover:await fromLoadedPdf(pdf),pages:pdf.numPages}; }
    finally { await pdf.destroy(); }
  }
  window.MAKTABAH_COVERS = {
    safeCover, safeDataImage, driveFileId, bestEffortThumbnail, coverSrc,
    fromImageFile, fromPdfFile, fromLoadedPdf, fromPdfUrl,
    MAX_BOOKS_JSON, MAX_DATA_URL,
  };
})();