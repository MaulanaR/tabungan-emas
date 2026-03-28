-- Tier System Migration Script
-- This script adds tier-based purchase limits to the users table

-- Drop existing tier column constraint and recreate with new values
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_tier_check;
ALTER TABLE public.users ADD CONSTRAINT users_tier_check 
  CHECK (tier IN ('FREE', 'LITE', 'STANDARD', 'PRO'));

-- Add tier_active_since column to track when user's tier became active
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tier_active_since TIMESTAMP WITH TIME ZONE;

-- Add purchases_this_year counter to track annual purchases
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS purchases_this_year INTEGER DEFAULT 0;

-- Create tier_limits lookup table
CREATE TABLE IF NOT EXISTS public.tier_limits (
  id SERIAL PRIMARY KEY,
  tier_name TEXT UNIQUE NOT NULL CHECK (tier_name IN ('FREE', 'LITE', 'STANDARD', 'PRO')),
  max_purchases_per_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Seed tier_limits with default values
INSERT INTO public.tier_limits (tier_name, max_purchases_per_year) VALUES
  ('FREE', 3),
  ('LITE', 10),
  ('STANDARD', 20),
  ('PRO', 100)
ON CONFLICT (tier_name) DO UPDATE SET
  max_purchases_per_year = EXCLUDED.max_purchases_per_year,
  updated_at = TIMEZONE('utc', NOW());

-- Update existing users to set default tier_active_since if null
UPDATE public.users
SET tier_active_since = created_at
WHERE tier_active_since IS NULL;

-- Update existing users' tier to STANDARD if they currently have 'standard' (lowercase)
UPDATE public.users
SET tier = 'STANDARD'
WHERE tier = 'standard';

-- Create index for tier limits lookups
CREATE INDEX IF NOT EXISTS idx_tier_limits_tier_name ON public.tier_limits(tier_name);

-- Create index for purchases_this_year to optimize queries
CREATE INDEX IF NOT EXISTS idx_users_purchases_this_year ON public.users(purchases_this_year);

-- Enable RLS for tier_limits table (read-only for authenticated users)
ALTER TABLE public.tier_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policy for tier_limits - read access for all authenticated users
DROP POLICY IF EXISTS "tier_limits_select_authenticated" ON public.tier_limits;
CREATE POLICY "tier_limits_select_authenticated" ON public.tier_limits FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policy for tier_limits - admin only insert/update
DROP POLICY IF EXISTS "tier_limits_modify_admin" ON public.tier_limits;
CREATE POLICY "tier_limits_modify_admin" ON public.tier_limits FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to increment purchases_this_year
CREATE OR REPLACE FUNCTION public.increment_purchase_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET 
    purchases_this_year = purchases_this_year + 1,
    updated_at = TIMEZONE('utc', NOW())
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset purchases_this_year on Jan 1
CREATE OR REPLACE FUNCTION public.reset_annual_purchases()
RETURNS VOID AS $$
BEGIN
  UPDATE public.users
  SET 
    purchases_this_year = 0,
    updated_at = TIMEZONE('utc', NOW())
  WHERE EXTRACT(YEAR FROM CURRENT_DATE) > EXTRACT(YEAR FROM tier_active_since) OR tier_active_since IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically increment purchases_this_year when a new purchase is added
DROP TRIGGER IF EXISTS increment_purchases_counter ON public.gold_purchases;
CREATE TRIGGER increment_purchases_counter
  AFTER INSERT ON public.gold_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_purchase_count(NEW.user_id);

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.increment_purchase_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reset_annual_purchases() TO authenticated;

-- Create view for user tier information
CREATE OR REPLACE VIEW public.user_tier_info AS
SELECT 
  u.id,
  u.email,
  u.tier,
  u.tier_active_since,
  u.purchases_this_year,
  tl.max_purchases_per_year,
  (tl.max_purchases_per_year - u.purchases_this_year) as remaining_purchases,
  ROUND((u.purchases_this_year::numeric / tl.max_purchases_per_year::numeric) * 100, 1) as usage_percentage
FROM public.users u
JOIN public.tier_limits tl ON u.tier = tl.tier_name;

-- Grant select on view to authenticated users
GRANT SELECT ON public.user_tier_info TO authenticated;
