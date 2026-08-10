# PB Registration Form Completion Plan

**Goal:** Sambungkan form publik ke data wilayah Convex lokal, pakai alur tanggal lahir lebih dulu, dan aktifkan validasi browser + server.

## Constraints
- Data wilayah selalu dibaca dari `regions` Convex; dropdown tetap tampil disabled/empty sebelum data diimpor.
- Tanggal lahir memakai date picker, tidak input umur manual.
- Pas foto wajib semua kategori.
- Dokumen kategori sementara: anak = KK/akta lahir; taruna = kartu pelajar/KK/akta; dewasa = KTP/SIM. Mudah diganti nanti.
- Validasi frontend bukan pengganti validasi Convex.
- Tidak deploy atau impor production.

## Tasks

### Task 1 — Pure validation helpers
- [ ] Buat helper kategori umur, tanggal maksimum, normalisasi WA, dan aturan dokumen.
- [ ] Tambah assert-based test tanpa framework untuk batas umur, tanggal masa depan, dan WA.
- [ ] Jalankan test.

### Task 2 — Address data model
- [ ] Tambah province/regency/district/village code+name, postal code, dan detail alamat ke `pb_registrations`.
- [ ] Validasi server bahwa hierarchy wilayah ada dan parent-child cocok.
- [ ] Simpan nama snapshot agar data registrasi lama tidak berubah saat dataset diperbarui.

### Task 3 — DOB-first UI
- [ ] Pecah form jadi tahap `Tanggal lahir` lalu `Data & dokumen`.
- [ ] Gunakan `<input type="date">`, `max=today`, `required`; jangan sediakan input umur bebas.
- [ ] Tampilkan kategori hasil hitung dan tombol lanjut hanya bila tanggal valid.

### Task 4 — Cascading region dropdowns
- [ ] Query provinsi dari root.
- [ ] Query kabupaten/kota dari provinsi terpilih.
- [ ] Query kecamatan dari kabupaten terpilih.
- [ ] Query desa/kelurahan dari kecamatan terpilih.
- [ ] Reset dropdown anak saat parent berubah; kode pos otomatis dari desa.
- [ ] Disabled + pesan jelas saat tabel wilayah belum diimpor.

### Task 5 — Inputs and documents
- [ ] Nama/klub/alamat: trim, min/max length.
- [ ] WhatsApp: numeric mobile keyboard, pattern Indonesia, normalisasi server.
- [ ] Email: optional `type=email`.
- [ ] Pas foto: image only, max 2 MiB.
- [ ] Dokumen identitas: JPG/PNG/WEBP/PDF, max 2 MiB, label mengikuti kategori.
- [ ] Server tetap cek extension, MIME, size, category, dan required files.

### Task 6 — Admin compatibility
- [ ] Tampilkan alamat lengkap dan label pas foto di halaman admin.
- [ ] Copy PBSI mencakup wilayah dan alamat.
- [ ] Pastikan file lama tetap terbaca bila ada.

### Task 7 — Verification and delivery
- [ ] Jalankan self-check, lint, build, dan `git diff --check`.
- [ ] Review diff untuk keamanan dan data loss.
- [ ] Commit kecil yang fokus lalu push branch `pendaftaran`.
- [ ] Laporkan cara import wilayah dan bagian dokumen yang bisa user finishing.
