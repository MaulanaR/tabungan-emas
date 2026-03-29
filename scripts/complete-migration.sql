-- Complete Database Migration SQL for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wzsssxxagfaciolqlkbp/sql/new

-- ===================================
-- 1. Create Tables
-- ===================================

-- Users table
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

-- Gold purchases table
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

-- Gold prices table
CREATE TABLE IF NOT EXISTS public.gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  buy_price NUMERIC(12, 2) NOT NULL,
  sell_price NUMERIC(12, 2) NOT NULL,
  price_change_percent NUMERIC(5, 2),
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Payments table
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

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Market insights table (THIS IS THE MISSING TABLE!)
CREATE TABLE IF NOT EXISTS public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Migrations tracking table
CREATE TABLE IF NOT EXISTS public.migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ===================================
-- 2. Create Indexes
-- ===================================

CREATE INDEX IF NOT EXISTS idx_gold_purchases_user_id ON public.gold_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gold_purchases_purchase_date ON public.gold_purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_gold_prices_brand ON public.gold_prices(brand);
CREATE INDEX IF NOT EXISTS idx_gold_prices_fetched_at ON public.gold_prices(fetched_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON public.market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON public.market_insights(created_at);
CREATE INDEX IF NOT EXISTS idx_migrations_name ON public.migrations(name);

-- ===================================
-- 3. Enable Row Level Security
-- ===================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migrations ENABLE ROW LEVEL SECURITY;

-- ===================================
-- 4. Create RLS Policies
-- ===================================

-- Users policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_system" ON public.users;
CREATE POLICY "users_insert_system" ON public.users FOR INSERT WITH CHECK (true);

-- Gold purchases policies
DROP POLICY IF EXISTS "purchases_select_own" ON public.gold_purchases;
CREATE POLICY "purchases_select_own" ON public.gold_purchases FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_insert_own" ON public.gold_purchases;
CREATE POLICY "purchases_insert_own" ON public.gold_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_update_own" ON public.gold_purchases;
CREATE POLICY "purchases_update_own" ON public.gold_purchases FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_delete_own" ON public.gold_purchases;
CREATE POLICY "purchases_delete_own" ON public.gold_purchases FOR DELETE USING (auth.uid() = user_id);

-- Gold prices policies (public access)
DROP POLICY IF EXISTS "prices_select_public" ON public.gold_prices;
CREATE POLICY "prices_select_public" ON public.gold_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "prices_insert_admin" ON public.gold_prices;
CREATE POLICY "prices_insert_admin" ON public.gold_prices FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "prices_update_admin" ON public.gold_prices;
CREATE POLICY "prices_update_admin" ON public.gold_prices FOR UPDATE USING (true);

DROP POLICY IF EXISTS "prices_delete_admin" ON public.gold_prices;
CREATE POLICY "prices_delete_admin" ON public.gold_prices FOR DELETE USING (true);

-- Payments policies
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "payments_notification_webhook" ON public.payments;
CREATE POLICY "payments_notification_webhook" ON public.payments FOR UPDATE USING (true);

-- Transactions policies
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_system" ON public.transactions;
CREATE POLICY "transactions_insert_system" ON public.transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Market insights policies (public access for viewing)
DROP POLICY IF EXISTS "insights_select_public" ON public.market_insights;
CREATE POLICY "insights_select_public" ON public.market_insights FOR SELECT USING (true);

DROP POLICY IF EXISTS "insights_insert_admin" ON public.market_insights;
CREATE POLICY "insights_insert_admin" ON public.market_insights FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "insights_update_admin" ON public.market_insights;
CREATE POLICY "insights_update_admin" ON public.market_insights FOR UPDATE USING (true);

DROP POLICY IF EXISTS "insights_delete_admin" ON public.market_insights;
CREATE POLICY "insights_delete_admin" ON public.market_insights FOR DELETE USING (true);

-- Migrations policies (admin only)
DROP POLICY IF EXISTS "migrations_select_admin" ON public.migrations;
CREATE POLICY "migrations_select_admin" ON public.migrations FOR SELECT USING (true);

DROP POLICY IF EXISTS "migrations_insert_admin" ON public.migrations;
CREATE POLICY "migrations_insert_admin" ON public.migrations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "migrations_update_admin" ON public.migrations;
CREATE POLICY "migrations_update_admin" ON public.migrations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "migrations_delete_admin" ON public.migrations;
CREATE POLICY "migrations_delete_admin" ON public.migrations FOR DELETE USING (true);

-- ===================================
-- 5. Create Triggers
-- ===================================

-- Auto-create user profile on signup
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

-- ===================================
-- 6. Insert Sample Data (Optional)
-- ===================================

-- Insert sample market insights
INSERT INTO public.market_insights (title, content, category) VALUES
  ('Kebijakan Federal Reserve Mendorong Harga Emas Global', 'Bank sentral AS mempertahankan kebijakan dovish yang mendukung harga emas sebagai aset safe-haven.', 'analysis'),
  ('Permintaan Emas Fisik Meningkat di Pasar Asia', 'Investor Asia meningkatkan pembelian emas fisik sebagai lindung inflasi dan ketidakpastian ekonomi.', 'trend')
ON CONFLICT DO NOTHING;

-- Mark migrations as complete
INSERT INTO public.migrations (name) VALUES
  ('001_create_users_table'),
  ('002_create_gold_purchases_table'),
  ('003_create_gold_prices_table'),
  ('004_create_payments_table'),
  ('005_create_transactions_table'),
  ('006_create_market_insights_table'),
  ('007_create_migrations_table'),
  ('008_create_indexes'),
  ('009_enable_row_level_security'),
  ('010_create_users_rls_policies'),
  ('011_create_gold_purchases_rls_policies'),
  ('012_create_gold_prices_rls_policies'),
  ('013_create_payments_rls_policies'),
  ('014_create_transactions_rls_policies'),
  ('015_create_market_insights_rls_policies'),
  ('016_create_migrations_rls_policies'),
  ('017_create_new_user_trigger')
ON CONFLICT DO NOTHING;
