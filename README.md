# Maktabahrizqy - GitHub Pages v0.5

Perpustakaan digital responsif dengan tiga menu tetap: **Web Utama**, **Jelajahi Bacaan**, dan **Koleksi Ku**. Berjalan sebagai situs statis di GitHub Pages tanpa Railway. **Login Google bersifat opsional, khusus untuk menyinkronkan koleksi dan progres antarperangkat.**

## Katalog awal

- Katalog awal berisi **178 judul pilihan** yang teridentifikasi berdasarkan nama berkas di Google Drive Amangrejeki: **117 kitab** dan **61 buku bacaan**.
- Data publik hanya memuat judul dan kategori awal. **Tidak ada tautan PDF, ID berkas Google Drive, atau sampul asli** dalam source code katalog.
- Klasifikasi menurut fann bersifat sementara sampai metadata dan isi kitab diperiksa lebih lanjut. Beberapa entri berlabel "Belum Diklasifikasikan".
- Ada berkas yang tampaknya merupakan beberapa edisi/volume dari judul yang sama; belum semuanya diperiksa untuk deduplikasi.

## Penyimpanan lokal dan Google

- Tanpa login, progres membaca, tema, perubahan judul, serta tautan PDF yang ditambahkan sendiri disimpan di browser melalui localStorage.
- Dengan login Google (setelah konfigurasi OAuth), **metadata koleksi termasuk progres dan tautan pribadi** dapat tersinkron melalui Drive `appDataFolder` tersembunyi. Token login hanya berada di memori, bukan di repo atau localStorage. PDF sumber tidak diunggah ulang.
- Login Google **tidak membatasi akses ke halaman katalog publik**. Fungsinya hanya sebagai otorisasi penyimpanan privat.
- Rilis v0.4 menambahkan katalog awal sekali ke data lokal yang sudah ada, tanpa menghapus bacaan/progres yang telah tersimpan.
- Jika suatu judul bawaan dihapus, judul tersebut tidak muncul kembali sesudah refresh pada browser yang sama.
- Ekspor cadangan pribadi dalam JSON tersedia di sidebar dan Jelajahi Bacaan. File cadangan sebaiknya disimpan secara aman.

## Menautkan PDF Drive secara pribadi

Dapatkan **Maktabahrizqy_Tautan_PDF_Pribadi.json** dari percakapan ChatGPT dengan pemilik (file sengaja **tidak** tersedia di repositori publik).

1. Buka website dan menu **Jelajahi Bacaan**.
2. Tekan **Impor Tautan PDF**.
3. Pilih berkas JSON pribadi itu dan konfirmasi.
4. Tautan akan melengkapi entri yang cocok saja. Tautan yang sudah kamu isi manual tidak ditimpa.
5. Gunakan **Buka Tautan PDF** untuk Google Drive. Pencatatan otomatis halaman hanya tersedia jika PDF bisa dimuat ke pembaca web, contohnya PDF yang dipilih dari perangkat. Google Drive sering tidak mengizinkan pembacaan silang situs karena aturan CORS.

**Jangan commit JSON pribadi itu ke GitHub.** Jika izin Google Drive mengizinkan orang lain yang memegang tautan mengakses file, perlakukan tautannya sebagai sensitif.

## Publikasi

- GitHub Pages source: branch `main`, folder `/docs`.
- Folder `/docs` memuat website. Berkas backend v0.2 disimpan sebagai arsip kompatibilitas dan tidak digunakan oleh GitHub Pages.
- Situs tetap statis. Sinkronisasi menggunakan Google Drive API atas izin akun Google pengguna; **tidak ada backend atau Railway**.
- Login tidak aktif sampai pengelola memasukkan OAuth Web Client ID di `docs/google-config.js` dan mengaktifkan Google Drive API.
- Ikuti **[PANDUAN_LOGIN_GOOGLE.md](PANDUAN_LOGIN_GOOGLE.md)** untuk instruksi Google Cloud dan cara login dari HP/laptop. OAuth Client ID boleh publik; jangan pernah commit Client Secret.

## Keamanan

- Jangan menyimpan password, Google OAuth secret, token, file identitas, atau private JSON di repo.
- Katalog judul publik tidak berisi tautan PDF Drive. Hak akses folder dan PDF Amangrejeki harus dikelola terpisah; aplikasi sinkronisasi **hanya menggunakan appDataFolder**, bukan mengubah izin arsip sumber.
- Penambahan judul ke katalog tidak mengubah izin berbagi PDF Drive dan tidak memindahkan, menyalin, atau mengganti nama PDF sumber.