# Solusi Cepat: "Could not find the table 'public.gold_purchases'"

## 🎯 Masalah
Error ini berarti database tables belum dibuat di Supabase.

## ✅ Solusi (3 Langkah)

### 1. Buka Supabase Dashboard
```
https://app.supabase.com → Pilih Project → SQL Editor
```

### 2. Copy-Paste SQL Ini
```sql
-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  profile_picture_url TEXT,
  total_gold_grams NUMERIC(10, 2) DEFAULT 0,
  kyc_verified BOOLEAN DEFAULT FALSE,
  tier TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

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

CREATE TABLE IF NOT EXISTS public.gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  buy_price NUMERIC(12, 2) NOT NULL,
  sell_price NUMERIC(12, 2) NOT NULL,
  price_change_percent NUMERIC(5, 2),
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gold_purchases_user_id ON public.gold_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_purchases_purchase_date ON public.gold_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_gold_prices_brand ON public.gold_prices(brand);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "purchases_select_own" ON public.gold_purchases;
CREATE POLICY "purchases_select_own" ON public.gold_purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_insert_own" ON public.gold_purchases;
CREATE POLICY "purchases_insert_own" ON public.gold_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_update_own" ON public.gold_purchases;
CREATE POLICY "purchases_update_own" ON public.gold_purchases FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_delete_own" ON public.gold_purchases;
CREATE POLICY "purchases_delete_own" ON public.gold_purchases FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "prices_select_public" ON public.gold_prices;
CREATE POLICY "prices_select_public" ON public.gold_prices FOR SELECT USING (true);

-- Auto-create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Klik RUN
Tunggu sampai selesai (akan terlihat ✓ jika berhasil)

### 4. Refresh Aplikasi
Kembali ke v0 Preview dan refresh (F5)

## 🎉 Selesai!
Sekarang Anda bisa:
- ✅ Registrasi akun baru
- ✅ Login
- ✅ Tambah pembelian emas
- ✅ Lihat harga pasar
- ✅ Kelola profil

---
Butuh bantuan? Lihat **SETUP.md** untuk troubleshooting lebih lanjut.
