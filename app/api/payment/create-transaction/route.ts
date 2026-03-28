import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import midtransService from '@/lib/midtrans'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderId,
      grossAmount,
      customerDetails,
      itemDetails,
    } = body

    if (!orderId || !grossAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, grossAmount' },
        { status: 400 }
      )
    }

    const { data: userData } = await supabase
      .from('users')
      .select('email, first_name, last_name, phone')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const transactionParams = {
      transactionDetails: {
        orderId,
        grossAmount: Number(grossAmount),
      },
      customerDetails: {
        email: customerDetails?.email || userData.email,
        firstName: customerDetails?.firstName || userData.first_name || user.email?.split('@')[0] || 'User',
        lastName: customerDetails?.lastName || userData.last_name || '',
        phone: customerDetails?.phone || userData.phone || '',
      },
      itemDetails: itemDetails || [],
    }

    const result = await midtransService.createTransaction(transactionParams)

    return NextResponse.json({
      token: result.token,
      redirectUrl: result.redirectUrl,
    }, { status: 200 })

  } catch (error: any) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
