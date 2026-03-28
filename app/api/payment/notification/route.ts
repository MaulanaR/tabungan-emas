import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import midtransService from '@/lib/midtrans'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const notificationJson = await request.json()

    const statusResponse = await midtransService.handleNotification(notificationJson)

    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status
    const paymentType = statusResponse.payment_type

    console.log(`Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`)

    let paymentStatus: string

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'challenge'
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'success'
      } else {
        paymentStatus = 'pending'
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'success'
    } else if (transactionStatus === 'deny') {
      paymentStatus = 'failed'
    } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
      paymentStatus = 'failed'
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending'
    } else {
      paymentStatus = 'unknown'
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        payment_type: paymentType,
        transaction_status: transactionStatus,
        fraud_status: fraudStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)

    if (updateError) {
      console.error('Failed to update payment status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    if (paymentStatus === 'success') {
      const { data: paymentData } = await supabase
        .from('payments')
        .select('user_id, amount, description')
        .eq('order_id', orderId)
        .single()

      if (paymentData) {
        await supabase
          .from('transactions')
          .insert({
            user_id: paymentData.user_id,
            amount: paymentData.amount,
            type: 'credit',
            description: paymentData.description || 'Payment',
            reference_id: orderId,
            created_at: new Date().toISOString(),
          })
      }
    }

    return NextResponse.json({ status: 'success', paymentStatus })

  } catch (error: any) {
    console.error('Notification handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to handle notification' },
      { status: 500 }
    )
  }
}
