# Maktabahrizqy

**Ruang baca pribadi untuk kitab dan buku** — versi persiapan login dan publikasi v0.2, 22 November 2026.

Navigasi web **terkunci**: **Web Utama**, **Jelajahi Bacaan**, dan **Koleksi Ku**. Bahasa antarmuka Indonesia. Tampilan responsif dengan mode terang dan gelap, pencarian, kategori kitab berdasarkan *fann*, kartu sampul, tautan PDF, pelacakan halaman manual, dan pembaca internal yang mencatat halaman otomatis.

## Mulai dari sini: login Google dan publikasi pribadi

**Buka [`PANDUAN_PUBLIKASI_PRIBADI.md`](PANDUAN_PUBLIKASI_PRIBADI.md)** untuk panduan bertahap: GitHub (kode publik tanpa kredensial) → Railway (HTTPS + volume) → Google Cloud OAuth → pengaturan rahasia di Railway → uji login. Untuk membuat `TOKEN_ENCRYPTION_KEY` tanpa mengetik kode, buka **`BUAT_KUNCI_LOKAL.html`** di browser perangkatmu. Jangan pernah membagikan password atau client secret.

- Kode OAuth dan halaman masuk telah tersedia, tetapi **Google Cloud OAuth belum dibuat dan situs belum online**.
- Dockerfile versi ini menggunakan variabel hosting `PORT` (default lokal 8000) dan hanya menyalin kode publik ke image, tidak file `.env` atau data pribadi.
- Halaman [`/kebijakan-privasi`](static/privacy.html) tersedia untuk menjelaskan penggunaan akses Google Drive dan cache PDF.
- Mode Google OAuth **Testing** dengan izin `drive.readonly` bisa memerlukan login ulang setiap 7 hari. Izin ini bersifat restricted; meskipun kode memindai folder tertentu saja, scope Google secara teknis memberi kemampuan membaca seluruh Drive. Penggunaan pribadi dapat memenuhi pengecualian verifikasi, bukan berarti bebas dari tanggung jawab keamanan.

## Status saat penyerahan

- Folder **Maktabahrizqy** disiapkan terpisah di Google Drive pemilik; ID folder sengaja tidak dipublikasikan di repositori. Isi `DRIVE_FOLDER_ID` melalui pengaturan privat hosting.
- **Tidak ada** berkas Drive lama yang dipindah, diganti nama, dibagikan, atau dihapus.
- Folder baru saat dibuat masih **kosong**. Proses sinkronisasi baru membaca folder tersebut dan subfoldernya ketika pemilik mengaktifkan OAuth web lalu menekan **Sinkronkan Folder**.
- Berkas `maktabahrizqy_pratinjau.html` bersifat **simulasi lokal** dan berisi judul CONTOH (bukan isi Google Drive asli). Jangan mengunggah pratinjau ke situs publik sebagai pengganti aplikasi yang terlindungi login.
- Aplikasi FastAPI ini siap dijalankan di komputer/server, **belum dipublikasikan** dan **belum memiliki kredensial Google OAuth**. Login Google sungguhan memerlukan konfigurasi di bawah.

## Persiapan & menjalankan secara lokal

1. Pastikan Python **3.11+** terpasang.
2. Buka terminal dalam folder proyek ini dan jalankan:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

   Di Windows, aktivasi virtual environment menggunakan `.venv\\Scripts\\activate`, dan salin `.env.example` ke `.env` secara manual.

3. Buka [Google Cloud Console](https://console.cloud.google.com/) menggunakan akun pribadi yang sama, buat proyek, aktifkan **Google Drive API**, atur **Google Auth Platform / OAuth consent screen**, lalu buat **OAuth Client ID** bertipe **Web application**. Untuk aplikasi pribadi dalam mode Testing, tambahkan email pemilik sebagai **test user**.

4. Tambahkan **Authorized redirect URI** yang persis sama dengan:

   ```text
   http://localhost:8000/auth/callback
   ```

   Jika nanti situs dipasang ke domain HTTPS, ganti redirect URI, `APP_BASE_URL` dan `COOKIE_SECURE` sesuai domain tersebut.

5. Buka file `.env` dan isi `OWNER_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, dan `TOKEN_ENCRYPTION_KEY` (lihat cara membuat kunci di `.env.example`). **Jangan bagikan** client secret dan kunci enkripsi; jangan unggah `.env` ke repository publik.

6. Nilai `DRIVE_FOLDER_ID` sudah terisi ID folder khusus yang dibuat pada sesi ini. Jalankan:

   ```bash
   uvicorn app:app --reload --port 8000
   ```

7. Kunjungi `http://localhost:8000`, masuk dengan Google yang tercatat dalam `OWNER_EMAIL`. Hanya email tersebut yang bisa menggunakan katalog dan membuka PDF. **Koneksi Google Drive di ChatGPT terpisah dari login OAuth situs** — situs perlu perizinannya sendiri untuk mengakses PDF, tidak bisa memakai token ChatGPT.

## Cara memakai

- **Tambah Bacaan**: isi judul, jenis Kitab atau Buku Bacaan, kategori *fann*, pengarang, dan link PDF jika sudah tersedia. Bacaan disimpan secara pribadi di database aplikasi.
- **Jelajahi Bacaan**: cari judul, pengarang, atau *fann* lalu saring koleksi.
- **Koleksi Ku**: kelompok otomatis menurut Buku Bacaan dan Kitab per *fann*.
- **Sinkronkan Folder**: baca PDF yang sudah kamu letakkan di folder `Maktabahrizqy` **dan subfoldernya**. Hanya menambahkan metadata ke katalog, tidak mengubah berkas di Drive.
- **Halaman manual**: buka kartu bacaan, isi **Halaman terakhir**, lalu simpan. Cocok untuk PDF Drive yang hanya dibuka melalui tautan eksternal atau buku cetak.
- **Halaman otomatis**: PDF yang disinkronkan dari folder Drive memiliki tombol **Baca di Web**. Web merender halaman PDF sendiri di server melalui PyMuPDF; saat halaman berhasil tampil, nomor halaman dicatat. Klik **Sebelumnya / Berikutnya** atau gunakan tombol panah. PDF tidak perlu dijadikan publik.
- **Sampul**: bila ada `cover_url` dipakai gambar tersebut; untuk PDF hasil sinkronisasi aplikasi otomatis menjadikan halaman pertama PDF sebagai sampul. Jika gagal, kartu sampul tipografis tetap tampil.
- **Mode terang/gelap**: tombol bulan/matahari di bagian atas; disimpan pada perangkat pengguna.
- **Hapus dari Katalog**: **hanya** menghapus metadata dan progres di aplikasi, bukan PDF asli pada Drive.

## Arsitektur & keamanan

| Lapisan | Implementasi |
|---|---|
| UI | HTML/CSS/JavaScript vanilla; responsif desktop dan HP |
| Backend | FastAPI (Python), Google OAuth 2.0 |
| Akses | Email allowlist tunggal: `OWNER_EMAIL`; tanpa login API mengembalikan 401 |
| Sesi | Cookie acak, HttpOnly, SameSite=Lax, session hash di SQLite, CSRF token untuk perubahan |
| PDF | Tetap di Drive; server membaca dengan `drive.readonly`, mengunduh salinan cache privat untuk dirender |
| Katalog/progres | SQLite `data/maktabahrizqy.sqlite3` (hanya pemilik situs) |
| Token | Refresh token Google disimpan terenkripsi dengan Fernet |
| Batas PDF | 250 MB per PDF pada versi awal |
| Perubahan Drive | API aplikasi **hanya baca**; tidak ada endpoint pemindahan, rename, delete, atau ubah sharing |

### Catatan penting terkait akses Google

Aplikasi meminta scope OAuth **`https://www.googleapis.com/auth/drive.readonly`** untuk membaca PDF dan menyinkronkan isi folder. Google mengklasifikasikan scope ini **restricted**, sehingga publikasi untuk khalayak luas mungkin memerlukan proses verifikasi/peraturan tambahan. Pada versi pribadi ini, akun test user digunakan untuk melakukan pengujian; jangan menganggap konfigurasi Testing sebagai izin menerbitkan aplikasi untuk umum. Kelak dapat dipertimbangkan Google Picker dengan `drive.file` untuk izin lebih sempit, tetapi sinkronisasi otomatis folder berkas lama tidak akan langsung sama.

### Sebelum dipasang ke internet

- Gunakan HTTPS dan set `COOKIE_SECURE=true`.
- Pastikan `OWNER_EMAIL` sesuai email Google pemilik, dan `TOKEN_ENCRYPTION_KEY` tetap rahasia dan stabil.
- Simpan `DATA_DIR` pada **disk/volume persisten**; backup SQLite berkala. Jika server hosting menghapus disk saat redeploy, progres dan metadata bisa hilang.
- Cache PDF dalam `DATA_DIR/pdf_cache` berisi salinan privat PDF; jaga disk privat, proteksi server, dan hapus cache bila tidak lagi diperlukan.
- Pastikan Google OAuth **Testing**/status verifikasi sesuai kebutuhan dan kebijakan Google.
- Jika ingin melayani PDF besar atau pengguna lain di masa depan, perlu optimasi cache/antrean dan audit keamanan sebelum diluncurkan.

## Struktur berkas

```text
Maktabahrizqy/
├── app.py                  # login, katalog, progress, sinkronisasi, pembaca PDF
├── static/
│   ├── index.html          # layout dengan tiga navigasi tetap
│   ├── styles.css          # mode terang/gelap + responsif
│   └── app.js              # interaksi katalog, pembaca, dan progres
├── requirements.txt
├── .env.example
├── Dockerfile             # port dari PORT atau 8000; hanya copy kode
├── .dockerignore          # blokir .env/data dari container
├── BUAT_KUNCI_LOKAL.html  # generator kunci tanpa mengirim ke server
├── PANDUAN_PUBLIKASI_PRIBADI.md
├── RENCANA_PENATAAN_DRIVE.md
├── tests/
│   └── test_app.py
└── README.md
```

## Proses pembuatan berikutnya

1. Setujui atau sesuaikan rencana pemindahan kandidat file dari Drive lama pada dokumen rencana penataan Drive pribadi (disimpan terpisah dari repositori publik).
2. Bila disetujui, pindahkan file yang ditentukan (tanpa mengubah nama aslinya kecuali ada persetujuan terpisah).
3. Sambungkan Google OAuth dan nyalakan server pribadi.
4. Isi pengarang/edisi/*fann*, perbarui sampul dan tautan, lalu lakukan uji baca satu PDF end-to-end.

**Sengaja tidak ada klaim bahwa PDF lama telah diimpor atau bahwa situs sudah online**; keduanya memerlukan tindakan tambahan.
