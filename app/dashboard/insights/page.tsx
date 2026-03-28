'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Insight {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'analisis', label: 'Analisis Pasar' },
    { id: 'berita', label: 'Berita' },
    { id: 'tips', label: 'Tips & Trik' },
    { id: 'pembaruan', label: 'Pembaruan' },
  ]

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    try {
      const response = await fetch('/api/insights')
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInsights =
    selectedCategory === 'all'
      ? insights
      : insights.filter((insight) => insight.category === selectedCategory)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-surface-container-low pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-container-low border-b border-outline-variant/20">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-headline text-3xl font-bold text-on-surface">
                Wawasan Pasar
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">
                Analisis dan berita terkini tentang pasar emas
              </p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface border border-outline-variant/20 hover:border-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-3">⏳</div>
              <p className="text-on-surface-variant">Memuat wawasan...</p>
            </div>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="bg-surface-container rounded-lg p-8 text-center border border-outline-variant/20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-on-surface-variant text-lg">
              Belum ada wawasan di kategori ini
            </p>
            <p className="text-on-surface-variant text-sm mt-2">
              Kembali lagi nanti untuk update terbaru
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <article
                key={insight.id}
                className="bg-surface-container rounded-lg border border-outline-variant/20 p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h2 className="font-headline text-xl font-bold text-on-surface line-clamp-2">
                      {insight.title}
                    </h2>
                  </div>
                  <span className="whitespace-nowrap px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {categories.find((c) => c.id === insight.category)?.label}
                  </span>
                </div>

                <p className="text-on-surface-variant line-clamp-3 mb-4">
                  {insight.content}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <time className="text-on-surface-variant">
                    {formatDate(insight.created_at)}
                  </time>
                  <Link
                    href={`/dashboard/insights/${insight.id}`}
                    className="text-primary font-bold hover:underline"
                  >
                    Baca Selengkapnya →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
