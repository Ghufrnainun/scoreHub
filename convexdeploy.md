# Convex Deploy Guide untuk Project Scoreboard

Dokumen ini menjelaskan cara pakai Convex dari nol sampai nyambung ke project ini, termasuk local dev dan deploy ke Vercel/Cloudflare.

## 1. Kondisi Project Saat Ini

Project ini sudah pakai Convex:

- Backend function ada di `convex/` (`schema.ts`, `matches.ts`, `sports/*`)
- Client provider ada di `components/convex-client-provider.tsx`
- Root app sudah dibungkus Convex provider di `app/layout.tsx`
- Hook realtime match pakai `useQuery` + `useMutation` di `hooks/use-match.ts`

Artinya, yang perlu kamu lakukan tinggal: login, link project Convex, set env, lalu jalanin app.

## 2. Prasyarat

- Node.js 18+ (disarankan 20+)
- npm
- Akun Convex aktif
- Repo ini sudah `npm install`

## 3. Setup Local (Akun Convex Sudah Ada)

Jalankan dari root project:

```bash
npx convex dev
```

Saat pertama kali jalan:

1. CLI akan minta login (kalau belum login)
2. Pilih `existing project/deployment` dari akun Convex kamu
3. Convex akan generate file di `convex/_generated/*`
4. Convex akan update env lokal (`CONVEX_DEPLOYMENT`, URL deployment)

Jika file generated belum muncul atau stale, ulangi `npx convex dev`.

## 4. Environment Variables Project Ini

Buat/copy `.env.local` (lihat `.env.example`) dan pastikan value ini ada:

```env
# Client -> dipakai Next.js untuk connect ke Convex
NEXT_PUBLIC_CONVEX_URL=https://<deployment-name>.convex.cloud

# Convex CLI local binding
CONVEX_DEPLOYMENT=<your-deployment-slug>

# Optional gate UI admin (client-side)
ADMIN_PASSWORD=1234
```

Catatan:

- `NEXT_PUBLIC_CONVEX_URL` dipakai di `components/convex-client-provider.tsx`
- Jangan commit `.env.local`

## 5. Set Secret di Convex (Server-side)

`ADMIN_PASSWORD` untuk validasi server-side tidak dibaca dari browser. Set di deployment Convex:

```bash
npx convex env set ADMIN_PASSWORD 1234
```

Cek env di Convex:

```bash
npx convex env list
```

## 6. Menjalankan Project Lokal

Buka 2 terminal:

Terminal 1:

```bash
npx convex dev
```

Terminal 2:

```bash
npm run dev
```

Lalu test flow:

1. Buka `/create`
2. Buat match baru
3. Buka control page
4. Buka display page
5. Pastikan score update realtime

## 7. Deploy ke Vercel + Convex

### 7.1 Ambil Deploy Key

Di Convex Dashboard:

`Deployment Settings -> URL and Deploy Key`

### 7.2 Set Vercel Environment Variables

Di Vercel Project Settings -> Environment Variables:

- `CONVEX_DEPLOY_KEY` = deploy key dari Convex

Jika perlu client URL sebagai fallback, tambahkan juga:

- `NEXT_PUBLIC_CONVEX_URL`

### 7.3 Build Command Vercel

Set build command:

```bash
npx convex deploy --cmd "npm run build"
```

Command ini:

1. Deploy Convex functions/schema dulu
2. Inject URL deployment untuk proses build
3. Build Next.js app

## 8. Vercel vs Cloudflare (Rekomendasi)

Untuk project ini, **rekomendasi utama: Vercel**.

Alasan:

- Project pakai Next.js App Router, dan Vercel paling native untuk Next.js.
- Flow deploy Convex paling sederhana di Vercel (`npx convex deploy --cmd "npm run build"`).
- Risiko setup/regresi lebih kecil dibanding adapter tambahan.

Cloudflare tetap bisa dipakai, tapi pertimbangkan:

- Umumnya butuh adapter/runtime tambahan untuk Next.js (misalnya OpenNext).
- Konfigurasi deployment lebih banyak (build output, runtime behavior, dan kompatibilitas package tertentu).
- Cocok kalau tim kamu memang standard infra-nya di Cloudflare.

Kesimpulan praktis:

- Kalau target kamu cepat go-live MVP: **pilih Vercel**.
- Kalau ada kebutuhan khusus edge/networking Cloudflare: boleh Cloudflare, tapi effort setup lebih tinggi.

## 9. Troubleshooting Cepat

### Error `NEXT_PUBLIC_CONVEX_URL is not set`

- Isi `NEXT_PUBLIC_CONVEX_URL` di `.env.local`
- Restart dev server Next.js

### Function berubah tapi app tidak update

- Pastikan `npx convex dev` masih jalan
- Cek apakah generated API terbaru sudah ada di `convex/_generated/`

### Unauthorized / PIN mismatch

- Pastikan `ADMIN_PASSWORD` di Convex env sesuai value yang kamu pakai
- Jika pakai admin UI gate, pastikan menggunakan `ADMIN_PASSWORD` yang sesuai.

## 10. Checklist Ringkas

- [ ] `npx convex dev` sukses dan linked ke deployment yang benar
- [ ] `.env.local` berisi `NEXT_PUBLIC_CONVEX_URL` + `CONVEX_DEPLOYMENT`
- [ ] `ADMIN_PASSWORD` sudah di-set via `npx convex env set`
- [ ] `npm run dev` jalan dan flow create/control/display realtime
- [ ] Vercel sudah punya `CONVEX_DEPLOY_KEY`
- [ ] Build command Vercel pakai `npx convex deploy --cmd "npm run build"`

## 11. Status Project Sekarang (Convex Readiness)

Berdasarkan setup saat ini, project sudah siap untuk deploy MVP:

- Convex functions untuk match lifecycle sudah tersedia (`createMatch`, `awardPoint`, `undo`, timer, template change).
- Frontend sudah terhubung ke Convex via `NEXT_PUBLIC_CONVEX_URL`.
- Build project (`npm run build`) dan lint (`npm run lint`) sudah lolos.

Yang wajib dicek sebelum deploy production:

- `CONVEX_DEPLOY_KEY` di Vercel environment variables
- `ADMIN_PASSWORD` di Convex deployment env (`npx convex env set ADMIN_PASSWORD ...`)
- `NEXT_PUBLIC_CONVEX_URL` mengarah ke deployment Convex yang benar (production, bukan dev yang salah)
