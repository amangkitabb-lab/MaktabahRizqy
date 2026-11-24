# Maktabahrizqy v0.6 — Tautan PDF Pribadi dan Cover Kitab

Website tetap publik di GitHub Pages, tetapi tautan PDF Amangrejeki **tidak diunggah ke repositori**. Untuk menjaga izin asli kitab/buku, pengelolaan tautan dilakukan secara privat melalui browser dan Google Drive appDataFolder setelah pengguna login.

## Langkah 1 — Masukkan 178 tautan PDF privat

1. Unduh `Maktabahrizqy_Tautan_PDF_Pribadi.json` dari percakapan ChatGPT. **Jangan unggah JSON ini ke GitHub, jejaring sosial, atau layanan berbagi publik**.
2. Buka `https://amangkitabb-lab.github.io/MaktabahRizqy/`, pilih **Jelajahi Bacaan** lalu **Impor Tautan PDF**.
3. Pilih berkas JSON dan konfirmasi. Pencocokan berdasarkan ID judul katalog yang sama, tautan yang sudah diatur manual tidak ditimpa.
4. Login Google dengan akun yang sebelumnya disiapkan, kemudian pilih **Sinkronkan** agar data tersimpan di penyimpanan aplikasi privat pada Google Drive. Lakukan sinkronisasi di HP/laptop dengan akun yang sama.

Catatan: tindakan ini menambah **link**, bukan mengubah izin Google Drive atau menyalin PDF. Pembukaan tautan PDF tetap tunduk pada izin file sumber. Katalog publik tetap memuat judul/jenis saja.

## Langkah 2 — Cover otomatis terbaik yang tersedia

- Ketika sebuah judul memiliki tautan PDF Google Drive, website mencoba menampilkan pratinjau Drive dari halaman pertama sebagai gambar cover. **Pratinjau ini tidak dijamin tersedia**, terutama untuk PDF privat, penolakan cookie pihak ketiga, atau pembatasan penautan lintas situs.
- Saat membaca PDF yang dipilih dari perangkat melalui **Pilih PDF dari Perangkat**, cover dari halaman pertama dibuat otomatis bila buku belum memiliki cover pilihan.
- Di detail bacaan, gunakan **Ambil dari Tautan** untuk PDF web yang mengizinkan akses langsung lintas situs. Untuk URL Google Drive privat, tombol ini akan menjelaskan bahwa file PDF asli tidak dapat diunduh secara langsung hanya dengan izin `drive.appdata`.

## Langkah 3 — Cover manual (pasti tersedia)

1. Buka judul kitab/buku dalam **Jelajahi Bacaan** atau **Koleksi Ku**.
2. Pada **Kelola Cover**, pilih **Cover dari PDF Lokal** untuk membaca halaman pertama PDF yang ada di komputer/HP, atau **Upload Cover Lokal** jika kamu memiliki gambar JPG, PNG, atau WebP.
3. Cover dikompresi menjadi thumbnail ringan dan disimpan di koleksi pada browser. Jika akun Google tersambung, cover pilihan ikut masuk berkas JSON sinkronisasi privat di Google Drive appDataFolder.
4. Gunakan **Hapus cover pilihan** jika ingin kembali memakai pratinjau Drive atau cover teks bawaan. Berkas asli PDF di Drive tidak dihapus atau diubah.

Prioritas cover: **cover pilihan dari perangkat atau tautan gambar** → **pratinjau Google Drive jika tersedia** → **cover tipografi bawaan**.

## Batas teknis dan keamanan

- PDF dari perangkat diproses **di browser** untuk mengambil halaman pertama. Berkas PDF tidak dikirim ke GitHub, ChatGPT, atau server aplikasi.
- Cover yang diproses ulang menjadi URL data gambar maksimum ~21.000 karakter agar tetap cocok dengan penyimpanan browser dan Google Drive appDataFolder. Batas aman total metadata + cover dijaga di bawah ~3,8 MB; browser tertentu bisa memiliki kuota lebih rendah.
- Gambar lokal maksimum 12 MB. PDF lokal untuk cover maksimum 95 MB. File yang terlalu berat perlu diperkecil atau memakai gambar cover lokal.
- Jika sesi Google belum tersambung, cover dan link yang diimpor masih hanya ada di browser. Klik **Sinkronkan** dan periksa status berhasil setelah login agar tersimpan antarperangkat.
- Thumbnail Google Drive pihak ketiga tidak dijanjikan dapat diambil/disimpan. Google Drive API `drive.appdata` bukan izin membaca seluruh PDF privat. Mengaktifkan izin Drive yang lebih luas tidak dilakukan dalam rilis ini.
- Unduh **Ekspor Cadangan** secara berkala, khususnya sebelum impor ulang/mereset browser.
- Sampul yang mengandung identitas pribadi atau karya berhak cipta tidak diterbitkan ke source publik; hanya terlihat oleh browser yang memiliki koleksi serta aksesnya.

## Tidak berubah

- Navigasi utama tetap **Web Utama**, **Jelajahi Bacaan**, **Koleksi Ku**.
- Katalog publik awal tetap 178 bacaan (117 kitab dan 61 buku).
- Repositori GitHub Pages tetap publik, tanpa Railway; data pribadi disimpan di browser dan, bila login, Google Drive appDataFolder.
- **Tidak ada izin, lokasi, nama, atau isi berkas di Drive Amangrejeki yang diubah**.

Dokumentasi teknis: https://developers.google.com/workspace/drive/api/guides/appdata ; https://developers.google.com/workspace/drive/api/reference/rest/v3/files