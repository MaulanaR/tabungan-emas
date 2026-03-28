'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GoldPrice {
  id: string
  brand: string
  buy_price: number
  sell_price: number
  price_change_percent: number
  fetched_at: string
}

export default function MarketPage() {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    fetchGoldPrices()
    // Fetch every 5 minutes
    const interval = setInterval(fetchGoldPrices, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchGoldPrices = async () => {
    try {
      // First, try to fetch from external API
      const response = await fetch('/api/gold-prices')
      if (response.ok) {
        const data = await response.json()
        // Save to database
        if (data.prices && data.prices.length > 0) {
          for (const price of data.prices) {
            await supabase.from('gold_prices').insert({
              brand: price.brand,
              buy_price: price.buy_price,
              sell_price: price.sell_price,
              price_change_percent: price.price_change_percent,
            })
          }
        }
      }

      // Fetch latest from database
      const { data } = await supabase
        .from('gold_prices')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(50)

      if (data) {
        const uniqueBrands = Array.from(
          new Map(data.map((item) => [item.brand, item])).values()
        ) as GoldPrice[]
        setGoldPrices(uniqueBrands)

        if (uniqueBrands.length > 0 && uniqueBrands[0].fetched_at) {
          const date = new Date(uniqueBrands[0].fetched_at)
          setLastUpdated(date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
        }
      }
    } catch (error) {
      console.error('Error fetching gold prices:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-on-surface-variant">Memproses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Harga Emas</h1>
        {lastUpdated && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-[10px] font-bold text-on-tertiary-container bg-tertiary-container/30 px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Pasar Terbuka
            </span>
            <p className="text-[10px] text-on-surface-variant italic">Update terakhir: {lastUpdated} WIB</p>
          </div>
        )}
      </div>

      {/* Gold Prices List */}
      <div className="space-y-3">
        {goldPrices.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl text-center border border-outline-variant/30">
            <p className="text-on-surface-variant text-lg mb-4">📊</p>
            <p className="text-on-surface-variant mb-4">Data harga emas tidak tersedia</p>
            <button
              onClick={fetchGoldPrices}
              className="text-primary font-bold hover:underline"
            >
              Muat Ulang
            </button>
          </div>
        ) : (
          goldPrices.map((price) => (
            <div
              key={price.id}
              className="bg-surface-container-lowest p-5 rounded-3xl shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-black text-xs">
                    {price.brand.slice(0, 3).toUpperCase()}
                  </div>
                  <h3 className="font-headline font-extrabold text-lg text-on-surface">{price.brand}</h3>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (price.price_change_percent || 0) >= 0
                      ? 'text-green-600 bg-green-50'
                      : 'text-red-600 bg-red-50'
                  }`}
                >
                  <span>{(price.price_change_percent || 0) >= 0 ? '📈' : '📉'}</span>
                  <span>
                    {Math.abs(price.price_change_percent || 0).toLocaleString('id-ID', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Harga Beli
                  </p>
                  <p className="text-xl font-headline font-extrabold text-on-surface">
                    {price.buy_price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    <span className="text-xs font-medium text-on-surface-variant ml-1">/gr</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    Harga Jual
                  </p>
                  <p className="text-xl font-headline font-extrabold text-on-surface">
                    {price.sell_price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    <span className="text-xs font-medium text-on-surface-variant ml-1">/gr</span>
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/30">
                <p className="text-[10px] text-on-surface-variant">
                  Selisih: Rp {(price.buy_price - price.sell_price).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Button */}
      {goldPrices.length > 0 && (
        <Link
          href="/dashboard/add-purchase"
          className="w-full block text-center bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          Beli Emas Sekarang
        </Link>
      )}

      {/* Market Insights */}
      <section className="space-y-4 pt-4 border-t border-outline-variant/20">
        <h2 className="text-xl font-headline font-extrabold text-on-surface">Wawasan Pasar</h2>
        <div className="space-y-3">
          <article className="flex gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
            <div className="flex-shrink-0">
              <span className="text-3xl">📊</span>
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-bold text-on-tertiary-container bg-tertiary-container/20 px-2 py-0.5 rounded-full inline-block mb-1">
                ANALISIS
              </span>
              <h3 className="font-bold text-sm leading-tight text-on-surface mb-1">
                Kebijakan Federal Reserve Mendorong Harga Emas Global
              </h3>
              <p className="text-[10px] text-on-surface-variant">2 jam yang lalu • 4 mnt baca</p>
            </div>
          </article>
          <article className="flex gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors">
            <div className="flex-shrink-0">
              <span className="text-3xl">📈</span>
            </div>
            <div className="flex-1">
              <span className="text-[9px] font-bold text-on-primary-fixed-variant bg-primary-fixed/30 px-2 py-0.5 rounded-full inline-block mb-1">
                TREN
              </span>
              <h3 className="font-bold text-sm leading-tight text-on-surface mb-1">
                Permintaan Emas Fisik Meningkat di Pasar Asia
              </h3>
              <p className="text-[10px] text-on-surface-variant">5 jam yang lalu • 3 mnt baca</p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
