# Product Requirements Document (PRD)

**Status:** Implementation-aligned spec (updated **February 1, 2026**)

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

## 4. Scope Produk (Target Sistem)

### 4.1 In Scope (V1 - Target)

- Multi-sport: **Badminton, Basket, Voli, Tenis, Futsal, Sepakbola**
- Web controller (input skor) untuk tiap sport
- Web display (scoreboard fullscreen) di `/match/[id]/display`
- Real-time update (tanpa refresh)
- **Multi-match / multi-court** (lebih dari 1 match aktif)
- Template per olahraga (2-3 template default / sport)
- Undo multi-step (disimpan history hingga 50 state)
- Referee link per match (token) tanpa login untuk wasit
- Audit log level poin (tiap aksi tercatat)

### 4.2 Out of Scope (Belum Diimplementasikan)

- Template lintas-olahraga (global template library)
- Hardware scoreboard fisik
- Integrasi broadcast TV / overlay streaming
- Statistik lanjutan (shot, foul detail)
- Multi venue dan cloud sync
- Interval timer 11 poin & break antar set
- Best of 5
- Manual end set / manual edit skor via UI
- Realtime moderation dashboard (review audit log langsung)

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

## 6. Fitur Utama (Core Features - Multi Sport)

### 6.1 Match Setup

- Buat match baru via landing page (auto-generate matchId)
- Pilih sport (badminton/basket/voli/tenis/futsal/sepakbola)
- Pilih template **per olahraga**
- Kategori sesuai sport (contoh: badminton MS/WS/MD/WD/XD)
- Set nama tim dan pemain (home/away)
- Admin akses via **PIN global**
- Generate **referee link** per match (token unik)

### 6.2 Score Control (Rally-based)

- Input berbasis rally: **Point Home** / **Point Away**
- Undo **multi-step** (tiap klik undo mundur 1 state)
- Support dua tim (Home vs Away)
- `score:update` tersedia (event) untuk koreksi skor, belum ada UI dedicated

### 6.3 Serve Logic (Badminton)

- Server ditentukan otomatis: pemenang rally menjadi server
- Service court ditentukan dari **paritas skor server** (genap=right, ganjil=left)
- Indicator servis di display
- **Doubles rotation / receiver logic belum dimodelkan**

### 6.4 Set & Match Management

- Auto end set ketika skor memenuhi rule (21, win by 2, cap 30)
- Auto end match saat team menang 2 set
- Tidak ada manual end set / manual override via UI
- History disimpan di server (maks 50 state) untuk undo

### 6.5 Timer

- Event timer tersedia (`timer:start`, `timer:pause`, `timer:reset`)
- **Timer belum diinisialisasi di match state**, jadi fitur timer belum aktif

### 6.6 Real-time Sync

- Update skor < 1 detik
- Sinkron ke semua display aktif

---

## 7. Konfigurasi Tampilan (Display Config)

Konfigurasi tampilan memiliki event realtime, tetapi display saat ini belum menerapkan perubahan selain templateId default.

### 7.1 Template Scoreboard (V1)

- Badminton (BWF style) melalui template id `modern`

Template menentukan:

- Struktur layout
- Posisi skor dan nama tim
- Skala default elemen

### 7.2 Customisasi Template (Status Saat Ini)

- `displayConfig` saat ini hanya menyimpan `templateId` (dan opsional `primaryColor`)
- UI template selector di `/admin/templates` masih **mock** (belum terhubung realtime)
- Display belum menerapkan variasi tema/template selain layout default

---

## 8. Arsitektur Sistem (High Level)

```
[Controller Web]     [Admin Console]
         \                /
          -> [Convex: DB + Realtime]
                    |
              [Display Web]
                    -> HDMI
              [TV / Videotron]
```

- Realtime dan state authoritative disimpan di Convex
- Client subscribe ke query (live updates), perubahan via mutation
- Socket.io server tetap tersedia selama transisi

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
- Akses via **referee link** (token) tanpa login

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

Karena kesalahan input **pasti terjadi di lapangan**, sistem menyediakan undo.

Aturan:

- Undo **multi-step** (tiap klik mundur 1 state, max 50 state tersimpan)
- Undo mengembalikan skor + server + service court + set state
- Undo **disabled** saat match selesai (status finished)

Undo hanya tersedia untuk role **Wasit & Admin**.

### 11.5 Confirmation & Lock Action

Saat ini **belum ada mekanisme konfirmasi** (modal/long-press) di UI.
Event sensitif yang tersedia di server hanya bisa diakses oleh admin.

### 11.6 Visual Feedback untuk Wasit

- Perubahan skor muncul instan di UI
- Indikator servis ikut berubah sesuai state
- Animasi khusus (highlight/score tick) belum diimplementasikan

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
| Wasit   | Input skor, kontrol timer (endpoint tersedia, belum aktif)                       |
| Display | Read-only, tidak dapat mengirim event                                            |

- Admin akses via **PIN global**
- Wasit akses via **referee link** per match (token)
- Validasi role dilakukan di **server/Convex functions**
- Display read-only (tanpa PIN)

### 12.2 Referee Link (Token) - Per Match

- Token unik dibuat oleh admin untuk tiap match
- Token memiliki masa berlaku (default: sampai match selesai; opsional 24 jam)
- Token bisa dicabut/di-rotate jika bocor
- Token hanya valid untuk 1 match

### 12.3 Audit Log (Level Poin)

- Semua aksi wasit tercatat (point, undo, timer)
- Log menyimpan **before/after score**, timestamp, dan `actorTokenId`
- Admin dapat melihat riwayat log setelah pertandingan (post-match review)

### 12.4 Onboarding Per Role

- Setelah masuk, user pilih role (Admin/Wasit)
- Onboarding ringan 1 layar untuk tiap role
- Preferensi role disimpan untuk device yang sama

---

## 13. MVP Definition (Versi 1.0 - Badminton)

Wajib ada:

- Input skor berbasis rally
- Serve indicator (single/double)
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

## 14. Acceptance Criteria (Badminton V1 - Implemented)

- Perubahan skor tampil di semua display < 1 detik (dalam LAN)
- End set otomatis saat skor memenuhi rule (21 poin, win by 2, cap 30)
- Serve indicator konsisten dengan skor server (paritas genap/ganjil)
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

## 15A. Rencana Landing Page (SaaS)

### Tujuan

- Menjelaskan value utama produk secara singkat
- Mendorong user mencoba (CTA) atau meminta demo
- Menjadi pintu masuk dokumentasi dan live demo

### Target Audience

- Venue olahraga
- Perorangan penyelenggara event/latihan

### Brand & Positioning

- **Brand name (pilihan utama):** Scorehub
- Alternatif nama (opsional): ScoreHub Live, CourtScore, RallyBoard
- Tone bahasa: santai
- Warna utama (landing page): **Amber / Black / Off-White**
  - Primary: `#F59E0B`
  - Accent: `#111827`
  - Support: `#F8FAFC`

### Tagline (Pilihan Draft)

- "Scoreboard real-time, tinggal jalan."
- "Skor jelas, event lancar."
- "Real-time di lapangan, simpel di tangan."
- "Buka. Input. Tampil. Selesai."

### Value Proposition

- Real-time scoreboard tanpa refresh
- Bisa jalan **tanpa internet** (LAN/WiFi lokal)
- Setup cepat, UI operator sederhana
- Display profesional untuk TV/Videotron

### Struktur Halaman (Draft Sections)

1. Hero (headline + subheadline + CTA utama)
2. Problem → Solution (before/after)
3. Fitur utama (rally input, serve indicator, set management, realtime display)
4. Alur penggunaan (Create → Control → Display)
5. Showcase / screenshot (control & display)
6. Use cases (kampus, klub, venue)
7. CTA penutup + link demo
8. Footer (kontak, docs, status)

### CTA (Final)

- Primary: **Start Match**
- Secondary: **Upgrade to Pro**

### Monetization (Draft)

- Free tier: **1 match aktif** (tanpa history, 1 template default)
- Pro tier: multi-match, template tambahan, branding removal, sponsor/ads, cloud sync (planned)

### Asset yang Dibutuhkan

- Screenshot halaman control
- Screenshot display fullscreen
- Logo / brand wordmark (jika ada)
- (Opsional) video demo 20–40 detik

### Tracking (Opsional)

- Klik CTA utama
- Scroll depth (50% / 90%)

### Status

- **Planned** (belum diimplementasikan)

---

## 16. Success Metrics

- Skor tampil tanpa delay
- Operator tidak salah input
- Setup < 10 menit di venue

---

## 17. Catatan

- Browser digunakan sebagai media render display, bukan sebagai keterbatasan sistem, demi fleksibilitas dan reliability di lapangan.
- Sistem **menggunakan Convex** untuk state match dan audit log agar konsisten lintas device.
- Penyimpanan persistent diperlukan untuk history match dan akses multi-device selama event.

---

## 23. Multi-Sport Framework (Planned)

### 23.1 Sport Registry

- Setiap sport punya definisi rule, format, dan template default
- Contoh:
  - Badminton: best of 3, 21 poin, win by 2, cap 30
  - Basket: quarter, game clock, team foul, 2/3 points
  - Voli: best of 3/5, rally point 25, win by 2
  - Tenis: set, game, point (15/30/40/ad)
  - Futsal/Sepakbola: half, game clock, goal

### 23.2 Template per Sport

- Tiap sport punya 2-3 template default
- Template hanya muncul untuk sport yang sesuai
- Template mengatur layout, posisi skor, timer, dan indikator spesifik sport

### 23.3 Multi-Match Dashboard

- Admin bisa melihat semua match aktif
- Filter per sport / court
- Aksi cepat: buka control, copy referee link, open display

---

## 18. Badminton Rules & Match Flow (Implemented)

### 18.1 Scoring Rules

- Rally point system
- Set to 21 poin
- Win by 2 poin
- Cap di 30 poin

### 18.2 Match Format

- Best of 3 (fixed)

### 18.3 Interval & Break

- Belum diimplementasikan

### 18.4 Change Ends

- Belum diimplementasikan

### 18.5 Serve Rules (Implemented)

- Server = pemenang rally
- Service court berdasarkan skor **server** (genap=right, ganjil=left)
- Rotasi doubles (server/receiver/partner) belum dimodelkan

---

## 19. Match State Definition (Core Data Model)

Match State adalah single source of truth yang disimpan di server (in-memory). Semua client (wasit, admin, display) akan sync ke object ini.

### Contoh Match State (JSON)

```json
{
  "id": "MATCH-001",
  "matchId": "MATCH-001",
  "sport": "badminton",
  "status": "active",
  "gameMode": "double",
  "category": "MD",
  "teams": {
    "home": {
      "name": "Team A",
      "score": 12,
      "players": [{ "name": "A1" }, { "name": "A2" }],
      "setsWon": 0
    },
    "away": {
      "name": "Team B",
      "score": 10,
      "players": [{ "name": "B1" }, { "name": "B2" }],
      "setsWon": 0
    }
  },
  "currentSet": 1,
  "sets": [{ "home": 21, "away": 18 }],
  "server": "home",
  "serviceCourt": "right",
  "displayConfig": { "templateId": "modern" }
}
```

---

## 20. Realtime Communication (Socket Events)

Migrasi ke Convex (query/mutation realtime). Socket.io tetap tersedia selama transisi.

### Client -> Server (Implemented)

- `match:create` (admin)
- `score:update` (admin/referee) -> manual delta
- `point` (admin/referee) -> rally winner
- `undo` (admin/referee)
- `challenge:use` (admin/referee)
- `timer:start` / `timer:pause` / `timer:reset` (admin/referee)
- `config:update` (admin)
- `template:change` (admin)
- `serve:change` (admin/referee)

### Server -> Client (Implemented)

- `match:state` -> full state (on connect + most actions)
- `match:update` -> partial update (timer/config/template/serve)
- `match:ended`
- `error:permission`
- `error:undo`

---

## 21. Permission Matrix (Implemented)

| Event           | Admin | Wasit | Display |
| --------------- | ----- | ----- | ------- |
| match:create    | YES   | NO    | NO      |
| score:update    | YES   | YES   | NO      |
| point           | YES   | YES   | NO      |
| undo            | YES   | YES   | NO      |
| challenge:use   | YES   | YES   | NO      |
| timer:start     | YES   | YES   | NO      |
| timer:pause     | YES   | YES   | NO      |
| timer:reset     | YES   | YES   | NO      |
| config:update   | YES   | NO    | NO      |
| template:change | YES   | NO    | NO      |
| serve:change    | YES   | YES   | NO      |
| match:state     | YES   | YES   | YES     |

---

## 22. Template System

Template saat ini hanya berupa **id** yang disimpan di `displayConfig`. Belum ada rule engine/template renderer.

### 22.1 Template Structure (Planned)

```json
{
  "id": "modern",
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

---

## 24. Future Roadmap: Phase 2 (Backend Modernization)

Target: Migrasi penuh dari custom Socket.io server ke **Convex**.

### 24.1 Motivation

- **Serverless**: Tidak perlu manage VPS/EC2.
- **Auto-scale**: Handle ribuan user concurrent tanpa setup load balancer.
- **Consistency**: Database & Realtime sync jadi satu engine (ACID compliant).

### 24.2 Migration Steps

1.  **Data Modeling (Schema)**
    - Port `MatchState` (in-memory Map) ke Database Schema (`matches` table).
    - Port `SportRules` logic menjadi Convex Mutations.

2.  **Core Logic Rewrite**
    - Rewrite `server/match-manager.ts` -> `convex/matches.ts`.
    - Rewrite `socket.on` events -> `convex/actions.ts`.

3.  **Client Integration**
    - Ganti `socket.emit('score:update')` -> `useMutation(api.matches.updateScore)`.
    - Ganti `socket.on('match:state')` -> `useQuery(api.matches.get)`.

4.  **Deployment**
    - Frontend: Vercel / Cloudflare Pages.
    - Backend: Convex Cloud (Fully Managed).

