# SmartStudy — Login, Database, dan AI

## Yang ditambahkan
- Registrasi dan login menggunakan PHP session.
- Password disimpan dengan `password_hash()` (bukan teks biasa).
- Jadwal dan tugas tersimpan di MySQL per akun.
- Sinkronisasi data saat login dan setelah perubahan.
- AI Study Assistant dapat memanggil endpoint AI dari backend. API key tidak dikirim ke browser.
- Mode lokal tetap tersedia jika backend belum dipasang.

## Kebutuhan
- PHP 8.1+ dengan ekstensi PDO MySQL, cURL, dan mbstring.
- MySQL atau MariaDB.
- Hosting/server yang mendukung PHP dan HTTPS untuk penggunaan online.

## Menjalankan di komputer (contoh XAMPP)
1. Salin folder `SmartStudy` ke `htdocs`.
2. Jalankan Apache dan MySQL dari XAMPP.
3. Buka phpMyAdmin, lalu impor file `database.sql`.
4. Salin `api/config.example.php` menjadi `api/config.php`.
5. Sesuaikan host, nama database, user, dan password MySQL di `api/config.php`.
6. Buka `http://localhost/SmartStudy/`.

Jika folder project dipasang pada subfolder lain, pastikan path `window.SMARTSTUDY_API` pada `index.html` menunjuk ke `api/index.php`.

## Mengaktifkan AI sungguhan
1. Dapatkan API key dari penyedia AI yang digunakan.
2. Isi `api_key`, `endpoint`, dan `model` pada `api/config.php`.
3. Pastikan PHP cURL aktif dan server dapat mengakses endpoint tersebut.
4. Jangan menaruh API key di `app.js`, HTML, atau file yang dapat diunduh publik.
5. Gunakan HTTPS dan batasi akses API (misalnya rate limit) sebelum aplikasi dipublikasikan.

AI memerlukan biaya/kuota dari penyedia API. Mode demo berbasis kata kunci tetap berjalan jika pengguna belum login.

## Membuat APK
Website ini sudah memiliki manifest dan service worker untuk PWA. Hosting harus menggunakan HTTPS (atau localhost saat pengembangan). Setelah dipasang online, uji instalasi PWA di Android. Untuk paket APK, gunakan PWABuilder atau Trusted Web Activity; hasil APK perlu diuji dan ditandatangani sebelum distribusi.

## Catatan keamanan sebelum produksi
- Aktifkan HTTPS.
- Lindungi `api/config.php` agar tidak dapat diakses publik.
- Tambahkan rate limiting dan proteksi CSRF untuk deployment publik.
- Gunakan password database khusus dengan hak akses minimum, bukan akun root.
- Atur backup database dan kebijakan privasi.
- Atur batas biaya/kuota pada penyedia AI.
