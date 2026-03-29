import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const migrationSQL = `
-- Create market_insights table (this is what's causing the error!)
CREATE TABLE IF NOT EXISTS public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for market_insights
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for market_insights
DROP POLICY IF EXISTS "insights_select_public" ON public.market_insights;
CREATE POLICY "insights_select_public" ON public.market_insights FOR SELECT USING (true);

DROP POLICY IF EXISTS "insights_insert_admin" ON public.market_insights;
CREATE POLICY "insights_insert_admin" ON public.market_insights FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "insights_update_admin" ON public.market_insights;
CREATE POLICY "insights_update_admin" ON public.market_insights FOR UPDATE USING (true);

DROP POLICY IF EXISTS "insights_delete_admin" ON public.market_insights;
CREATE POLICY "insights_delete_admin" ON public.market_insights FOR DELETE USING (true);

-- Create index for market_insights
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON public.market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON public.market_insights(created_at);

-- Insert sample data
INSERT INTO public.market_insights (title, content, category) VALUES
  ('Kebijakan Federal Reserve Mendorong Harga Emas Global', 'Bank sentral AS mempertahankan kebijakan dovish yang mendukung harga emas sebagai aset safe-haven.', 'analysis'),
  ('Permintaan Emas Fisik Meningkat di Pasar Asia', 'Investor Asia meningkatkan pembelian emas fisik sebagai lindung inflasi dan ketidakpastian ekonomi.', 'trend'),
  ('Harga Emas Antam Mencatat Rekor Baru', 'Harga emas Antam mencatat rekor tertinggi tahun ini seiring meningkatnya permintaan domestik.', 'news')
ON CONFLICT DO NOTHING;
`

export async function POST() {
  try {
    console.log('Running direct SQL migration for market_insights...')

    // Use Supabase direct SQL execution via SQL Editor approach
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SQL execution error:', errorText)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to execute SQL',
          details: errorText
        },
        { status: 500 }
      )
    }

    const result = await response.json()
    console.log('SQL execution result:', result)

    return NextResponse.json({
      success: true,
      message: 'Market insights table created successfully',
      data: result
    })

  } catch (error: any) {
    console.error('Direct SQL migration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create market_insights table'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create market_insights table',
    sql: migrationSQL,
    manualInstructions: `
      1. Go to: https://supabase.com/dashboard/project/wzsssxxagfaciolqlkbp/sql/new
      2. Copy the SQL from this endpoint's response
      3. Paste into SQL Editor
      4. Click "Run"
    `
  })
}
