import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Check if user profile exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      return NextResponse.json({ success: true, userExists: true })
    }

    // Create user profile if it doesn't exist
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        total_gold_grams: 0,
        kyc_verified: false,
        tier: 'standard',
      })

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return NextResponse.json(
        { error: 'Failed to create user profile', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, userExists: false })
  } catch (error) {
    console.error('Error in ensure-user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
