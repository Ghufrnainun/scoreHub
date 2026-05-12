# Panduan Deploy Scoreboard ke VPS

Panduan langkah demi langkah untuk melakukan deploy aplikasi Next.js (dengan backend Convex) ke VPS (Virtual Private Server) Ubuntu.

Karena aplikasi ini menggunakan **Next.js** untuk frontend dan **Convex** untuk backend/database, proses deploy-nya terbagi dua:
1. **Deploy Convex** → dilakukan dari **laptop** Anda (cukup sekali, tidak di VPS).
2. **Deploy Next.js** → dilakukan di **VPS** Anda.

---

## ✅ Status Saat Ini (Per Mei 2026)

| Item | Status |
|---|---|
| Convex Production deployment | ✅ Sudah — `https://canny-marten-832.convex.cloud` |
| Tabel schema di Production | ✅ Sudah terbuat setelah `npx convex deploy` |
| `.env.local` di laptop | ✅ Sudah mengarah ke Production |

---

## Persiapan Awal

Pastikan Anda sudah memiliki:
1. Akses SSH ke VPS Anda (biasanya menggunakan Ubuntu).
2. Domain aktif yang sudah diarahkan (DNS A Record) ke IP VPS Anda (opsional tapi sangat disarankan).
3. Kode project sudah di-push ke repository GitHub (`Ghufrnainun/scoreHub` atau sejenisnya).

---

## Langkah 1: Setup VPS (Install Node.js, Nginx, dan PM2)

Login ke VPS Anda via SSH:
```bash
ssh root@ip_vps_anda
```

Update sistem dan install dependencies dasar:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install curl git nginx -y
```

Install **Node.js** v20 (LTS):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifikasi instalasi:
```bash
node -v   # Harus v20.x.x
npm -v    # Harus v10.x.x
```

Install **PM2** secara global (process manager agar Next.js tetap hidup di background):
```bash
sudo npm install -g pm2
```

---

## Langkah 2: Clone Project ke VPS

```bash
cd /var/www
git clone https://github.com/Ghufrnainun/scoreHub.git scoreboard
cd scoreboard
npm install
```

---

## Langkah 3: Deploy Convex (Lakukan dari Laptop, BUKAN dari VPS)

> ⚠️ **Penting**: Convex di-host oleh platform Convex sendiri, bukan di VPS Anda.
> Jadi langkah ini **hanya dilakukan sekali dari laptop** Anda, dan sudah selesai.

Jika di masa depan ada perubahan file di folder `convex/` dan perlu deploy ulang dari **laptop**:

```powershell
# Di PowerShell laptop Anda
$env:CONVEX_DEPLOY_KEY="prod:canny-marten-832|<key_anda>"
npx convex deploy
```

Atau lebih simpel, cukup jalankan dari laptop:
```bash
npx convex deploy
```
(pastikan `NEXT_PUBLIC_CONVEX_URL` di `.env.local` sudah mengarah ke URL Production)

---

## Langkah 4: Konfigurasi Environment Variables di VPS

Buat file `.env.production` di dalam folder project di VPS:
```bash
nano /var/www/scoreboard/.env.production
```

Isi dengan konfigurasi berikut (sesuaikan nilai PIN jika diperlukan):
```env
# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://canny-marten-832.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://canny-marten-832.convex.site

# Match Configuration
DEFAULT_MATCH_DURATION=1200
MAX_MATCHES_PER_SERVER=50

# Admin Access
ADMIN_PASSWORD=8574
```

*(Tekan `Ctrl + X`, lalu `Y`, lalu `Enter` untuk menyimpan di editor nano).*

> **Catatan**: Jangan taruh `CONVEX_DEPLOY_KEY` atau `CONVEX_DEPLOYMENT` di VPS. Itu hanya untuk environment development di laptop.

---

## Langkah 5: Build dan Jalankan Aplikasi Next.js

Build project Next.js untuk produksi:
```bash
cd /var/www/scoreboard
npm run build
```

Setelah proses build selesai, jalankan aplikasi menggunakan PM2:
```bash
pm2 start npm --name "scoreboard" -- start
pm2 startup
pm2 save
```

Cek status aplikasi berjalan:
```bash
pm2 status
pm2 logs scoreboard --lines 20
```

Aplikasi Next.js sekarang berjalan di `http://localhost:3000` di dalam VPS.

---

## Langkah 6: Konfigurasi Nginx (Reverse Proxy)

Buat file konfigurasi Nginx baru:
```bash
sudo nano /etc/nginx/sites-available/scoreboard
```

Masukkan konfigurasi berikut (ganti `domain_anda.com` dengan domain atau IP VPS Anda):
```nginx
server {
    listen 80;
    server_name domain_anda.com www.domain_anda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/scoreboard /etc/nginx/sites-enabled/
sudo nginx -t     # Pastikan output: "syntax is ok" dan "test is successful"
sudo systemctl restart nginx
```

Aplikasi sekarang sudah bisa diakses melalui `http://domain_anda.com`! 🎉

---

## Langkah 7 (Opsional tapi Sangat Disarankan): Pasang SSL/HTTPS Gratis

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domain_anda.com -d www.domain_anda.com
```

Certbot akan otomatis mengonfigurasi Nginx untuk HTTPS dan auto-renewal sertifikat.

---

## Cara Update Aplikasi Jika Ada Perubahan Kode

Setiap kali ada perubahan kode yang di-push ke GitHub:

**Dari laptop** (jika ada perubahan di folder `convex/`):
```powershell
$env:CONVEX_DEPLOY_KEY="prod:canny-marten-832|<key_anda>"
npx convex deploy
```

**Di VPS** (selalu dilakukan untuk perubahan apapun):
```bash
cd /var/www/scoreboard
git pull
npm install          # Hanya jika ada package baru
npm run build
pm2 restart scoreboard
```
