'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import GoldPricesDisplay from '@/components/gold-prices-display'

interface MarketInsight {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export default function MarketPage() {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('market_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setInsights(data || [])
    } catch (error) {
      console.error('Error fetching market insights:', error)
    } finally {
      setLoadingInsights(false)
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    return `${diffDays} hari yang lalu`
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      analysis: { label: 'ANALISIS', color: 'bg-tertiary-container/30 text-on-tertiary-container' },
      trend: { label: 'TREN', color: 'bg-primary-fixed/30 text-on-surface' },
      news: { label: 'BERITA', color: 'bg-secondary-container/30 text-on-surface' },
    }
    return labels[category] || { label: category.toUpperCase(), color: 'bg-surface-container text-on-surface' }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-display text-3xl text-on-surface">Harga Emas</h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center text-[10px] font-bold text-on-tertiary-container bg-tertiary-container/30 px-3 py-1 rounded-full uppercase tracking-wider">
            <span className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
            Pasar Terbuka
          </span>
        </div>
      </div>

      {/* Gold Prices Display */}
      <GoldPricesDisplay />

      {/* Action Button */}
      <Link
        href="/dashboard/add-purchase"
        className="btn-gold-clad w-full block text-center"
      >
        Beli Emas Sekarang
      </Link>

      {/* Market Insights */}
      <section className="space-y-4 pt-4 border-t border-outline-variant/20">
        <h2 className="text-display text-xl text-on-surface">Wawasan Pasar</h2>

        {loadingInsights ? (
          <div className="sovereign-card text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-on-surface-variant">Memuat wawasan pasar...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="sovereign-card text-center py-8">
            <p className="text-on-surface-variant text-lg mb-4">📊</p>
            <p className="text-on-surface-variant mb-4">Belum ada wawasan pasar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => {
              const categoryInfo = getCategoryLabel(insight.category)
              return (
                <article
                  key={insight.id}
                  className="surface-card p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/30 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <h3 className="text-display font-bold text-sm leading-tight text-on-surface mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-[10px] text-on-surface-variant">
                        {formatTimeAgo(insight.created_at)}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
