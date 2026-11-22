# MAKTA BAHRIZQY — PANDUAN LOGIN GOOGLE & PUBLIKASI PRIBADI

**Versi:** 0.2 · **Tanggal:** 22 November 2026
**Tujuan:** website dapat dibuka melalui HTTPS, **koleksi dan PDF hanya terlihat setelah login dengan Google milik pemilik**. Tiga nama menu TIDAK berubah: **Web Utama · Jelajahi Bacaan · Koleksi Ku**.

> Panduan ini mengikuti jalur **Railway + Google Cloud OAuth** untuk web FastAPI yang sudah disiapkan. Pilihan ini memerlukan akun Railway dan Google Cloud, bukan password baru untuk Maktabahrizqy. **Jangan kirim password, OAuth client secret, access token, atau TOKEN_ENCRYPTION_KEY melalui chat.** Masukkan hanya ke tempat aman di dashboard pribadimu.

## 0. Yang sudah dan belum dikerjakan

- Sudah: kode login Google, izin akses hanya email pemilik, sesi privat, pembaca PDF internal, pencatatan manual dan otomatis, Dockerfile untuk port hosting, dan halaman kebijakan privasi.
- Sudah: folder Google Drive `Maktabahrizqy` dibuat, URL: (tautan folder hanya ada di Google Drive pemilik)
- Belum: Google Cloud project, OAuth client untuk situs, repository GitHub, service Railway, volume Railway, dan domain HTTPS. **Belum ada situs yang dipublikasikan atau login yang teruji dengan akun asli.**
- File Drive lama: **tetap di tempat semula**. Tidak ada rename, move, share, atau delete.

## 1. Taruh kode di GitHub, buat repositori PRIVAT

1. Buka https://github.com/new dan login sendiri.
2. Repository name: **maktabahrizqy**, pilih **Private**, kemudian Create repository.
3. Ekstrak ZIP versi 0.2; unggah seluruh **isi folder aplikasi** ke root repo, bukan ZIP-nya sendiri. Pastikan `Dockerfile`, `app.py`, `requirements.txt`, folder `static/` berada di akar repo.
4. **Jangan** unggah `.env`, berkas berisi password atau secret, `data/`, `*.sqlite3`, atau berkas PDF privat. File `.env.example` kosong dan boleh diunggah.

GitHub tidak otomatis mendapatkan akses ke Google Drive hanya karena kodenya disimpan di sana.

## 2. Buat situs di Railway; dapatkan URL HTTPS

1. Buka https://railway.com/ → login → **New Project** → **Deploy from GitHub repo**. Hubungkan repository GitHub `maktabahrizqy` milikmu.
2. Railway mendeteksi `Dockerfile` secara otomatis. Periksa log deploy; app akan bisa tampil walau OAuth belum terisi, tetapi belum bisa login.
3. Buka service → **Settings** → **Networking / Public Networking** → **Generate Domain**. Simpan URL persis yang diberikan, contohnya `https://maktabahrizqy-xxxx.up.railway.app` (contoh saja, bukan alamat sungguhan).
4. Buka project canvas Railway dan tambahkan **Volume** pada service tersebut. Mount path: **`/app/data`**. Ini wajib supaya katalog dan progres tidak hilang saat redeploy. Aplikasi memakai SQLite di sini.
5. Dalam **Settings / Deploy**, set **Healthcheck Path** = `/health` bila ada pilihan. Gunakan **satu replica** untuk database SQLite. Tidak perlu mengatur `PORT` manual; Docker sudah membaca variabel port otomatis.

**Biaya:** Railway Free saat ini memberikan kuota pemakaian bulanan terbatas dan volume sampai 0,5 GB; untuk cache banyak PDF, keterbatasan kapasitas bisa terasa. Hobby berbayar ($5/bulan sebagai biaya dasar yang mencakup kredit pemakaian, tagihan bisa lebih sesuai pemakaian). Cek harga pada dashboard sebelum memilih plan. Jangan aktifkan layanan berbayar tanpa mengerti tagihannya.

## 3. Siapkan Google Cloud API dan OAuth

1. Dengan akun Google yang juga memiliki Google Drive, buka https://console.cloud.google.com/ → pilih **New Project** → nama **Maktabahrizqy**. Pilih project tersebut.
2. Buka **APIs & Services → Library** dan aktifkan **Google Drive API** untuk project ini.
3. Buka **Google Auth Platform** (atau menu OAuth Consent Screen). Di **Branding**, isi nama aplikasi **Maktabahrizqy** dan alamat kontak milikmu. Pada **Audience**, pilih **External** bila menggunakan Gmail pribadi, pilih status **Testing**, dan tambahkan akun email pemilik sebagai **Test User**.
4. Di **Data Access**, deklarasikan izin identitas `openid`, `email`, `profile` dan izin Drive **`https://www.googleapis.com/auth/drive.readonly`**. Izin ini dikategorikan **restricted**, sekalipun server hanya memproses folder Maktabahrizqy.
5. Di **Clients → Create Client**, pilih **Web application**. Nama bebas, misalnya **Maktabahrizqy Web**. Pada **Authorized redirect URIs**, isikan **URL Railway sungguhan** diikuti `/auth/callback`, contoh:

   `https://maktabahrizqy-xxxx.up.railway.app/auth/callback`

   **Tidak** perlu JavaScript Origin untuk kode server-side ini. Pastikan `https://`, ejaan domain, dan trailing path tepat.
6. Setelah tersimpan, Google menyediakan **Client ID** dan **Client Secret**. **Jangan tempel ke chat maupun repository GitHub.** Simpan langsung di Railway → Variables pada tahap berikut.

Status **Testing** untuk OAuth dengan akses Drive menyebabkan refresh token biasanya berakhir setelah 7 hari. Situs masih dapat dipakai dengan login ulang; metadata dan progres tetap ada. Untuk aplikasi personal Google memberikan pengecualian tertentu dari verifikasi, tetapi tidak menghilangkan pembatasan/risiko keamanan scope `drive.readonly`. Jangan beralih ke publik multi-pengguna tanpa tinjauan ulang.

## 4. Masukkan variabel privat ke Railway

Di service Railway → **Variables**, buat pasangan **nama variabel** dan **nilai** berikut ini (semua nilainya langsung di Railway):

| Nama variabel | Nilai yang dimasukkan |
|---|---|
| `OWNER_EMAIL` | Alamat email Google pemilik yang juga masuk test user |
| `GOOGLE_CLIENT_ID` | Client ID yang baru dibuat di Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Client Secret dari Google Cloud, jangan bagikan |
| `APP_BASE_URL` | URL situs dari Railway, **tanpa garis miring akhir** |
| `DRIVE_FOLDER_ID` | ID folder Maktabahrizqy dari Google Drive (isi hanya di environment hosting) |
| `TOKEN_ENCRYPTION_KEY` | Kunci acak dari `BUAT_KUNCI_LOKAL.html` (atau `python generate_fernet_key.py` di perangkatmu) |
| `COOKIE_SECURE` | `true` |
| `DATA_DIR` | `/app/data` |

> `TOKEN_ENCRYPTION_KEY` harus stabil antar-deploy. Tidak ada alasan memberikannya kepada ChatGPT. Di halaman Variables, gunakan opsi **Seal** untuk nilai rahasia jika tersedia. Selalu periksa bahwa perubahan variabel sudah dipakai deployment terbaru.

## 5. Uji login tanpa berbagi PDF

1. Buka `https://DOMAIN-SUNGGUHNYA/health` → seharusnya muncul `{"ok": true}`. Ini hanya memeriksa server hidup, **bukan** berarti OAuth sudah berfungsi.
2. Buka `https://DOMAIN-SUNGGUHNYA/` → pilih **Masuk dengan Google** → login menggunakan **email OWNER_EMAIL** yang sama.
3. Pada layar persetujuan Google, cek nama project, akun, dan izin yang diminta. Karena masih Testing/personal, mungkin muncul peringatan aplikasi belum diverifikasi. Lanjutkan hanya jika aplikasi dan project itu memang buatanmu sendiri dan URL benar.
4. Setelah sukses, tiga menu **Web Utama / Jelajahi Bacaan / Koleksi Ku** terlihat. Coba tambah *bacaan tanpa PDF*, catat halaman, refresh browser, pastikan progres bertahan.
5. Tekan **Sinkronkan Folder**. Jika belum ada PDF di folder khusus, angka `0` adalah hasil yang benar. Tidak ada file Drive lama yang berpindah.
6. Setelah kamu memberi izin **secara terpisah** untuk memilih PDF tertentu, baru letakkan atau pindahkan PDF itu ke folder khusus; sinkronkan lalu coba tombol **Baca di Web** untuk mencatat progres otomatis.
7. Uji dengan browser dalam mode Incognito/tidak login: seharusnya *koleksi dan API privat* tidak terlihat. Halaman **Masuk**, **Kebijakan Privasi**, file statis, dan `/health` memang dapat diakses publik; isi katalog tetap privat.

## 6. Jika terjadi kendala

| Pesan / kondisi | Periksa |
|---|---|
| `redirect_uri_mismatch` | Persis sama antara `APP_BASE_URL` dan Authorized redirect URI, termasuk `https://` dan `/auth/callback` |
| `access_denied` / akun tidak diizinkan | Email ditambahkan sebagai **Test User**; `OWNER_EMAIL` cocok; izin memang kamu setujui |
| `Konfigurasi Google OAuth belum lengkap` | Semua 4 variabel wajib, plus folder ID dan kunci, sudah tersimpan lalu redeploy |
| Masuk berhasil tetapi tidak bisa sinkron | Google Drive API sudah enabled? Scope `drive.readonly` ada di Data Access? Folder ID benar? Izin 7 hari kedaluwarsa? |
| Izin Google Drive kedaluwarsa | Buka `https://DOMAIN-SUNGGUHNYA/auth/login` lalu login Google lagi. Catatan progres tetap di database. |
| Progres hilang setelah redeploy | Periksa volume `/app/data`, variabel `DATA_DIR`, dan apakah ada perubahan service/volume. Gunakan backup data. |
| PDF gagal dibuka | Hanya PDF hasil sinkron folder Drive yang didukung oleh pembaca internal. PDF yang hanya ditempel sebagai URL eksternal dilacak manual. |
| Railway habis kuota/volume penuh | Kurangi cache PDF secara aman setelah backup, atau naikkan kapasitas/plan jika diperlukan. Data pada platform memiliki kebijakan retensi tersendiri. |

## 7. Keamanan akhir

- **Jangan** bagikan password Google, Client Secret, `.env`, TOKEN_ENCRYPTION_KEY, maupun token akses.
- Pastikan GitHub repo **Private**. Hanya informasi publik dan kode boleh masuk ke repo.
- Google Drive tetap privat; jangan mengaktifkan **Anyone with the link** pada file PDF.
- Perhatikan: provider hosting memproses akses Drive atas nama pemilik dan dapat menyimpan cache PDF. Pilih provider yang kamu percayai, lakukan backup dan pembaruan rutin.
- Memiliki URL HTTPS **tidak berarti seluruh halaman internetnya tersembunyi**: halaman login dan penjelasan privasi publik, hanya katalog dan PDF yang diproteksi Google login. Gunakan arsitektur VPN pribadi bila ingin bahkan URL login tidak terbuka untuk publik.
- Google Drive izin *drive.readonly* memang luas meskipun aplikasi hanya menyinkron folder tertentu. Versi mendatang bisa menggunakan Google Picker + `drive.file` sebagai izin per-file yang lebih sempit, dengan perubahan alur sinkronisasi.
- Pantau penggunaan Railway untuk mencegah biaya tidak terduga. Railway tidak gratis tanpa batas.

## Sumber resmi

- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Google Drive API scopes: https://developers.google.com/workspace/drive/api/guides/api-specific-auth
- Google personal-use OAuth exception: https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification
- Railway Deploy GitHub/Docker: https://docs.railway.com/services
- Railway Public Networking: https://docs.railway.com/networking/public-networking
- Railway Volumes: https://docs.railway.com/volumes
- Railway Free Plan: https://docs.railway.com/pricing/free-plan
