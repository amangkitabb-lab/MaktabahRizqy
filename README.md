# Maktabahrizqy

Perpustakaan kitab dan buku berbasis **GitHub Pages**, tanpa login, tanpa Railway, dan tanpa server aplikasi.

**Menu tetap:** Web Utama · Jelajahi Bacaan · Koleksi Ku. Desain responsif HP dan desktop; tema terang/gelap. Judul Arab tetap ditampilkan apa adanya ketika ditambahkan.

## Cara mengaktifkan website

Buka [panduan GitHub Pages](PANDUAN_GITHUB_PAGES.md). Di GitHub: **Settings → Pages → Deploy from a branch → main → /docs → Save**.

Situs akan tampil di `https://amangkitabb-lab.github.io/MaktabahRizqy/` setelah GitHub Pages selesai mengeluarkan deployment.

### Privasi dan penyimpanan

Website/repository **publik**. Setiap pengunjung mempunyai koleksi browser yang terpisah. Data katalog yang diisikan lewat antarmuka, tema, dan halaman terakhir disimpan melalui `localStorage` pada perangkat pengunjung, **bukan** ke GitHub atau database bersama. Gunakan tombol ekspor/impor cadangan agar data dapat dipindah manual antardevice. Jangan mengunggah PDF atau data pribadi ke repository publik.

### Pembaca PDF

- Pembaca web menggunakan PDF.js saat PDF diizinkan dibaca browser; progres otomatis tercatat setelah halaman berhasil tampil.
- Tautan Drive privat biasanya tidak dapat dibaca langsung. Pilih PDF dari perangkat untuk membaca secara lokal, atau catat halaman manual lalu buka link Drive biasa.
- PDF dipilih dari perangkat tidak diunggah ke GitHub.

**Kode backend OAuth/FastAPI lama (v0.2) hanya disimpan sebagai arsip dan tidak dijalankan oleh GitHub Pages.** [Baca arsip backend v0.2](ARSIP_BACKEND_v0.2.md).
