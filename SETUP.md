# The Sovereign Vault - Setup Guide

## ⚠️ PENTING: Setup Database Terlebih Dahulu

Error "Could not find the table 'public.gold_purchases'" berarti database tables belum dibuat. Ikuti langkah ini:

## 🚀 Quick Setup (5 menit)

### Step 1: Buka Supabase Dashboard

1. Kunjungi https://app.supabase.com
2. Login dengan account Anda
3. Pilih project yang terhubung dengan v0

### Step 2: Buka SQL Editor

1. Di sidebar kiri, cari **SQL Editor**
2. Klik **+ New Query** atau **New** button
3. Bersihkan query template yang ada

### Step 3: Copy-Paste SQL Migration

Copy SELURUH kode di bawah ini dan paste ke SQL Editor:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  profile_picture_url TEXT,
  total_gold_grams NUMERIC(10, 2) DEFAULT 0,
  kyc_verified BOOLEAN DEFAULT FALSE,
  tier TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create gold_purchases table
CREATE TABLE IF NOT EXISTS public.gold_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  weight_grams NUMERIC(10, 2) NOT NULL,
  purchase_price_per_gram NUMERIC(12, 2) NOT NULL,
  total_purchase_price NUMERIC(15, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  purity_percentage NUMERIC(5, 2) DEFAULT 99.9,
  certificate_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create gold_prices table
CREATE TABLE IF NOT EXISTS public.gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  buy_price NUMERIC(12, 2) NOT NULL,
  sell_price NUMERIC(12, 2) NOT NULL,
  price_change_percent NUMERIC(5, 2),
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT,
  transaction_status TEXT,
  fraud_status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gold_purchases_user_id ON public.gold_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_purchases_purchase_date ON public.gold_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_gold_prices_brand ON public.gold_prices(brand);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for gold_purchases
DROP POLICY IF EXISTS "purchases_select_own" ON public.gold_purchases;
CREATE POLICY "purchases_select_own" ON public.gold_purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_insert_own" ON public.gold_purchases;
CREATE POLICY "purchases_insert_own" ON public.gold_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_update_own" ON public.gold_purchases;
CREATE POLICY "purchases_update_own" ON public.gold_purchases FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_delete_own" ON public.gold_purchases;
CREATE POLICY "purchases_delete_own" ON public.gold_purchases FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for gold_prices
DROP POLICY IF EXISTS "prices_select_public" ON public.gold_prices;
CREATE POLICY "prices_select_public" ON public.gold_prices FOR SELECT USING (true);

-- RLS Policies for payments
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "payments_notification_webhook" ON public.payments;
CREATE POLICY "payments_notification_webhook" ON public.payments FOR UPDATE USING (true);

-- RLS Policies for transactions
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_system" ON public.transactions;
CREATE POLICY "transactions_insert_system" ON public.transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create user profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 4: Jalankan SQL

1. Di SQL Editor, klik tombol **Run** (atau tekan `Ctrl+Enter`)
2. Tunggu sampai selesai (lihat di bagian Result)
3. Jika ada **Errors**, scroll bawah untuk lihat pesan error
4. Jika **Berhasil**, akan terlihat "✓" di sebelah setiap statement

### Step 5: Refresh Aplikasi

1. Kembali ke v0 Preview
2. Refresh page (F5 atau Cmd+R)
3. Sekarang aplikasi sudah bisa digunakan!

## ✅ Testing Aplikasi

### 1. Registrasi Akun Baru
- Klik "Daftar Akun Baru"
- Isi email dan password
- Verifikasi email (cek inbox)

### 2. Login
- Gunakan email dan password yang didaftar
- Akan ke Dashboard Brankas

### 3. Tambah Pembelian Emas
- Klik "Tambah Pembelian"
- Isi detail: brand, berat, harga, tanggal
- Klik "Simpan Pembelian"
- Data akan muncul di riwayat

### 4. Lihat Harga Pasar
- Klik tab "Pasar"
- Lihat harga emas real-time

### 5. Kelola Profil
- Klik tab "Profil"
- Lihat total emas dan nilai investasi

## ❌ Troubleshooting

| Error | Solusi |
|-------|--------|
| "Could not find the table" | Jalankan SQL migration di Step 3-4 |
| "permission denied" | Tables sudah ada tapi RLS error - jalankan ulang DROP POLICY statements |
| Email verifikasi tidak terima | Check spam folder, atau coba email lain |
| Tidak bisa submit form | Clear cache (Ctrl+Shift+Delete) → Refresh |
| Harga emas tidak muncul | Normal, aplikasi pakai mock data jika API timeout |

## 📚 File Penting

- `scripts/create-tables.sql` ← SQL yang sudah dijalankan
- `app/auth/login/page.tsx` ← Halaman login
- `app/auth/sign-up/page.tsx` ← Halaman registrasi  
- `app/dashboard/vault/page.tsx` ← Dashboard utama
- `app/dashboard/add-purchase/page.tsx` ← Form pembelian
- `app/dashboard/market/page.tsx` ← Halaman pasar

## 🚀 Deploy ke Vercel

Aplikasi siap untuk di-deploy:

1. Click **Publish** button di v0
2. Vercel akan otomatis set environment variables
3. Aplikasi live dalam 1-2 menit!

---

**Catatan:** Setelah SQL migration selesai, Anda bisa langsung mulai menggunakan aplikasi. Jangan perlu restart atau setup tambahan lagi.
