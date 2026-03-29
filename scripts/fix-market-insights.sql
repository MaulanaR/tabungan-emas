-- Simple migration to fix missing market_insights table
-- Copy this SQL and run in Supabase SQL Editor: https://supabase.com/dashboard/project/wzsssxxagfaciolqlkbp/sql/new

-- Create the missing table
CREATE TABLE IF NOT EXISTS public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "insights_select_public" ON public.market_insights;
CREATE POLICY "insights_select_public" ON public.market_insights FOR SELECT USING (true);

DROP POLICY IF EXISTS "insights_insert_admin" ON public.market_insights;
CREATE POLICY "insights_insert_admin" ON public.market_insights FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "insights_update_admin" ON public.market_insights;
CREATE POLICY "insights_update_admin" ON public.market_insights FOR UPDATE USING (true);

DROP POLICY IF EXISTS "insights_delete_admin" ON public.market_insights;
CREATE POLICY "insights_delete_admin" ON public.market_insights FOR DELETE USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON public.market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON public.market_insights(created_at);

-- Insert sample data
INSERT INTO public.market_insights (title, content, category) VALUES
  ('Kebijakan Federal Reserve Mendorong Harga Emas Global', 'Bank sentral AS mempertahankan kebijakan dovish yang mendukung harga emas sebagai aset safe-haven.', 'analysis'),
  ('Permintaan Emas Fisik Meningkat di Pasar Asia', 'Investor Asia meningkatkan pembelian emas fisik sebagai lindung inflasi dan ketidakpastian ekonomi.', 'trend'),
  ('Harga Emas Antam Mencatat Rekor Baru', 'Harga emas Antam mencatat rekor tertinggi tahun ini seiring meningkatnya permintaan domestik.', 'news')
ON CONFLICT DO NOTHING;

-- Verify table creation
SELECT 'market_insights table created successfully!' as status;
