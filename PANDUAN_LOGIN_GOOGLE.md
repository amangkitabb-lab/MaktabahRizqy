# Aktivasi Login Google & Sinkronisasi Maktabahrizqy (v0.5)

**Penting:** Situs tetap berada di GitHub Pages (`main` / `docs`) tanpa Railway. Login **hanya untuk sinkronisasi koleksi, progres membaca, catatan, dan tautan PDF**. Katalog judul yang disimpan di repo publik tetap dapat dilihat tanpa login. PDF asal tidak dipindah, disalin, atau dibuka izinnya.

## Arsitektur dan izin minimum

- Browser memakai **Google Identity Services** (`google.accounts.oauth2.initTokenClient`).
- Data tersimpan sebagai berkas JSON pada **Google Drive appDataFolder**, area privat tersembunyi yang khusus untuk aplikasi dan akun Google yang memberikan izin. **Bukan** folder arsip Amangrejeki atau folder Maktabahrizqy yang terlihat di Google Drive.
- Ruang lingkup Google Drive: **`https://www.googleapis.com/auth/drive.appdata`** (data aplikasi saja). Aplikasi juga meminta `https://www.googleapis.com/auth/userinfo.email` untuk memastikan akun yang dipakai sama di setiap perangkat.
- Token hanya disimpan **sementara di memori browser**, bukan di localStorage, file sumber, atau GitHub. Saat sesi habis, login lagi.
- Sinkronisasi menyalin metadata bacaan beserta tautan pribadi yang sudah kamu masukkan; **tidak mengunggah file PDF**.

## Langkah aktivasi Google Cloud (oleh pemilik)

1. Buka https://console.cloud.google.com/ dan pilih **buat project** bernama misalnya `Maktabahrizqy-Sync`.
2. Masuk **APIs & Services → Library**; cari **Google Drive API** dan klik **Enable**.
3. Buka **Google Auth Platform** (OAuth consent screen), lengkapi **Branding** dengan nama aplikasi `Maktabahrizqy`, email dukungan, dan identitas yang diperlukan. Pilih **External** untuk akun Google pribadi.
4. Pada bagian **Audience**, pilih status **Testing** untuk penggunaan pribadi dan tambahkan **satu akun Google pemilik** ke daftar **Test users**. **Jangan** menambahkan akun sembarang. Saat testing, login mungkin memunculkan peringatan aplikasi belum diverifikasi. Izin uji dapat berakhir dan perlu diminta kembali; data yang sudah tersimpan tidak otomatis hilang.
5. Pada **Data Access / Scopes**, tambahkan `https://www.googleapis.com/auth/drive.appdata` dan `https://www.googleapis.com/auth/userinfo.email` jika layar pengaturan meminta scope terdaftar. Jangan memilih scope `drive`, `drive.file`, atau akses penuh ke Drive.
6. Masuk **Clients → Create client**. Pilih **Web application**.
7. Isi **Authorized JavaScript origins** tepat seperti ini (tanpa path `/MaktabahRizqy/`):

   ```
   https://amangkitabb-lab.github.io
   ```

   Untuk alur popup berbasis token di situs statis, umumnya tidak perlu mengisi redirect URI.
8. Simpan dan salin **Client ID** yang berakhiran `.apps.googleusercontent.com`.
9. Buka https://github.com/amangkitabb-lab/MaktabahRizqy/blob/main/docs/google-config.js dan edit `clientId: ''` dengan Client ID milikmu. Pastikan file tetap valid JavaScript dan lakukan commit ke `main`.
10. Setelah GitHub Pages memuat versi terbaru, tombol **Login Google** akan membuka pemilih akun. Izinkan dua scope di atas, kemudian klik **Sinkronkan**. Lakukan hal yang sama pada HP dan laptop menggunakan **akun Google yang sama**.

**Keamanan:** Client ID memang boleh tampil pada kode situs publik. **Client Secret, API key rahasia, password, access token, atau berkas kredensial JSON tidak boleh dimasukkan ke GitHub atau chat.** Jika halaman Google Cloud menampilkan Client Secret, jangan menyalinnya.

## Cara menggunakan

- **Tanpa login:** website tetap dapat dipakai seperti versi v0.4; data hanya di perangkat ini.
- **Login Google:** sebelum menyimpan, aplikasi membaca salinan di Google Drive dan **menggabungkannya** dengan data lokal yang sudah ada. Tidak langsung mengganti seluruh koleksi.
- **Saat berubah:** penambahan, perubahan, penghapusan, progres, dan impor PDF-link memicu sinkronisasi otomatis ketika sesi Google aktif dan jaringan tersedia.
- **Pindah perangkat:** di perangkat lain, buka website, klik **Login Google** dengan akun yang sama, dan baca koleksi hasil sinkronisasi. Sebelum berpindah, gunakan **Sinkronkan** untuk memastikan data sudah terkirim.
- **Keluar Google:** tidak menghapus koleksi dari perangkat atau Google Drive. Backup JSON tetap tersedia.
- **Sesi berakhir, offline, atau jaringan bermasalah:** perubahan tetap di browser dan akan dicoba kembali saat login/sinkronisasi berikutnya. Perhatikan status sinkronisasi.
- **Akun berbeda:** browser akan menolak sinkronisasi ke akun Google berbeda dari akun pertama yang digunakan di perangkat tersebut, agar data pribadi tidak tercampur.
- **Benturan edit:** pembaruan terbaru digunakan untuk judul yang sama, dengan perlindungan terhadap data seed kosong, tautan PDF yang sudah ada, dan catatan penghapusan. Perubahan persis bersamaan pada HP/laptop masih dapat menimbulkan konflik; gunakan satu perangkat pada satu waktu dan simpan backup.

## Jika ada masalah

- **Client ID belum diisi:** status menampilkan `Perlu konfigurasi OAuth Client ID`.
- **`origin_mismatch`:** periksa bahwa Authorized JavaScript origins ialah `https://amangkitabb-lab.github.io` tepat, bukan alamat dengan path repo.
- **`access_denied` / akun bukan penguji:** buka Google Cloud **Audience → Test users** dan pastikan akun yang ingin login terdaftar.
- **Popup tertutup/diblokir:** buka di Chrome/Safari biasa, bukan browser internal aplikasi, dan izinkan popup dari situs.
- **Sesi habis:** klik Login Google lagi. Token tidak disimpan secara permanen demi keamanan.
- **Masuk di perangkat baru, progres belum muncul:** klik Sinkronkan pada perangkat lama dan login/sinkronkan lagi di perangkat baru.
- **Koleksi penting:** gunakan **Ekspor Cadangan** secara berkala. Penghapusan data aplikasi dari Google Drive dapat menghapus salinan cloud.

## Sumber dokumentasi Google

- https://developers.google.com/identity/oauth2/web/guides/use-token-model
- https://developers.google.com/workspace/drive/api/guides/appdata
- https://developers.google.com/workspace/drive/api/guides/manage-uploads
- https://support.google.com/cloud/answer/15549257