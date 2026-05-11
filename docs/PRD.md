# Product Requirements Document (PRD)

**Status:** Implementation-aligned spec (updated **May 7, 2026**)

## Sistem Scoreboard Real-time Berbasis Web (Badminton Only)

---

## 1. Latar Belakang

Pada event olahraga, lomba, maupun pertandingan kampus, dibutuhkan sistem scoreboard yang:

- Mudah digunakan oleh operator
- Fleksibel di berbagai perangkat
- Dapat menampilkan skor secara real-time di layar besar (TV / Videotron)

Sistem ini dirancang berbasis **web** agar tidak bergantung pada jenis device tertentu dan mudah di-deploy di berbagai venue.

---

## 2. Tujuan Produk

- Menyediakan sistem input skor badminton yang dapat diakses dari HP, laptop, atau tablet
- Menampilkan scoreboard badminton real-time di layar lapangan melalui browser
- Memberikan fleksibilitas konfigurasi tampilan badminton (ukuran, layout, warna)
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

### 4.1 In Scope (V1 - Implemented & Active)

- Badminton-only scoreboard
- Web controller (input skor) untuk pertandingan badminton
- Web display (scoreboard fullscreen) di `/match/[id]/display`
- Real-time update (tanpa refresh)
- **Multi-match / multi-court** (lebih dari 1 match aktif)
- Template badminton (modern/classic/minimal/neon)
- Undo multi-step (disimpan history hingga 50 state)
- Referee link per match (token) tanpa login untuk wasit
- Audit log level poin (tiap aksi tercatat)

### 4.2 Planned (Belum Diimplementasikan)

- Interval timer 11 poin & break antar set
- Best of 5 (opsional format match badminton)
- Manual end set / manual edit skor via UI dedicated
- Realtime moderation dashboard (review audit log langsung)
- Confirmation/lock action di UI wasit (modal/long-press)
- Animasi visual feedback wasit (highlight/score tick)
- Doubles rotation / receiver logic lengkap
- Change ends (badminton)
- Halaman viewer `match_events` (filter by matchId, actor, timestamp)
- Production deployment hardening (env/deploy key/preview branch)

### 4.3 Out of Scope

- Hardware scoreboard fisik
- Integrasi broadcast TV / overlay streaming
- Statistik lanjutan (shot, foul detail)
- Multi venue dan cloud sync
- Mobile native app (Android/iOS)
- Inisiatif multi-sport (sport registry, cross-sport templates, global template library)

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

### 6.1 Match Setup (Implemented)

- Buat match baru via landing page (auto-generate matchId)
- Pilih mode badminton (single/double) dan kategori (MS/WS/MD/WD/XD)
- Pilih template badminton
- Set nama tim dan pemain (home/away)
- Admin akses via **PIN global**
- Generate **referee link** per match (token unik)

### 6.2 Score Control (Implemented)

- Input berbasis rally: **Point Home** / **Point Away**
- Undo **multi-step** (tiap klik undo mundur 1 state)
- Support dua tim (Home vs Away)
- `score:update` tersedia via mutation `matches.updateScore` untuk koreksi skor (belum ada UI dedicated)

### 6.3 Serve Logic (Partially Implemented)

- Server ditentukan otomatis: pemenang rally menjadi server
- Service court ditentukan dari **paritas skor server** (genap=right, ganjil=left)
- Indicator servis di display
- **Doubles rotation / receiver logic belum dimodelkan**

### 6.4 Set & Match Management (Implemented)

- Auto end set ketika skor memenuhi rule (21, win by 2, cap 30)
- Auto end match saat team menang 2 set (best of 3)
- Tidak ada manual end set / manual override via UI
- History disimpan persistent di Convex (maks 50 state) untuk undo

### 6.5 Timer (Implemented)

- Timer mutation tersedia (`matches.timerStart`, `matches.timerPause`, `matches.timerReset`)
- UI kontrol timer di control page memakai state timer Convex (sinkron lintas device)

### 6.6 Real-time Sync (Implemented)

- Update skor < 1 detik
- Sinkron ke semua display aktif

---

## 7. Konfigurasi Tampilan (Display Config)

Konfigurasi tampilan disimpan di `displayConfig`; parameter utama saat ini adalah `templateId` untuk pemilihan layout display badminton.

### 7.1 Template Scoreboard Badminton (Implemented)

- Template id: `modern`, `classic`, `minimal`, `neon`

Template menentukan:

- Struktur layout
- Posisi skor dan nama tim
- Skala default elemen

### 7.2 Customisasi Template (Implemented)

- `displayConfig` menyimpan `templateId` (dan opsional `primaryColor`)
- Pemilihan template pada pembuatan match (`/create`) terhubung ke mutation `matches.createMatch`
- UI template selector di `/admin/templates` terhubung ke mutation `matches.changeTemplate` (by `matchId`)
- Display merender template badminton sesuai `templateId`

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
- Tidak ada dependency ke server Socket.io terpisah

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
- State match tersimpan persistent di Convex
- Client yang baru terhubung atau reconnect **wajib menerima full state match** dari query Convex

### 10.3 Usability

- Tombol besar untuk operator
- UI kontras tinggi untuk display

---

## 11. Wasit Control Panel (Input System)

Bagian ini mendefinisikan **cara wasit berinteraksi dengan sistem** saat pertandingan berlangsung. Fokus utama: cepat, aman dari salah input, dan minim distraksi.

### 11.1 Prinsip Desain Wasit UI

- Tombol **besar & jelas** (thumb-friendly)
- Wasit **tidak input angka**, hanya memilih **pemenang rally**
- Semua logic (serve, set, rotasi) diproses di Convex functions
- UI tahan salah pencet (undo & confirm)
- Akses via **referee link** (token) tanpa login

### 11.2 Model Input Wasit (Implemented)

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

### 11.3 Primary Actions (Implemented)

| Aksi                | Deskripsi                 |
| ------------------- | ------------------------- |
| Point Home          | Home memenangkan rally    |
| Point Away          | Away memenangkan rally    |
| Timer Start / Pause | Kontrol waktu             |
| Undo Last Rally     | Batalkan 1 rally terakhir |

### 11.4 Undo / Correction Rule (Implemented)

- Undo **multi-step** (tiap klik mundur 1 state, max 50 state tersimpan)
- Undo mengembalikan skor + server + service court + set state
- Undo **disabled** saat match selesai (status finished)
- Undo tersedia untuk role **Wasit & Admin**

### 11.5 Confirmation & Lock Action (Partially Implemented)

- Konfirmasi aksi berisiko sudah tersedia via modal di control page
- Aksi cepat rally tetap tanpa konfirmasi agar flow wasit tidak lambat
- Mekanisme long-press lock action belum diimplementasikan

### 11.6 Visual Feedback untuk Wasit (Partially Implemented)

- Perubahan skor muncul instan di UI
- Indikator servis ikut berubah sesuai state
- Animasi khusus (highlight/score tick) belum diimplementasikan

### 11.7 State Recovery (Implemented)

- HP wasit mati -> buka ulang -> state kembali
- Browser reload -> auto sync
- Koneksi drop beberapa detik -> lanjut tanpa reset

Semua state diambil ulang dari Convex sebagai **single source of truth**.

---

## 12. Security & Akses

### 12.1 Role & Permission (Implemented)

| Role    | Hak Akses                                                                        |
| ------- | -------------------------------------------------------------------------------- |
| Admin   | Buat match, reset match, pilih template, ubah konfigurasi tampilan, assign wasit |
| Wasit   | Input skor, kontrol timer, ubah serve/sisi, challenge, reset/finish, ubah template/konfigurasi, issue referee access token |
| Display | Read-only, tidak dapat mengirim event                                            |

- Admin akses via **PIN global**
- Wasit akses via **referee link** per match (token)
- Validasi role dilakukan di **Convex functions**
- Display read-only (tanpa PIN)

### 12.2 Referee Link (Token) - Per Match (Implemented)

- Token unik dibuat oleh admin untuk tiap match
- Token memiliki masa berlaku (default: sampai match selesai; opsional 24 jam)
- Token bisa dicabut/di-rotate jika bocor
- Token hanya valid untuk 1 match

### 12.3 Audit Log (Level Poin) (Implemented)

- Semua aksi wasit tercatat (point, undo, timer)
- Log menyimpan **before/after score**, timestamp, dan `actorTokenId`
- Admin dapat melihat riwayat log setelah pertandingan (post-match review)

### 12.4 Onboarding Per Role (Implemented)

- Setelah masuk, user pilih role (Admin/Wasit)
- Onboarding ringan 1 layar untuk tiap role
- Preferensi role disimpan untuk device yang sama

---

## 13. MVP Definition (Versi 1.0 - Badminton)

### Wajib (Implemented)

- Input skor berbasis rally
- Serve indicator (single/double)
- Display fullscreen
- Real-time update
- State match tersimpan di Convex
- Reconnect & state recovery otomatis
- Satu match aktif

### Nice to Have (Planned)

- Multi lapangan
- Tema warna lebih lanjut
- QR pairing

---

## 14. Acceptance Criteria (Badminton V1 - Implemented)

- Perubahan skor tampil di semua display < 1 detik (dalam LAN)
- End set otomatis saat skor memenuhi rule (21 poin, win by 2, cap 30)
- Serve indicator konsisten dengan skor server (paritas genap/ganjil)
- Reconnect client mengembalikan state penuh dalam < 2 detik
- Undo mengembalikan skor + serve state dengan benar

---

## 15. Future Improvement (Badminton & Platform)

- Interval 11 poin dan break antar set
- Change ends sesuai aturan badminton
- Model rotasi doubles lengkap
- Viewer dan moderasi audit log realtime
- Hardening deployment production

---

## 16. Success Metrics

- Skor tampil tanpa delay
- Operator tidak salah input
- Setup < 10 menit di venue

---

## 17. Catatan

- Browser digunakan sebagai media render display demi fleksibilitas dan reliability di lapangan.
- Sistem **menggunakan Convex** untuk state match dan audit log agar konsisten lintas device.
- Penyimpanan persistent diperlukan untuk history match dan akses multi-device selama event.

---

## 18. Badminton Rules & Match Flow

### 18.1 Scoring Rules (Implemented)

- Rally point system
- Set to 21 poin
- Win by 2 poin
- Cap di 30 poin

### 18.2 Match Format (Implemented)

- Best of 3 (fixed)

### 18.3 Interval & Break (Planned)

- Belum diimplementasikan

### 18.4 Change Ends (Planned)

- Belum diimplementasikan

### 18.5 Serve Rules (Partially Implemented)

- Server = pemenang rally
- Service court berdasarkan skor **server** (genap=right, ganjil=left)
- Rotasi doubles (server/receiver/partner) belum dimodelkan

---

## 19. Match State Definition (Core Data Model)

Match State adalah single source of truth yang disimpan persistent di Convex (table `matches`). Semua client (wasit, admin, display) sync ke data ini via query realtime.

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

## 20. Realtime Communication (Convex Query/Mutation)

Realtime menggunakan subscription query Convex, bukan event socket manual.

### Client -> Convex (Implemented)

- Query:
  - `matches.get` (state full match per `matchId`)
  - `matches.listAdmin` (list match untuk dashboard admin)
- Mutation:
  - `matches.createMatch` (admin)
  - `matches.updateScore` (admin/referee) -> manual delta
  - `matches.awardPoint` (admin/referee) -> rally winner
  - `matches.undo` (admin/referee)
  - `matches.useChallenge` (admin/referee)
  - `matches.timerStart` / `matches.timerPause` / `matches.timerReset` (admin/referee)
  - `matches.updateDisplayConfig` (admin/referee)
  - `matches.changeTemplate` (admin/referee)
  - `matches.changeServe` (admin/referee)
  - `matches.toggleSides` (admin/referee)
  - `matches.resetMatch` (admin/referee)
  - `matches.finishMatch` (admin/referee)
  - `matches.updateTimer` (admin/referee)
  - `matches.updateAds` (admin/referee)
  - `matches.issueRefereeAccessToken` (admin/referee)
  - `matches.deleteMatch` (admin)

### Convex -> Client (Implemented)

- Subscription `useQuery(api.matches.get)` mengirim update state otomatis ke semua client terkait match
- Tidak ada channel `socket.emit/socket.on` di frontend
- Error permission/validasi dikirim sebagai `ConvexError` dari query/mutation

---

## 21. Permission Matrix (Implemented)

| Operation                      | Admin | Wasit | Display |
| ------------------------------ | ----- | ----- | ------- |
| `matches.createMatch`          | YES   | NO    | NO      |
| `matches.updateScore`          | YES   | YES   | NO      |
| `matches.awardPoint`           | YES   | YES   | NO      |
| `matches.undo`                 | YES   | YES   | NO      |
| `matches.useChallenge`         | YES   | YES   | NO      |
| `matches.timerStart`           | YES   | YES   | NO      |
| `matches.timerPause`           | YES   | YES   | NO      |
| `matches.timerReset`           | YES   | YES   | NO      |
| `matches.updateDisplayConfig`  | YES   | YES   | NO      |
| `matches.changeTemplate`       | YES   | YES   | NO      |
| `matches.changeServe`          | YES   | YES   | NO      |
| `matches.toggleSides`          | YES   | YES   | NO      |
| `matches.resetMatch`           | YES   | YES   | NO      |
| `matches.finishMatch`          | YES   | YES   | NO      |
| `matches.updateTimer`          | YES   | YES   | NO      |
| `matches.updateAds`            | YES   | YES   | NO      |
| `matches.issueRefereeAccessToken` | YES | YES   | NO      |
| `matches.deleteMatch`          | YES   | NO    | NO      |
| `matches.get`                  | YES   | YES   | YES     |
| `matches.listAdmin`            | YES   | NO    | NO      |

---

## 22. Template System (Badminton)

Template disimpan sebagai **id** di `displayConfig` dan dirender oleh display page untuk layout badminton.

### 22.1 Badminton Template (BWF Style)

Template ini mengadopsi gaya scoreboard **BWF resmi**, dirender dalam **satu layar (single screen)**.

#### Layout Characteristics

- Dua baris tim (Home / Away)
- Skor **current set** ditampilkan besar
- Skor **set sebelumnya** ditampilkan kecil (historical context)
- Tidak menampilkan indikator "menang set ke-X"
- Fokus ke kejelasan skor berjalan

### 22.2 Serve Indicator (Shuttle Icon)

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

### 22.3 Set Display Rule

- NO Tidak menampilkan angka kemenangan set (misal: Set 1 dimenangkan Home)
- YES Hanya menampilkan **skor akhir set sebelumnya**

Contoh tampilan:

```
SET 1: 21 - 18
SET 2: 9 - 12   <- current set (besar)
```

### 22.4 Visual Configuration (Live Editable)

- Font size (per elemen): team name, current score, previous set score
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

## 23. Phase 2 Roadmap (Post-Convex Hardening)

### 23.1 Current Baseline (Implemented)

- State match, rules badminton, audit log, dan realtime update sudah berjalan di Convex
- `server/` Socket.io lama sudah tidak digunakan
- Frontend consume query/mutation Convex via `useQuery` dan `useMutation`

### 23.2 Next Priorities (Planned)

1. **Audit log visibility & moderation**
   - Tambah viewer `match_events` dan filter penting untuk post-match review dan monitoring.

2. **Input safety UX**
   - Tambah confirm/lock action untuk mencegah salah pencet.

3. **Rule completeness (badminton)**
   - Tambah interval/break, change ends, dan doubles rotation logic yang lengkap.

4. **Production deployment hardening**
   - Standarkan deployment Convex + frontend (environment variables, deploy key, branch preview).
