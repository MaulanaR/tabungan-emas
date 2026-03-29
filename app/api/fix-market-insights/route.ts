import { NextResponse } from 'next/server'

// SQL for creating market_insights table
const marketInsightsSQL = `
-- Create market_insights table
CREATE TABLE IF NOT EXISTS public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
`

export async function POST() {
  try {
    console.log('🚀 Providing migration instructions for market_insights table...')

    const instructions = `
      ✅ MARKET INSIGHTS TABLE CREATION GUIDE

      Masalah: Tabel 'market_insights' belum ada di database

      SOLUSI MANUAL (Ikuti langkah ini):

      1. Buka Supabase SQL Editor:
         https://supabase.com/dashboard/project/wzsssxxagfaciolqlkbp/sql/new

      2. Copy SQL berikut dan paste ke SQL Editor:

      ${marketInsightsSQL}

      3. Setelah selesai jalankan SQL berikut untuk RLS policies:

      -- Enable Row Level Security
      ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

      -- Create public read policy
      DROP POLICY IF EXISTS "insights_select_public" ON public.market_insights;
      CREATE POLICY "insights_select_public" ON public.market_insights FOR SELECT USING (true);

      -- Create admin write policies
      DROP POLICY IF EXISTS "insights_insert_admin" ON public.market_insights;
      CREATE POLICY "insights_insert_admin" ON public.market_insights FOR INSERT WITH CHECK (true);

      DROP POLICY IF EXISTS "insights_update_admin" ON public.market_insights;
      CREATE POLICY "insights_update_admin" ON public.market_insights FOR UPDATE USING (true);

      DROP POLICY IF EXISTS "insights_delete_admin" ON public.market_insights;
      CREATE POLICY "insights_delete_admin" ON public.market_insights FOR DELETE USING (true);

      4. Jalankan SQL berikut untuk indexes:

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_market_insights_category ON public.market_insights(category);
      CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON public.market_insights(created_at);

      5. Jalankan SQL berikut untuk sample data:

      -- Insert sample market insights
      INSERT INTO public.market_insights (title, content, category) VALUES
      ('Kebijakan Federal Reserve Mendorong Harga Emas Global', 'Bank sentral AS mempertahankan kebijakan dovish yang mendukung harga emas sebagai aset safe-haven.', 'analysis'),
      ('Permintaan Emas Fisik Meningkat di Pasar Asia', 'Investor Asia meningkatkan pembelian emas fisik sebagai lindung inflasi dan ketidakpastian ekonomi.', 'trend'),
      ('Harga Emas Antam Mencatat Rekor Baru', 'Harga emas Antam mencatat rekor tertinggi tahun ini seiring meningkatnya permintaan domestik.', 'news')
      ON CONFLICT DO NOTHING;

      6. Setelah selesai, refresh aplikasi:
         - Refresh browser
         - Error market_insights akan hilang

      Catatan: Setiap SQL bisa dijalankan terpisah jika gagal.
    `

    return NextResponse.json({
      success: true,
      message: 'Migration instructions provided',
      instructions,
      sql: marketInsightsSQL.trim(),
      steps: [
        '1. Open Supabase SQL Editor',
        '2. Run table creation SQL',
        '3. Run RLS policies SQL',
        '4. Run indexes SQL',
        '5. Run sample data SQL',
        '6. Refresh application'
      ]
    })

  } catch (error: any) {
    console.error('Error providing migration instructions:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to provide migration instructions'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to get detailed migration instructions',
    quickSteps: [
      '1. POST to this endpoint for full instructions',
      '2. Open: https://supabase.com/dashboard/project/wzsssxxagfaciolqlkbp/sql/new',
      '3. Run the SQL commands provided',
      '4. Refresh application'
    ],
    sqlEditorUrl: 'https://supabase.com/dashboard/project/wzsssxxagfaciolqlkbp/sql/new'
  })
}
