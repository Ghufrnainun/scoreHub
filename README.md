# 🏸 scoreHub - Real-Time Scoreboard Suite

**scoreHub** adalah platform scoreboard olahraga real-time berbasis web modern yang dirancang khusus untuk pertandingan badminton (dan olahraga lainnya). Operator atau wasit dapat mengontrol jalannya pertandingan dengan lancar via HP/tablet, sementara layar display skor utama ditampilkan secara langsung (_live_) di TV/videotron melalui browser tanpa perlu refresh halaman.

---

## ✨ Fitur Utama

### 1. ⚡ Real-Time Sync & Score Control

- **Input Skor Cepat**: Kontrol skor berbasis _rally-point_ yang _mobile-friendly_ (tambah poin, kurangi poin, undo aksi sebelumnya).
- **Manajemen Servis Otomatis**: Menampilkan _serve indicator_ (tuan rumah/tamu) beserta posisi servis kiri/kanan secara dinamis sesuai aturan badminton (tunggal/ganda).
- **Aturan Pertandingan Resmi**: Sistem set pintar (Best of 3/5, Win by 2/Deuce, Cap 30, interval otomatis di poin 11, dan jeda antar set).
- **State Recovery**: Koneksi terputus? Sistem akan memulihkan data pertandingan yang aktif secara otomatis begitu terhubung kembali.

### 2. 🔑 Sistem Keamanan Tingkat Lanjut (OWASP Compliant)

- **Master PIN**: Akses penuh admin dilindungi PIN Utama ter-hash aman di database.
- **Temporary Access Codes (Kode Sementara)**: Admin dapat membuat kode 6-digit sementara dengan batas waktu kedaluwarsa (misal 1 jam, 4 jam) untuk panitia/wasit event agar hak akses PIN utama tidak bocor.
- **Auto-Login via WhatsApp**: Fitur cepat membagikan tautan kontrol wasit langsung via WhatsApp yang otomatis mengisi Kode Display & PIN.
- **Brute-force Lockout**: Akun otomatis dikunci selama **10 menit** setelah **5 kali salah memasukkan PIN**.
- **Role Isolation (Hak Akses Terisolasi)**: Panitia sementara hanya bisa mengontrol skor pertandingan. Menu sensitif seperti **Pengaturan, Media/Iklan, dan Templat** dikunci ketat baik di tampilan UI maupun di level database back-end.

### 3. 📺 Kustomisasi Display & Visual Premium

- **Template Multi-Gaya**: Tersedia 4 gaya tampilan scoreboard bawaan:
  - **Modern**: Grid broadcast premium bergaya TV olahraga dengan kolom set.
  - **Classic**: Papan skor berpenampilan LED digital merah-hijau tradisional.
  - **Minimal**: Desain bersih (_clean_) berukuran besar untuk fokus maksimal pada skor.
  - **Neon**: Tampilan futuristik cyberpunk bernuansa _glow_ (cyan/pink).
- **Media & Iklan Broadcast**: Admin dapat memutar dan menjadwalkan tayangan iklan media (gambar/video) langsung ke layar display penonton di sela-sela pertandingan.

### 4. 🤖 Otomasi Pemeliharaan (Convex Crons)

- **Pembersihan Otomatis**: Cron harian yang otomatis menghapus token sesi yang sudah kedaluwarsa dan membersihkan kode akses sementara yang sudah usang (>30 hari) agar performa database selalu optimal.

---

## 🛠️ Arsitektur Teknologi

- **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router + TailwindCSS)
- **Realtime Backend & DB**: [Convex](https://www.convex.dev/) (Reactive Server Actions & Database)
- **Styling**: TailwindCSS & Shadcn UI
- **Deploy Cloud**: Vercel & Convex Production

---

## 🚀 Panduan Memulai & Menjalankan Lokal

### 1. Prasyarat

Pastikan Anda sudah menginstal:

- [Node.js](https://nodejs.org/) (Versi 18 ke atas)
- Akun [Convex](https://www.convex.dev/) untuk database

### 2. Instalasi Dependensi

Clone repositori dan pasang package yang diperlukan:

```bash
npm install
```

### 3. Konfigurasi Environment Variable

Salin berkas `.env.example` menjadi `.env.local` di direktori utama:

```bash
cp .env.example .env.local
```

Sesuaikan variabel env di dalamnya, terutama alamat Convex URL Anda (`NEXT_PUBLIC_CONVEX_URL`).

### 4. Menjalankan Server Pengembangan (Lokal)

Jalankan backend Convex dev secara paralel dengan server Next.js lokal:

- **Terminal 1** (Menjalankan Database Realtime & Codegen):
  ```bash
  npx convex dev
  ```
- **Terminal 2** (Menjalankan Aplikasi Web):
  ```bash
  npm run dev
  ```

Buka browser Anda di `http://localhost:3000`.

---

## 📦 Panduan Build & Deploy Produksi

### 1. Build Next.js

Lakukan audit tipe data (_TypeScript check_) dan kompilasi bundle produksi:

```bash
npm run build
```

### 2. Deploy Convex Functions & Crons

Kirim seluruh mutasi backend, skema, dan cron pembersih otomatis ke Convex cloud produksi:

```bash
npx convex deploy
```

---
