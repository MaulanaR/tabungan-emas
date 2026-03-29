'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'

interface GoldPrice {
  id: string
  brand: string
  buy_price: number
  sell_price: number
  price_change_percent: number
  fetched_at: string
}

export default function GoldPricesDisplay() {
  const [prices, setPrices] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)
  const supabase = createClient()

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('gold_prices')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(20)

      if (error) throw error

      if (data) {
        const uniqueBrands = Array.from(
          new Map(data.map((item) => [item.brand, item])).values()
        )
        setPrices(uniqueBrands)
        setLastSync(new Date(data[0]?.fetched_at))
      }
    } catch (error) {
      console.error('Error fetching gold prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncPrices = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/gold-prices/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        await fetchPrices()
      }
    } catch (error) {
      console.error('Error syncing prices:', error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchPrices()

    const subscription = supabase
      .channel('gold_prices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gold_prices',
      }, () => {
        fetchPrices()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="sovereign-card">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin text-2xl text-on-surface-variant" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display text-xl text-on-surface">Harga Emas Terkini</h2>
          {lastSync && (
            <p className="text-xs text-on-surface-variant mt-1">
              Terakhir update: {formatTime(lastSync)}
            </p>
          )}
        </div>
        <button
          onClick={syncPrices}
          disabled={syncing}
          className="p-2 rounded-full hover:bg-surface-container transition-colors disabled:opacity-50"
          title="Sync harga terbaru"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''} text-on-surface`} />
        </button>
      </div>

      <div className="space-y-3">
        {prices.map((price) => (
          <div
            key={price.id}
            className="surface-card p-4 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-display font-bold text-lg text-on-surface">
                  {price.brand}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                  Buyback
                </span>
              </div>
              {price.price_change_percent !== 0 && (
                <div className="flex items-center gap-1 text-xs font-bold">
                  {price.price_change_percent > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-success" />
                      <span className="text-success">+{price.price_change_percent}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-error" />
                      <span className="text-error">{price.price_change_percent}%</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Beli</p>
                <p className="text-display font-bold text-on-surface">
                  {formatPrice(price.buy_price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Jual</p>
                <p className="text-display font-bold text-on-surface">
                  {formatPrice(price.sell_price)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-on-surface-variant text-center">
        Data harga emas bersumber dari emas.maulanar.my.id
      </p>
    </div>
  )
}
