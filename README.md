# Maktabahrizqy - GitHub Pages v0.4

Perpustakaan digital responsif dengan tiga menu tetap: **Web Utama**, **Jelajahi Bacaan**, dan **Koleksi Ku**. Berjalan sebagai situs statis di GitHub Pages tanpa Railway atau login.

## Katalog awal

- Katalog awal berisi **178 judul pilihan** yang teridentifikasi berdasarkan nama berkas di Google Drive Amangrejeki: **117 kitab** dan **61 buku bacaan**.
- Data publik hanya memuat judul dan kategori awal. **Tidak ada tautan PDF, ID berkas Google Drive, atau sampul asli** dalam source code katalog.
- Klasifikasi menurut fann bersifat sementara sampai metadata dan isi kitab diperiksa lebih lanjut. Beberapa entri berlabel "Belum Diklasifikasikan".
- Ada berkas yang tampaknya merupakan beberapa edisi/volume dari judul yang sama; belum semuanya diperiksa untuk deduplikasi.

## Penyimpanan lokal

- Progres membaca, tema, perubahan judul, serta tautan PDF yang ditambahkan sendiri disimpan di browser melalui localStorage.
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
- Website kode publik, **koleksi/progres yang diketik pengguna tetap lokal**, bukan profil server, sehingga tidak otomatis tersinkron antarperangkat.
- Fitur autentikasi dan sinkronisasi server kelak memerlukan sistem tambahan, tidak bisa dipenuhi oleh GitHub Pages murni.

## Keamanan

- Jangan menyimpan password, Google OAuth secret, token, file identitas, atau private JSON di repo.
- Folder Drive Amangrejeki saat audit memiliki akses `anyone` sebagai `reader`; tinjau izin folder dan dokumen pribadi secara terpisah.
- Penambahan judul ke katalog tidak mengubah izin berbagi PDF Drive dan tidak memindahkan, menyalin, atau mengganti nama PDF sumber.