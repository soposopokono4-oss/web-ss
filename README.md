# SmartStudy — Asisten Belajar Pintar

SmartStudy adalah aplikasi belajar untuk pelajar SMA/SMK. Proyek ini dibuat menggunakan HTML, CSS, JavaScript, PHP, dan MySQL. Antarmuka responsif sehingga dapat digunakan melalui komputer maupun HP.

## Fitur

- **Dashboard:** ringkasan jadwal, tugas, dan progres penyelesaian.
- **Jadwal belajar:** tambah dan hapus jadwal berdasarkan mata pelajaran, hari, jam, dan durasi.
- **Manajemen tugas:** catat tugas, tenggat, prioritas, tandai selesai, dan hapus tugas.
- **Rekomendasi belajar:** saran berdasarkan mata pelajaran dan tingkat kesulitan.
- **AI Study Assistant:** mode demo berbasis kata kunci; backend juga disiapkan untuk integrasi API AI.
- **Akun siswa:** registrasi dan login melalui backend PHP.
- **Penyimpanan:** LocalStorage untuk mode lokal; MySQL untuk data akun yang tersinkron melalui backend.
- **PWA / Install Aplikasi:** menu khusus untuk memasang SmartStudy ke layar utama melalui browser yang mendukung.
- **Tim Pengembang:** dua slot foto pengembang yang bisa diganti dengan foto asli.

## Menu Install Aplikasi dan foto pengembang

- Menu **Install Aplikasi** menyediakan pemasangan PWA melalui browser. Website harus diakses melalui HTTPS (atau localhost saat pengembangan).
- Tombol pemasangan langsung akan muncul pada browser yang mendukung. Jika tidak muncul, gunakan menu browser dan pilih **Install app** atau **Tambahkan ke layar utama**.
- Menu **Pengembang** memiliki dua foto contoh. Ganti `assets/developer-1.svg` dan `assets/developer-2.svg` dengan foto milik masing-masing pengembang (sesuaikan juga atribut `src` di `index.html` jika memakai nama file lain). Ubah teks `Nama Kamu` dan `Nama Teman` dengan nama yang ingin ditampilkan.
- **Catatan APK:** file APK Android belum disertakan. Tombol unduh APK akan diaktifkan setelah file APK hasil proses packaging dan signing diletakkan di `downloads/SmartStudy.apk`. PWA dapat dipasang sekarang melalui browser; APK native perlu dibuat dan diuji terlebih dahulu.

## Teknologi

- HTML5
- CSS3 (responsive layout)
- JavaScript
- PHP 8.1+
- MySQL / MariaDB
- Progressive Web App (PWA)

## Menjalankan secara lokal

### Mode tampilan / demo (tanpa backend)

Buka `index.html` melalui Live Server di VS Code. Fitur jadwal dan tugas tersimpan di LocalStorage browser. Mode AI hanya memberikan jawaban demo berbasis kata kunci.

> Login, sinkronisasi lintas perangkat, dan AI melalui API membutuhkan backend PHP yang aktif.

### Mode lengkap dengan PHP dan MySQL (contoh XAMPP)

1. Instal dan jalankan XAMPP.
2. Salin folder proyek ke direktori `htdocs`, misalnya `C:/xampp/htdocs/SmartStudy`.
3. Jalankan **Apache** dan **MySQL**.
4. Buka phpMyAdmin, lalu impor file `database.sql`.
5. Duplikat `api/config.example.php` dan beri nama `api/config.php`.
6. Isi pengaturan database di `api/config.php`. File `api/config.php` sudah dikecualikan oleh `.gitignore`, jadi jangan commit file tersebut.
7. (Opsional) Untuk mengaktifkan AI sungguhan, isi konfigurasi `ai.api_key`, `ai.endpoint`, dan `ai.model` pada `api/config.php`. API key hanya boleh disimpan di server, jangan pernah ditaruh di HTML atau JavaScript frontend.
8. Buka `http://localhost/SmartStudy/`.

## Upload ke GitHub

1. Buat repository baru di GitHub.
2. Ekstrak ZIP proyek ini.
3. Pastikan `api/config.php` tidak ada di folder yang akan di-upload.
4. Upload seluruh isi folder proyek atau gunakan Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SmartStudy"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
   git push -u origin main
   ```
5. Ganti `USERNAME` dan `NAMA-REPOSITORY` dengan akun dan nama repository milikmu.

## Deploy / publikasi

**GitHub Pages:** hanya dapat menjalankan frontend statis. Halaman dashboard dan mode demo frontend dapat dipublikasikan, tetapi PHP API, login berbasis server, MySQL, dan AI backend tidak akan berjalan di GitHub Pages.

**Versi lengkap:** host frontend dan backend pada layanan hosting yang mendukung PHP 8.1+, MySQL/MariaDB, HTTPS, dan PHP cURL. Sesuaikan `window.SMARTSTUDY_API` di `index.html` jika lokasi API berbeda dari `./api/index.php`. Jika frontend dan API berada pada origin/domain berbeda, atur CORS dan cookie session secara aman di backend.

**PWA / Android:** service worker dan manifest membutuhkan HTTPS saat online (localhost diperbolehkan untuk pengembangan). Setelah frontend tersedia melalui HTTPS, uji opsi instalasi PWA di Android. Untuk APK, kemas PWA melalui alat seperti PWABuilder dan lakukan pengujian serta penandatanganan aplikasi sebelum distribusi. Letakkan hasil final pada `downloads/SmartStudy.apk` agar tautan unduh di menu Install Aplikasi bisa diaktifkan (ubah tombol di `index.html` dari status nonaktif menjadi tautan unduh).

## Catatan keamanan sebelum produksi

- Gunakan HTTPS.
- Gunakan akun database khusus dengan hak akses minimum; hindari akun `root` untuk hosting.
- Jangan commit `api/config.php`, API key, password, token, atau data pribadi.
- Tambahkan pembatasan percobaan login, rate limiting, dan proteksi CSRF sebelum aplikasi digunakan publik.
- Atur backup database dan kebijakan privasi.
- Batasi penggunaan API AI agar biaya tidak membengkak.
- Lakukan pengujian keamanan dan fungsional sebelum dipakai banyak siswa.

## Struktur folder

```text
SmartStudy/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── sw.js
├── database.sql
├── README.md
├── README_BACKEND.md
├── .gitignore
├── icons/
│   ├── icon.svg
│   └── install.svg
├── assets/
│   ├── developer-1.svg
│   └── developer-2.svg
└── api/
    ├── .htaccess
    ├── config.example.php
    └── index.php
```

---
Dibuat sebagai proyek pembelajaran SmartStudy.


## Install langsung di Android
Setelah website dipublikasikan melalui HTTPS:
1. Buka alamat website di Google Chrome Android.
2. Tekan tombol **Install Aplikasi**, atau menu ⋮ → **Install aplikasi / Tambahkan ke layar utama**.
3. Konfirmasi. Ikon SmartStudy akan muncul di layar utama.
4. Jika opsi install belum muncul, muat ulang website dan pastikan `manifest.json`, ikon PNG 192/512, serta `sw.js` dapat diakses.

SmartStudy dipasang sebagai PWA dan tidak membutuhkan file APK terpisah. APK mandiri untuk dibagikan sebagai berkas memerlukan proses pembungkusan Android (Trusted Web Activity) dan penandatanganan.
