# Maktabahrizqy - GitHub Pages v0.8

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

## Maraji' Fiqh Travelling (v0.8)

- Rak khusus **Maraji' Fiqh Travelling** berisi **10 referensi PDF** dari folder yang dipilih pengguna. Satu judul (Syamsul Muniroh 1, Qashar) sudah ada sehingga **9 entri baru** ditambahkan. Total katalog sekarang **187 judul**, kategori khusus 10 judul tanpa duplikat.
- Migrasi yang aman menambahkan kategori pada browser lama tanpa menghapus progres, catatan, tautan atau gambar sampul yang sudah tersimpan.
- Semua PDF tetap berada di Google Drive sumber. **Tidak ada link/ID PDF privat dalam source code publik.** Gunakan file impor pribadi `Maktabahrizqy_Maraji_Fiqh_Travelling_10_Tautan_Pribadi.json` dari percakapan untuk memasukkan 10 tautan lewat **Jelajahi Bacaan → Impor Tautan PDF**.
- Cover untuk kategori khusus **ditentukan sendiri oleh pemilik** melalui **Upload Cover Lokal** (tidak memuat thumbnail otomatis dari Drive). Cover lama yang sebelumnya dipasang tidak dihapus.
- Di Web Utama, rak khusus disajikan sebagai barisan buku horizontal yang dapat digeser. Kategori bisa dicari melalui filter dan tampil sebagai satu rak di Koleksi Ku.

## Tracker khatam (v0.8)

- Pada setiap detail kitab tersedia tombol **+1 Khatam**. Jumlahnya tampil sebagai label di kartu bacaan dan stat **Total Khatam** di halaman utama.
- Pada **Ubah Data**, kolom **Sudah khatam (kali)** dapat digunakan untuk menambah hitungan awal atau mengoreksi jumlah.
- Khatam adalah tindakan manual setelah menuntaskan kitab, bukan otomatis bertambah saat mencapai halaman terakhir. Penambahan khatam **tidak menghapus nomor halaman atau progres jilid**.
- Saat Google Sync aktif, riwayat setiap tekan +1 disimpan sebagai catatan ber-ID unik, sehingga penambahan dari HP dan laptop bisa digabung tanpa terhitung ganda. Koreksi manual menggantikan hitungan lama dengan penanda waktu.
- Khatam ikut dibawa oleh ekspor/impor cadangan JSON serta disinkronkan privat ke Google Drive appDataFolder.

## Tipografi dan gaya editorial (v0.8)

- Mengikuti hierarki visual F15 Library (sebagai referensi, bukan menyalin aset/desain persis): **Inter** (UI Indonesia), **Fraunces** (judul), **Gelasio** (teks bacaan), **Tajawal** (Arab).
- Font dimuat dari layanan Google Fonts saat browser tersambung. Bila tidak tersedia, browser menggunakan font fallback. Tidak ada file font pihak ketiga yang diunggah ke GitHub.
- Rak horizontal, kartu cover tegak utuh, tag khatam dan aksen oranye lembut menambah nuansa perpustakaan editorial. Mode terang/gelap dan nama navigasi **Web Utama**, **Jelajahi Bacaan**, **Koleksi Ku** tidak berubah.

## Juz/Jilid dan progres per-volume (v0.7)

- Form **Tambah Bacaan / Ubah Data** kini memuat **Jumlah Juz/Jilid**, **Juz/Jilid yang dibaca**, **Jumlah halaman** dan **Halaman terakhir** untuk jilid terpilih. Default kitab lama adalah **1 jilid** tanpa menghapus data bacaan.
- Bagian **Simpan Progres** pada detail kitab memiliki input **Juz/Jilid** dan **Halaman**. Perpindahan jilid mengembalikan halaman terakhir setiap jilid yang sudah dicatat.
- Indikator progres katalog menggunakan persentase gabungan semua jilid; bila jumlah halaman suatu jilid belum diisi, jilid itu belum masuk hitungan bagian terbaca.
- Backup JSON dan sinkronisasi Google Drive appDataFolder membawa metadata juz/jilid. Konflik HP/laptop ditangani dengan waktu pembaruan per jilid (tetap disarankan menyinkronkan tiap selesai sesi).
- Tautan PDF saat ini satu untuk satu entri judul. File PDF per jilid dapat dipilih dari perangkat saat membaca, tanpa mengunggah file tersebut ke situs.

## Cover ukuran kitab penuh (v0.7)

- Tampilan cover berbentuk buku tegak 2:3. Gambar memakai `object-fit: contain`: seluruh gambar terlihat tanpa *zoom/crop*, ruang kosong pada sisi gambar diperbolehkan.
- Pengaturan ini berlaku pada rak katalog, bagian lanjutkan membaca, dan detail bacaan. Cover tipografi bawaan tetap muncul saat foto/thumbnail tidak tersedia.

## Cover otomatis + cover lokal (v0.6)

- Jika judul mempunyai tautan PDF Drive **yang diimpor pribadi**, website **mencoba** memakai pratinjau Drive sebagai cover. Foto/thumbnail Drive bisa gagal jika PDF privat atau pemblokiran lintas situs; jika gagal, cover tipografi yang sudah ada tetap digunakan.
- Setelah kitab dibuka, bagian **Kelola Cover** menyediakan **Cover dari PDF Lokal** (render halaman pertama memakai PDF.js), **Upload Cover Lokal** (JPG/PNG/WebP), **Ambil dari Tautan** (PDF web yang mengizinkan CORS), dan hapus cover pilihan.
- **Pilih PDF dari Perangkat** pada pembaca bacaan kini sekaligus membuat cover halaman 1 jika belum ada cover pilihan.
- Cover pilihan dikompresi dalam browser dan tersimpan sebagai data gambar kecil di metadata koleksi. Karena itu ikut tersinkron privat lewat Google Drive appDataFolder apabila login aktif; **PDF asli tidak dikirim ke hosting atau disalin ke Drive**.
- Sumber kode GitHub tidak menyimpan file PDF atau tautan privat. Batas ukuran dan panduan lengkap: **[PANDUAN_COVER_DAN_PDF.md](PANDUAN_COVER_DAN_PDF.md)**.

## Menautkan PDF Drive secara pribadi

Dapatkan **Maktabahrizqy_Tautan_PDF_Pribadi.json** dari percakapan ChatGPT dengan pemilik (file sengaja **tidak** tersedia di repositori publik).

1. Buka website dan menu **Jelajahi Bacaan**.
2. Tekan **Impor Tautan PDF**.
3. Pilih berkas JSON pribadi itu dan konfirmasi.
4. Tautan akan melengkapi entri yang cocok saja. Tautan yang sudah kamu isi manual tidak ditimpa.
5. Sesudah impor, Maktabahrizqy mencoba menampilkan thumbnail Drive sebagai cover (tidak selalu tersedia). Gunakan **Buka Tautan PDF** untuk membaca PDF di Google Drive. Untuk membuat cover halaman pertama yang permanen, buka judul lalu gunakan **Cover dari PDF Lokal**, atau unggah gambar lokal. Pencatatan otomatis halaman hanya tersedia saat PDF dapat dirender di pembaca web.

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
- Penambahan judul, tautan atau cover ke katalog tidak mengubah izin berbagi PDF Drive dan tidak memindahkan, menyalin, atau mengganti nama PDF sumber.
- Gambar/cover yang diperoleh dari perangkat tetap tersimpan hanya pada koleksi pribadi dan sinkronisasi akun, bukan pada katalog publik GitHub. Hindari memilih gambar berisi data pribadi.