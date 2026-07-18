# Riset data wilayah Indonesia untuk registrasi ScoreHub

_Diperiksa 18 Juli 2026. Ukuran di bawah adalah ukuran file, bukan ukuran checkout Git._

## Rekomendasi

**Bundel lalu impor `cahyadsn/wilayah` sebagai sumber utama.** Dataset MIT, paling mutakhir, memakai kode Kemendagri hierarkis, dan mencakup penuh 38 provinsi, 514 kabupaten/kota, 7.285 kecamatan, serta 83.762 desa/kelurahan. Tambahkan `cahyadsn/wilayah_kodepos` lewat join `kode` bila kode pos memang dibutuhkan.

- Import satu kali saat build/migration ke DB lokal; dropdown membaca DB ScoreHub. Tidak ada request per pengguna, ketergantungan uptime pihak ketiga, API key, atau kuota APIIndonesia 1.000 hit/bulan.
- Jangan kirim seluruh data desa ke browser. Endpoint internal ScoreHub sebaiknya memfilter anak berdasarkan parent; indeks `parent_code`/prefix kode.
- Simpan kode sebagai **string**, bukan angka. Kode resmi bertitik: provinsi `11`, kab/kota `11.01`, kecamatan `11.01.01`, desa/kelurahan `11.01.01.2001`. Parent dapat diturunkan dari segmen kode.
- Pin unduhan ke commit SHA agar build reproducible; update terjadwal/manual saat Kepmendagri baru terbit. Catat versi Kepmendagri dalam DB.
- Kode pos bersifat tambahan nonresmi terhadap master Kemendagri. Validasi alamat penting secara terpisah; repo kode pos sendiri masih mencantumkan TODO verifikasi kelengkapan.

## Perbandingan

| Sumber | Cakupan dan ID | Lisensi | Ukuran / pembaruan | URL stabil | Cocok dibundel? |
|---|---|---|---|---|---|
| **Kemendagri, Kepmendagri 300.2.2-2430/2025** | Sumber normatif resmi; 38 provinsi, 416 kabupaten + 98 kota, 7.285 kecamatan, 8.496 kelurahan + 75.266 desa (83.762 level desa/kelurahan). Kode resmi: 2/4/6/10 digit, ditulis bertitik. Tidak memuat kode pos. | Halaman/dokumen resmi tidak menyatakan lisensi open-data/software; aman sebagai rujukan hukum, tetapi PDF kurang praktis sebagai artefak aplikasi. | PDF 5.517.958 byte; ditetapkan 23 Juni 2025. | [Halaman resmi](https://ditjenbinaadwil.kemendagri.go.id/peraturan/keputusan-menteri-dalam-negeri-300.2.2-2430-2025-228), [PDF resmi](https://ditjenbinaadwil.kemendagri.go.id/download/file/Kepmen_Perubahan_300.2.2-2430.pdf) | Bisa diekstrak/import sekali, tetapi rawan salah OCR/parsing dan tidak ada file data resmi siap impor pada halaman tersebut. Pakai untuk verifikasi, bukan runtime API. |
| **`cahyadsn/wilayah` — pilihan utama** | Persis 91.599 baris: 38 + 514 + 7.285 + 83.762. ID Kemendagri bertitik dan hierarkis; SQL MySQL siap impor. README menyatakan data sesuai Kepmendagri 300.2.2-2430/2025. | [MIT](https://github.com/cahyadsn/wilayah/blob/master/LICENSE) | `db/wilayah.sql` 2.947.579 byte; commit data/repo diperiksa `8e30c590…`, 17 Juli 2026. Repo aktif, 1.225 stars saat diperiksa. | [Repo](https://github.com/cahyadsn/wilayah), [raw terpin](https://raw.githubusercontent.com/cahyadsn/wilayah/8e30c590e2346289c0f316677d14c2b787d7b14d/db/wilayah.sql), [ZIP commit](https://github.com/cahyadsn/wilayah/archive/8e30c590e2346289c0f316677d14c2b787d7b14d.zip) | **Ya.** Import lokal menghapus semua panggilan pihak ketiga per pengguna. Periksa/adaptasi sintaks bila DB ScoreHub bukan MySQL. |
| **`cahyadsn/wilayah_kodepos` — pasangan kode pos** | 83.762 mapping desa/kelurahan; key sama dengan kode Kemendagri level 4 (`xx.xx.xx.xxxx`), kode pos 5 karakter. Pemeriksaan SQL menemukan semua 83.762 baris berisi nilai, tetapi kebenaran/keunikan alamat belum dijamin. | [MIT](https://github.com/cahyadsn/wilayah_kodepos/blob/main/LICENSE) | SQL 2.351.221 byte; JSON minified 2.010.289 byte; commit `ba849715…`, 17 Juli 2026. Data di header SQL terakhir diedit 30 Juni 2025; perubahan 2026 terutama tooling/import. | [Repo](https://github.com/cahyadsn/wilayah_kodepos), [raw SQL terpin](https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/ba8497156c5cc9bcbfc527f7b8875d403eda2354/db/wilayah_kodepos.sql), [raw JSON terpin](https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/ba8497156c5cc9bcbfc527f7b8875d403eda2354/json/wilayah_kodepos.min.json) | **Ya.** Join lokal pada `kode`; nol API call. Namun README masih menyebut basis 300.2.2-2138/2025, satu revisi di belakang master wilayah 2430/2025. |
| **`yonatanyl/KODE-WILAYAH-KEPMENDAGRI-2025`** | 38/514/7.285/83.762, satu workbook; kolom kode dan nama tiap level. Diolah via OCR PDF + Excel, basis README masih Kepmendagri 300.2.2-2138/2025. Tidak ada kode pos. | [CC BY 4.0](https://github.com/yonatanyl/KODE-WILAYAH-KEPMENDAGRI-2025/blob/main/LICENSE), atribusi wajib. | XLSX 4.011.160 byte; commit terakhir isi `e312223…`, 8 Juni 2025. | [Repo](https://github.com/yonatanyl/KODE-WILAYAH-KEPMENDAGRI-2025), [raw XLSX terpin](https://raw.githubusercontent.com/yonatanyl/KODE-WILAYAH-KEPMENDAGRI-2025/e312223cd14eb0e344be3a735c51fa4f801a4fab/KODE-WILAYAH-KEPMENDAGRI-2025.xlsx) | Ya, sesudah transform XLSX. Lebih sulit diautomasi dan lebih lama daripada pilihan utama; risiko OCR dinyatakan pembuat. |
| **`emsifa/api-wilayah-indonesia`** | CSV lokal: hanya 34 provinsi, 514 kab/kota, 7.215 kecamatan, 80.534 desa; ID numerik tanpa titik + explicit parent ID. Tidak ada Papua hasil pemekaran terbaru dan tidak ada kode pos. Menyediakan JSON statis per parent. | **Tidak ada LICENSE pada repo**; hak reuse/bundling tidak jelas. | CSV sumber total ±2,58 MB; commit default terakhir `ebc5151…`, 31 Agustus 2022 (GitHub `pushed_at` 23 April 2024). | [Repo](https://github.com/emsifa/api-wilayah-indonesia), [dokumentasi endpoint](https://github.com/emsifa/api-wilayah-indonesia#endpoints), [raw CSV desa terpin](https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/ebc5151c762d46d89c0679f5d61e6b5bb6db8c40/data/villages.csv) | Secara teknis bisa fork/self-host atau impor CSV sehingga tanpa kuota. **Tidak disarankan**: usang dan lisensi tak jelas. Hosted GitHub Pages tetap menambah request eksternal per dropdown. |
| **`teguh02/Wilayah-Indonesia-Beserta-Kode-Pos`** | CSV: 34 provinsi, 475 kab/kota, 6.994 kecamatan, 81.225 desa/kelurahan dan kode pos. Memakai surrogate integer ID, bukan kode Kemendagri; relasi parent eksplisit. | **Tidak ada LICENSE**. | `full.csv` 6.001.254 byte; seluruh CSV utama ±10,26 MB; commit `9293753…`, 14 September 2024. | [Repo](https://github.com/teguh02/Wilayah-Indonesia-Beserta-Kode-Pos), [raw full CSV terpin](https://raw.githubusercontent.com/teguh02/Wilayah-Indonesia-Beserta-Kode-Pos/9293753f2158ce040c7d9d5f5e2647181688912b/CSV/full.csv) | Bisa secara teknis, tetapi **jangan dipilih**: cakupan provinsi lama, bukan ID Kemendagri, provenance dan hak reuse tidak jelas. |

## Bentuk impor minimum

Satu tabel cukup:

```text
regions(code PK, parent_code FK nullable, level, name, postal_code nullable)
```

Transform `wilayah.sql`; derive `parent_code` dari segmen kode. Left join `wilayah_kodepos` hanya untuk level desa/kelurahan. Buat indeks `(parent_code, name)`. API internal: `GET /api/regions?parent=<code>`; root mengembalikan provinsi. Hasil: satu import saat deploy, lalu seluruh trafik lokal.

## Catatan sumber dan risiko

- Angka cakupan resmi dan aturan kode: [README `cahyadsn/wilayah`, bagian data dan kodefikasi](https://github.com/cahyadsn/wilayah#data-kepmendagri-no-30022-2430-tahun-2025), silang dengan [halaman resmi Kemendagri](https://ditjenbinaadwil.kemendagri.go.id/peraturan/keputusan-menteri-dalam-negeri-300.2.2-2430-2025-228).
- URL `raw ... /master` mudah tetapi berubah diam-diam. URL commit SHA di tabel stabil/immutable; untuk pembaruan, review diff lalu ganti SHA.
- Kode wilayah bisa berubah saat pemekaran/pemutakhiran. Jangan jadikan nama sebagai key dan jangan menghapus nilai lama yang telah tersimpan tanpa strategi migrasi/audit.
- Lisensi repo mencakup distribusi repo oleh pemiliknya; status hak cipta fakta pemerintah sendiri tidak dijelaskan pada halaman resmi. Pertahankan file lisensi/atribusi saat membundel.
- `wilayah.id` menawarkan API JSON gratis, tetapi situs yang diperiksa tidak memberi artefak repo/download self-host yang jelas. Karena tujuan menghindari runtime dependency dan kuota, dataset berlisensi dengan snapshot terpin lebih aman.

## Keputusan

Pilih `cahyadsn/wilayah` + opsional `cahyadsn/wilayah_kodepos`; pin SHA; import ke DB ScoreHub. Jangan gunakan APIIndonesia atau API publik lain saat pengguna mengisi formulir.
