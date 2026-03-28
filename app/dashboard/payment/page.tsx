'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentForm from '@/components/payment-form'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const amount = parseFloat(searchParams.get('amount') || '0')
  const orderId = searchParams.get('orderId') || ''
  const description = searchParams.get('description') || 'Pembayaran'

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePaymentSuccess = () => {
    const redirectUrl = searchParams.get('redirect') || '/dashboard/vault'
    router.push(redirectUrl)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
  }

  if (!mounted) {
    return null
  }

  if (!orderId || amount <= 0) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6">
        <h1 className="text-2xl font-extrabold text-on-surface mb-4">
          Parameter Pembayaran Tidak Valid
        </h1>
        <p className="text-on-surface-variant mb-6">
          Order ID dan jumlah pembayaran harus diisi
        </p>
        <button
          onClick={() => router.back()}
          className="btn-gold-clad w-full"
        >
          Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <PaymentForm
        amount={amount}
        orderId={orderId}
        description={description}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  )
}
