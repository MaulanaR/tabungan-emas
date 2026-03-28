# The Sovereign Vault - Aplikasi Pencatatan Pembelian Emas

Aplikasi web modern untuk mencatat dan mengelola pembelian emas Anda dengan fitur keamanan tingkat enterprise dan antarmuka yang elegan.

## Fitur Utama

- **Autentikasi & Keamanan**: Login dan registrasi dengan Supabase
- **Dashboard Brankas**: Lihat total emas dan nilai investasi Anda
- **Pasar Real-time**: Pantau harga emas dari berbagai brand (Antam, UBS, Emasku, dll)
- **Input Pembelian**: Catat pembelian emas baru dengan detail lengkap
- **Profil Pengguna**: Kelola informasi akun dan pengaturan
- **Riwayat Transaksi**: Lihat semua pembelian dengan statistik lengkap

## Teknologi

- **Frontend**: Next.js 16, React, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Styling**: Custom design system dengan Material Symbols Icons
- **API**: Next.js Route Handlers untuk fetch harga emas

## Setup Awal

### 1. Instalasi Dependencies
```bash
npm install
# atau
pnpm install
```

### 2. Setup Database Supabase

Buka Supabase SQL Editor dan jalankan script berikut:

```sql
-- File: scripts/create-tables.sql
-- Copy-paste seluruh isi file ke Supabase SQL Editor
```

Atau gunakan Supabase CLI:
```bash
supabase db push
```

### 3. Environment Variables

Pastikan Anda sudah menambahkan environment variables di project settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Semua variabel ini sudah tersedia jika Anda menggunakan integrasi Supabase di v0.

### 4. Jalankan Development Server

```bash
npm run dev
# atau
pnpm dev
```

Aplikasi akan tersedia di `http://localhost:3000`

## Struktur File

```
app/
├── page.tsx                 # Landing page
├── layout.tsx              # Root layout
├── auth/
│   ├── login/page.tsx      # Halaman login
│   ├── sign-up/page.tsx    # Halaman registrasi
│   ├── sign-up-success/page.tsx
│   └── callback/route.ts   # OAuth callback
├── api/
│   └── gold-prices/route.ts # API untuk fetch harga emas
└── dashboard/
    ├── layout.tsx          # Dashboard layout dengan bottom nav
    ├── vault/page.tsx      # Dashboard utama (brankas)
    ├── market/page.tsx     # Halaman harga pasar
    ├── add-purchase/page.tsx # Form tambah pembelian
    ├── purchases/page.tsx  # Halaman transaksi
    └── profile/page.tsx    # Profil pengguna

lib/
├── supabase/
│   ├── client.ts          # Supabase client (browser)
│   ├── server.ts          # Supabase client (server)
│   └── proxy.ts           # Session proxy

scripts/
├── create-tables.sql      # Migration database
└── seed-gold-prices.sql   # Initial data
```

## Alur Penggunaan

### 1. Registrasi & Login
- Buka `/auth/sign-up` untuk membuat akun baru
- Konfirmasi email Anda
- Login dengan credential Anda

### 2. Dashboard Brankas
- Lihat total emas dan nilai investasi Anda
- Klik "Tambah Pembelian Emas" untuk menambah transaksi baru

### 3. Input Pembelian
- Pilih brand emas (Antam, UBS, Emasku, dll)
- Masukkan berat emas (gram)
- Harga otomatis terisi dari pasar
- Konfirmasi pembelian
- Data akan tersimpan dan otomatis update total emas Anda

### 4. Pasar
- Lihat harga emas real-time dari berbagai brand
- Monitor perubahan harga (naik/turun)
- Klik "Beli Emas Sekarang" untuk melakukan pembelian

### 5. Profil
- Lihat informasi akun Anda
- Kelola pengaturan keamanan
- Logout

## Database Schema

### users
- `id` (UUID, PK) - ID dari auth.users
- `email` (TEXT) - Email pengguna
- `full_name` (TEXT) - Nama lengkap
- `total_gold_grams` (NUMERIC) - Total emas yang dimiliki
- `kyc_verified` (BOOLEAN) - Status verifikasi KYC
- `tier` (TEXT) - Tier membership

### gold_purchases
- `id` (UUID, PK)
- `user_id` (UUID, FK) - Referensi ke users
- `brand` (TEXT) - Brand emas
- `weight_grams` (NUMERIC) - Berat emas
- `purchase_price_per_gram` (NUMERIC) - Harga per gram saat beli
- `total_purchase_price` (NUMERIC) - Total harga
- `purchase_date` (DATE) - Tanggal pembelian
- `purity_percentage` (NUMERIC) - Kemurnian emas
- `certificate_number` (TEXT) - Nomor sertifikat (opsional)

### gold_prices
- `id` (UUID, PK)
- `brand` (TEXT) - Brand emas
- `buy_price` (NUMERIC) - Harga beli pasar
- `sell_price` (NUMERIC) - Harga jual pasar
- `price_change_percent` (NUMERIC) - % perubahan harga
- `fetched_at` (TIMESTAMP) - Waktu fetch terakhir

## API Integration

### GET /api/gold-prices
Fetch harga emas dari API eksternal dan update database.

**Mock Data** (jika API tidak tersedia):
```json
{
  "prices": [
    {
      "brand": "Antam",
      "buy_price": 1132000,
      "sell_price": 1031000,
      "price_change_percent": 0.8
    }
  ]
}
```

## Row Level Security (RLS)

Aplikasi menggunakan RLS untuk keamanan data:

- Pengguna hanya bisa melihat data mereka sendiri
- Setiap insert/update/delete divalidasi melalui RLS policy
- Gold prices bersifat public read

## Deployment

Aplikasi dapat dideploy ke Vercel dengan simple steps:

1. Push ke GitHub
2. Connect repository ke Vercel
3. Vercel akan otomatis detect Next.js dan deploy
4. Environment variables sudah ter-setup di v0

## Troubleshooting

### Database Query Error
- Pastikan database migration sudah dijalankan
- Cek RLS policies di Supabase

### Auth Error
- Verify Supabase URL dan Anon Key
- Cek email confirmation setting di Supabase

### Gold Prices Tidak Muncul
- Cek apakah API eksternal tersedia
- Gunakan mock data sebagai fallback

## Support

Untuk pertanyaan lebih lanjut, silakan hubungi tim support Vercel.

---

**The Sovereign Vault v1.0** - Secure Gold Inventory Management System
