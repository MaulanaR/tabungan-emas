'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface PaymentFormProps {
  amount: number
  orderId: string
  description?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function PaymentForm({
  amount,
  orderId,
  description = 'Pembayaran',
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false)
  const [snapToken, setSnapToken] = useState<string | null>(null)

  const initializePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          grossAmount: amount,
          description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      const data = await response.json()
      setSnapToken(data.token)

      window.snap!.pay(data.token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result)
          toast.success('Pembayaran berhasil!')
          setSnapToken(null)
          onSuccess?.()
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result)
          toast.info('Pembayaran dalam proses')
          setSnapToken(null)
        },
        onError: (result: any) => {
          console.error('Payment error:', result)
          toast.error('Pembayaran gagal')
          setSnapToken(null)
          onError?.(result.status_message || 'Payment failed')
        },
        onClose: () => {
          console.log('Payment popup closed')
          setSnapToken(null)
        },
      })
    } catch (error: any) {
      console.error('Payment initialization error:', error)
      toast.error(error.message || 'Gagal memulai pembayaran')
      onError?.(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
          ? 'https://app.midtrans.com/snap/snap.js'
          : 'https://app.sandbox.midtrans.com/snap/snap.js'
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />

      <Card className="p-6 surface-card shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-display text-2xl text-on-surface tracking-tight">
              Ringkasan Pembayaran
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Order ID: {orderId}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <Label className="text-sm font-medium text-on-surface">
                Jumlah Pembayaran
              </Label>
              <div className="text-right">
                <p className="text-3xl text-display text-gradient-gold">
                  Rp {amount.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-baseline">
              <Label className="text-sm font-medium text-on-surface">
                Deskripsi
              </Label>
              <p className="text-sm text-on-surface-variant">
                {description}
              </p>
            </div>
          </div>

          <Button
            onClick={initializePayment}
            disabled={loading}
            className="w-full h-14 text-base font-semibold btn-gold-clad disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Bayar Sekarang'
            )}
          </Button>

          <div className="space-y-2 text-xs text-on-surface-variant">
            <p>Metode pembayaran yang tersedia:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full surface-depth-1">
                QRIS
              </span>
              <span className="px-3 py-1 rounded-full surface-depth-1">
                GoPay
              </span>
              <span className="px-3 py-1 rounded-full surface-depth-1">
                OVO
              </span>
              <span className="px-3 py-1 rounded-full surface-depth-1">
                Transfer Bank
              </span>
              <span className="px-3 py-1 rounded-full surface-depth-1">
                Kartu Kredit
              </span>
            </div>
          </div>
        </div>
      </Card>
    </>
  )
}

function Script({ src, dataClientKey }: { src: string; dataClientKey?: string }) {
  return (
    <script
      src={src}
      data-client-key={dataClientKey}
      async
    />
  )
}
