# scoreHub

scoreHub adalah aplikasi scoreboard real-time berbasis web, fokus untuk pertandingan badminton. Operator bisa input skor dari HP/laptop, sementara display ditampilkan full-screen di TV/videotron melalui browser.

## Kenapa dibuat

- Event olahraga butuh scoreboard yang cepat, jelas, dan mudah dipakai.
- Tidak tergantung perangkat khusus (cukup browser).
- Bisa dipakai di venue tanpa internet (LAN/WiFi lokal).

## Fitur inti (V1)

- Input skor berbasis rally (Point Home / Point Away)
- Display real-time tanpa refresh
- Serve indicator (single/double) dan posisi servis
- Set management (best of 3/5, win by 2, cap 30)
- Interval timer di 11 poin + break antar set
- Konfigurasi tampilan live (ukuran, layout, warna)
- Reconnect & state recovery otomatis

## Akses

- Controller (input): web mobile-friendly
- Display (fullscreen): buka `/display`

## Teknologi

- Next.js (frontend)
- Socket.io (realtime)
- Node/Express (server)

## Catatan

Versi awal hanya untuk badminton dan single match aktif. Template olahraga lain dan fitur lanjutan akan menyusul.
