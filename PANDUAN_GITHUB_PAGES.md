# Maktabahrizqy — GitHub Pages (v0.3)

Website perpustakaan pribadi tanpa login dan tanpa Railway. **Tiga menu utama tetap**: **Web Utama**, **Jelajahi Bacaan**, **Koleksi Ku**. Antarmuka responsif dan tema terang/gelap.

## Publikasi (pemilik repositori)

1. Buka `https://github.com/amangkitabb-lab/MaktabahRizqy/settings/pages`.
2. Pada **Build and deployment** pilih **Source: Deploy from a branch**.
3. **Branch: main**, **Folder: /docs**, lalu klik **Save**.
4. Kunjungi `https://amangkitabb-lab.github.io/MaktabahRizqy/` setelah GitHub menampilkan status deployment berhasil. Nama repository/path bersifat **case-sensitive**.

**GitHub Pages hanya menerbitkan HTML/CSS/JS statis.** Kode FastAPI lama di root repositori disimpan sebagai referensi v0.2 tetapi **tidak dijalankan** oleh GitHub Pages. Jangan mengaktifkan Railway atau mengisi `GOOGLE_CLIENT_SECRET` untuk mode ini.

## Apa yang tersimpan?

- Koleksi yang kamu masukkan, catatan pribadi dan halaman dibaca tersimpan pada `localStorage` **di browser pada perangkat yang sedang dipakai**. Data tidak dikirim ke GitHub, tidak sinkron antar-HP/laptop, dan dapat hilang jika data situs dibersihkan.
- Tombol **Ekspor cadangan koleksi** dan **Impor cadangan koleksi** (pada baris akun di sidebar) membantu pindah perangkat. Cadangan `.json` berisi catatan, judul, dan tautan yang kamu masukkan; jangan dibagikan bila bersifat pribadi. Impor meminta konfirmasi sebelum mengganti koleksi browser saat ini.
- Website ini **publik dan dapat dikunjungi siapa saja**. Masing-masing pengunjung mempunyai penyimpanan lokal sendiri. Jangan menaruh PDF milik pribadi, tautan akses terbatas, data sensitif, atau kredensial ke dalam folder `docs/` maupun repository publik.

## Membaca PDF

- Masukkan tautan PDF dan sampul secara manual pada **Tambah Bacaan**. Kamu dapat membuka link di tab lain dan menyimpan **halaman manual**.
- Klik **Baca dalam Web** untuk tautan PDF yang memang boleh diambil browser (misalnya PDF satu domain atau server publik dengan CORS). Jika halaman berhasil dirender, halaman tersebut dicatat **otomatis** ke `localStorage`.
- Untuk file Google Drive privat yang tidak dapat dibaca langsung dari browser, pilih **Pilih PDF dari Perangkat** untuk membuka berkas dari perangkat **tanpa mengunggah PDF ke GitHub**. Halaman yang berhasil tampil akan tersimpan otomatis. Pilihan ini perlu memilih ulang berkas bila PDF belum tersedia pada kunjungan berikutnya.
- PDF.js dipanggil melalui CDN `cdnjs.cloudflare.com` versi **3.11.174**, worker versi sama. Bila internet/CDN diblokir, pembaca internal tidak aktif; tautan eksternal dan pencatatan manual tetap bekerja.

## Fitur yang belum ada

- Login Google dan penyimpanan lintas perangkat (memerlukan backend/database atau layanan tersinkron kelak)
- Sinkronisasi otomatis isi folder Google Drive privat (butuh izin OAuth/server atau pemilihan berkas satu per satu)
- Penarikan PDF dari Drive privat melalui tautan, karena browser tidak mendapat izin akses programatik dari URL Drive biasa

## Keselamatan dan hak cipta

Hanya tautkan atau unggah materi yang berhak kamu gunakan dan bagikan. Versi ini tidak mempublikasikan PDF otomatis.

## Struktur

```text
docs/
  index.html      # Web Utama, Jelajahi Bacaan, Koleksi Ku
  styles.css      # responsif dan mode terang/gelap
  app.js          # katalog lokal, cadangan, PDF.js
  .nojekyll       # GitHub Pages melewati Jekyll
```

Versi awal FastAPI pada `app.py`/`static` tetap ada sebagai arsip kode; tidak terpakai oleh situs statis ini.
