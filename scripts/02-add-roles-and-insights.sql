-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create market_insights table
CREATE TABLE IF NOT EXISTS public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for market_insights
CREATE INDEX IF NOT EXISTS idx_market_insights_created_by ON public.market_insights(created_by);
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON public.market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON public.market_insights(created_at DESC);

-- Enable RLS for market_insights
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_insights (public read)
DROP POLICY IF EXISTS "insights_select_public" ON public.market_insights;
CREATE POLICY "insights_select_public" ON public.market_insights FOR SELECT USING (true);

-- RLS Policies for market_insights (admin only insert/update/delete)
DROP POLICY IF EXISTS "insights_insert_admin" ON public.market_insights;
CREATE POLICY "insights_insert_admin" ON public.market_insights FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "insights_update_admin" ON public.market_insights;
CREATE POLICY "insights_update_admin" ON public.market_insights FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "insights_delete_admin" ON public.market_insights;
CREATE POLICY "insights_delete_admin" ON public.market_insights FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
