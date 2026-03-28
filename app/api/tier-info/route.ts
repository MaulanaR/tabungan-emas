import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user tier information from the view
    const { data: tierInfo, error: tierError } = await supabase
      .from('user_tier_info')
      .select('*')
      .eq('id', user.id)
      .single()

    if (tierError) {
      console.error('Error fetching tier info:', tierError)
      return NextResponse.json({ error: 'Failed to fetch tier information' }, { status: 500 })
    }

    return NextResponse.json(tierInfo)
  } catch (error) {
    console.error('Error in tier-info API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
