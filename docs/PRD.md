# Product Requirements Document (PRD)

## Sistem Scoreboard Real-time Berbasis Web (Badminton First)

---

## 1. Latar Belakang

Pada event olahraga, lomba, maupun pertandingan kampus, dibutuhkan sistem scoreboard yang:

- Mudah digunakan oleh operator
- Fleksibel di berbagai perangkat
- Dapat menampilkan skor secara real-time di layar besar (TV / Videotron)

Sistem ini dirancang berbasis **web** agar tidak bergantung pada jenis device tertentu dan mudah di-deploy di berbagai venue.

---

## 2. Tujuan Produk

- Menyediakan sistem input skor yang dapat diakses dari HP, laptop, atau tablet
- Menampilkan scoreboard real-time di layar lapangan melalui browser
- Memberikan fleksibilitas konfigurasi tampilan (ukuran, layout, warna)
- Stabil digunakan di event offline (LAN / WiFi lokal)

---

## 3. Target Pengguna

### 3.1 Operator

- Panitia pertandingan
- Wasit / admin lapangan

### 3.2 Viewer

- Penonton di lapangan (melalui TV / Videotron)
- Tidak memiliki akses input

---

## 4. Scope Produk

### 4.1 In Scope (V1)

- Fokus olahraga: **Badminton**
- Web controller (input skor & konfigurasi)
- Web display (scoreboard fullscreen)
- Real-time update (tanpa refresh)
- Single match aktif (single lapangan)
- Single/double, best of 3 set
- Serve indicator dan posisi servis (double)
- Interval timer (11 poin) dan break antar set

### 4.2 Out of Scope (Versi Awal)

- Template olahraga lain (futsal, basket, voli, e-sport)
- Hardware scoreboard fisik
- Integrasi broadcast TV / overlay streaming
- Statistik lanjutan (shot, foul detail)
- Multi venue dan cloud sync

---

## 5. Platform & Akses

### 5.1 Controller (Input)

- Platform: Web (mobile-friendly)
- Akses melalui URL
- Device: HP, Tablet, Laptop

### 5.2 Display (Scoreboard)

- Platform: Web (browser fullscreen)
- Device:
  - Smart TV
  - Mini PC + HDMI
  - Laptop + HDMI

---

## 6. Fitur Utama (Core Features - Badminton)

### 6.1 Match Setup

- Buat match baru
- Set kategori: Single / Double
- Set format: Best of 3 / Best of 5
- Set nama tim/pemain
- Set lapangan (A / B / C) (opsional v1)
- Set posisi awal (coin toss, pilih serve / side)

### 6.2 Score Control (Rally-based)

- Input berbasis rally: **Point Home** / **Point Away**
- Undo 1 langkah terakhir
- Reset skor (dengan konfirmasi)
- Support dua tim (Home vs Away)

### 6.3 Serve Logic (Badminton)

- Server ditentukan otomatis berdasarkan rules badminton
- Indicator servis (ikon kok) di display
- Double: posisi servis (left/right) dan rotasi partner

### 6.4 Set & Match Management

- Auto end set ketika skor memenuhi rule (win by 2, cap 30)
- Konfirmasi manual untuk end set / end match
- Manual override skor dan set (role Admin)
- Log aksi terakhir (minimal 20 action) untuk audit/undo

### 6.5 Timer

- Timer match (opsional) berbasis **server timestamp**
- Interval timer di 11 poin (default 60s)
- Break antar set (default 120s)
- Client hanya menghitung sisa waktu berdasarkan data dari server

### 6.6 Real-time Sync

- Update skor < 1 detik
- Sinkron ke semua display aktif

---

## 7. Konfigurasi Tampilan (Display Config)

Konfigurasi tampilan dapat diubah real-time dari controller dan langsung diterapkan ke display.

### 7.1 Template Scoreboard (V1)

- Badminton (BWF style)

Template menentukan:

- Struktur layout
- Posisi skor, timer, dan nama tim
- Skala default elemen

### 7.2 Customisasi Template

Setelah template dipilih, operator (admin) dapat menyesuaikan:

- Ukuran skor (S / M / L / XL)
- Font scale global
- Warna tema (dark / light / custom)
- Show / hide elemen (timer, logo, round, set)
- Orientasi (landscape / portrait)

Perubahan template dan konfigurasi langsung terlihat di display tanpa refresh.

---

## 8. Arsitektur Sistem (High Level)

```
[Controller Web]
       ->
[Realtime Server]
       ->
[Display Web]
       -> HDMI
[TV / Videotron]
```

- Komunikasi real-time menggunakan WebSocket
- Semua client terhubung ke satu server

---

## 9. Koneksi Jaringan

- Mendukung:
  - WiFi lokal
  - LAN
- Tidak wajib internet

---

## 10. Non-Functional Requirements

### 10.1 Performance

- Latensi update < 1 detik
- Stabil minimal 2 jam non-stop

### 10.2 Reliability

- Auto reconnect jika koneksi terputus
- State match tersimpan di server
- Client yang baru terhubung atau reconnect **wajib menerima full state match** dari server

### 10.3 Usability

- Tombol besar untuk operator
- UI kontras tinggi untuk display

---

## 11. Wasit Control Panel (Input System)

Bagian ini mendefinisikan **cara wasit berinteraksi dengan sistem** saat pertandingan berlangsung. Fokus utama: cepat, aman dari salah input, dan minim distraksi.

### 11.1 Prinsip Desain Wasit UI

- Tombol **besar & jelas** (thumb-friendly)
- Wasit **tidak input angka**, hanya memilih **pemenang rally**
- Semua logic (serve, set, rotasi) diproses server
- UI tahan salah pencet (undo & confirm)

### 11.2 Model Input Wasit (Core Concept)

Wasit **TIDAK** menekan tombol `+1`.

Wasit hanya memilih:

- **Rally dimenangkan oleh siapa**

Contoh tombol utama:

```
[ POINT HOME ]      [ POINT AWAY ]
```

Sistem yang bertanggung jawab:

- Menambah skor
- Menentukan server
- Mengubah service court
- Update serve indicator

### 11.3 Primary Actions (Wasit)

| Aksi                | Deskripsi                 |
| ------------------- | ------------------------- |
| Point Home          | Home memenangkan rally    |
| Point Away          | Away memenangkan rally    |
| Timer Start / Pause | Kontrol waktu             |
| Undo Last Rally     | Batalkan 1 rally terakhir |

### 11.4 Undo / Correction Rule

Karena kesalahan input **pasti terjadi di lapangan**, sistem menyediakan undo terbatas.

Aturan:

- Undo hanya **1 langkah terakhir**
- Undo mengembalikan:
  - Skor
  - Server
  - Service court
  - Court position (double)
- Undo **disabled** jika:
  - Set sudah dikunci
  - Match sudah selesai

Undo hanya tersedia untuk role **Wasit & Admin**.

### 11.5 Confirmation & Lock Action

Aksi berisiko tinggi wajib konfirmasi:

- Reset match
- End set manual
- Ganti template
- Manual edit skor / set

Metode:

- Modal konfirmasi ATAU
- Long press (+/- 2 detik)

Tujuan: mencegah salah sentuh.

### 11.6 Visual Feedback untuk Wasit

Setiap input rally wajib memberikan feedback instan:

- Animasi skor naik
- Highlight tim pemenang rally
- Update ikon servis

Ini penting agar wasit **yakin input berhasil**.

### 11.7 State Recovery (Lapangan Real Case)

Skenario yang harus aman:

- HP wasit mati -> buka ulang -> state kembali
- Browser reload -> auto sync
- Koneksi drop beberapa detik -> lanjut tanpa reset

Semua state diambil ulang dari server sebagai **single source of truth**.

---

## 12. Security & Akses

### 12.1 Role & Permission

Sistem menggunakan role sederhana untuk mengatur akses:

| Role    | Hak Akses                                                                        |
| ------- | -------------------------------------------------------------------------------- |
| Admin   | Buat match, reset match, pilih template, ubah konfigurasi tampilan, assign wasit |
| Wasit   | Input skor, kontrol timer                                                        |
| Display | Read-only, tidak dapat mengirim event                                             |

- Akses controller dilindungi PIN berdasarkan role
- Validasi role dilakukan di **server**, bukan hanya frontend
- Display tidak memiliki hak input

---

## 13. MVP Definition (Versi 1.0 - Badminton)

Wajib ada:

- Input skor berbasis rally
- Serve indicator (single/double)
- Timer interval & break antar set
- Display fullscreen
- Real-time update
- State match tersimpan di server
- Reconnect & state recovery otomatis
- Satu match aktif

Nice to have:

- Multi lapangan
- Tema warna
- QR pairing

---

## 14. Acceptance Criteria (Badminton V1)

- Perubahan skor tampil di semua display < 1 detik (dalam LAN)
- End set otomatis saat skor memenuhi rule (21 poin, win by 2, cap 30)
- Serve indicator dan posisi servis double selalu konsisten dengan skor
- Reconnect client mengembalikan state penuh dalam < 2 detik
- Undo mengembalikan skor + serve state dengan benar

---

## 15. Future Improvement

- Template olahraga lain (futsal, basket, voli, e-sport)
- Mobile App (Android / iOS) sebagai controller
- Statistik pertandingan
- Cloud hosting multi venue
- Integrasi overlay live streaming

---

## 16. Success Metrics

- Skor tampil tanpa delay
- Operator tidak salah input
- Setup < 10 menit di venue

---

## 17. Catatan

- Browser digunakan sebagai media render display, bukan sebagai keterbatasan sistem, demi fleksibilitas dan reliability di lapangan.
- Sistem **tidak mewajibkan database** pada versi awal; state match dapat disimpan di memory server selama event berlangsung.
- Database atau persistent storage hanya diperlukan untuk kebutuhan lanjutan seperti history match atau multi venue.

---

## 18. Badminton Rules & Match Flow

### 18.1 Scoring Rules

- Rally point system
- Set to 21 poin
- Win by 2 poin
- Cap di 30 poin

### 18.2 Match Format

- Default: Best of 3
- Opsional: Best of 5

### 18.3 Interval & Break

- Interval 60 detik saat salah satu tim mencapai 11 poin
- Break antar set 120 detik
- Configurable oleh admin

### 18.4 Change Ends

- Ganti sisi setelah setiap set
- Pada set penentuan (set 3/5): ganti sisi saat salah satu tim mencapai 11 poin

### 18.5 Serve Rules (Accurate)

- Serve selalu **diagonal** ke service court lawan.
- Singles: server di kanan jika skor server **genap**, kiri jika **ganjil**.
- Doubles:
  - Service court ditentukan oleh skor **tim yang serve** (genap=kanan, ganjil=kiri).
  - Jika tim yang serve menang rally, **pemain yang sama** tetap serve dan pindah sisi (kanan <-> kiri) sesuai skor baru.
  - Jika tim yang receive menang rally, **pemain yang menerima** menjadi server berikutnya (partner tidak serve).
  - Receiver berada di service court diagonal terhadap server; partner receiver bebas posisi (asal tidak menghalangi).

---

## 19. Match State Definition (Core Data Model)

Match State adalah single source of truth yang disimpan di server (memory/redis). Semua client (wasit, admin, display) akan sync ke object ini.

### Contoh Match State (JSON)

```json
{
  "matchId": "MATCH-001",
  "sport": "badminton",
  "templateId": "bwf-default",
  "status": "running",
  "format": "bo3",
  "mode": "double",
  "teams": {
    "home": { "name": "Team A", "score": 12, "players": ["A1", "A2"] },
    "away": { "name": "Team B", "score": 10, "players": ["B1", "B2"] }
  },
  "sets": {
    "current": 1,
    "home": 0,
    "away": 0,
    "history": [
      { "set": 1, "home": 21, "away": 18 }
    ]
  },
  "serve": {
    "team": "home",
    "position": "right",
    "side": "left-court"
  },
  "timer": {
    "mode": "interval",
    "intervalSeconds": 60,
    "breakSeconds": 120,
    "startedAt": 1730000000000,
    "pausedAt": null
  },
  "config": {
    "fontScale": 1,
    "showTimer": true,
    "theme": "dark"
  },
  "eventLog": [
    { "type": "rally", "team": "home", "at": 1730000000000 }
  ]
}
```

---

## 20. Realtime Communication (Socket Events)

Menggunakan Socket.io (WebSocket fallback polling).

### Client -> Server

- `match:join` -> join room matchId
- `rally:point` -> home/away menang rally
- `match:undo`
- `match:end-set`
- `timer:start`
- `timer:pause`
- `timer:reset`
- `config:update`
- `template:change`

### Server -> Client

- `match:state` -> full state (on join / reconnect)
- `match:update` -> partial update
- `timer:tick` -> optional (display bisa hitung sendiri)
- `error:permission`

---

## 21. Permission Matrix (MVP)

| Event            | Admin | Wasit | Display |
| ---------------- | ----- | ----- | ------- |
| rally:point      | NO    | YES   | NO      |
| match:undo       | YES   | YES   | NO      |
| match:end-set    | YES   | YES   | NO      |
| timer:start      | NO    | YES   | NO      |
| timer:pause      | NO    | YES   | NO      |
| config:update    | YES   | NO    | NO      |
| template:change  | YES   | NO    | NO      |
| match:state      | YES   | YES   | YES     |

---

## 22. Template System

Template adalah blueprint UI + rules yang menentukan **struktur scoreboard**, **aturan olahraga**, dan **komponen visual**.

Template **tidak hardcode UI**, tapi bersifat configurable dan scalable.

### 22.1 Template Structure (Extended)

```json
{
  "id": "bwf-default",
  "sport": "badminton",
  "layout": "single-screen-bwf",
  "mode": "single | double",
  "supports": ["score", "set", "serveIndicator"],
  "constraints": {
    "maxScore": 30,
    "winRule": "21-point"
  },
  "displayRules": {
    "showOnlyPreviousSetScore": true,
    "showSetWinIndicator": false
  }
}
```

### 22.2 Badminton Template (BWF Style)

Template ini mengadopsi gaya scoreboard **BWF resmi**, namun dirender dalam **satu layar (single screen)**.

#### Layout Characteristics

- Dua baris tim (Home / Away)
- Skor **current set** ditampilkan besar
- Skor **set sebelumnya** ditampilkan kecil (historical context)
- Tidak menampilkan indikator "menang set ke-X"
- Fokus ke kejelasan skor berjalan

### 22.3 Serve Indicator (Shuttle Icon)

Template badminton mendukung **indikator servis**:

#### Single

- Icon shuttle muncul di sisi pemain/tim yang sedang servis

#### Double

- Shuttle + posisi servis (kiri / kanan)
- Bisa dikembangkan ke highlight background ringan

```json
"serve": {
  "team": "home",
  "position": "left"
}
```

### 22.4 Set Display Rule

Sesuai kebutuhan:

- NO Tidak menampilkan angka kemenangan set (misal: Set 1 dimenangkan Home)
- YES Hanya menampilkan **skor akhir set sebelumnya**

Contoh tampilan:

```
SET 1: 21 - 18
SET 2: 9 - 12   <- current set (besar)
```

### 22.5 Visual Configuration (Live Editable)

Semua template mendukung konfigurasi visual **real-time**:

- Font size (per elemen):
  - Team name
  - Current score
  - Previous set score
- Font weight
- Warna skor (leading / normal)
- Spacing antar elemen

```json
"config": {
  "fontSizes": {
    "teamName": 24,
    "currentScore": 120,
    "previousSetScore": 18
  },
  "fontWeight": {
    "score": 700,
    "teamName": 600
  },
  "colors": {
    "leading": "#22C55E",
    "normal": "#FFFFFF"
  },
  "spacing": {
    "rowGap": 16,
    "columnGap": 24
  }
}
```
