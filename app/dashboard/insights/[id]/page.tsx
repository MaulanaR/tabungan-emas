'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Insight {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export default function InsightDetailPage() {
  const [insight, setInsight] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchInsight() {
      try {
        const response = await fetch(`/api/insights/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setInsight(data)
      } catch (error) {
        console.error('Error fetching insight:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsight()
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      analisis: 'bg-blue-100 text-blue-700',
      berita: 'bg-green-100 text-green-700',
      tips: 'bg-yellow-100 text-yellow-700',
      pembaruan: 'bg-purple-100 text-purple-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-on-surface-variant">Memuat wawasan...</p>
        </div>
      </div>
    )
  }

  if (!insight) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">
            Wawasan Tidak Ditemukan
          </h1>
          <p className="text-on-surface-variant mb-6">
            Wawasan yang Anda cari tidak ada atau telah dihapus
          </p>
          <Link
            href="/dashboard/insights"
            className="inline-block bg-primary text-on-primary font-bold py-3 px-6 rounded-lg hover:opacity-90"
          >
            Kembali ke Wawasan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low pb-24">
      {/* Header */}
      <div className="border-b border-outline-variant/20">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <Link
            href="/dashboard/insights"
            className="inline-flex items-center text-primary font-bold mb-6 hover:underline"
          >
            ← Kembali
          </Link>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="font-headline text-3xl font-bold text-on-surface">
                  {insight.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getCategoryColor(insight.category)}`}>
                {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
              </span>
              <time className="text-on-surface-variant text-sm">
                {formatDate(insight.created_at)}
              </time>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <article className="prose prose-invert max-w-none">
          <div className="bg-surface-container rounded-lg p-8 border border-outline-variant/20">
            <div className="text-on-surface whitespace-pre-wrap leading-relaxed">
              {insight.content}
            </div>
          </div>
        </article>

        {/* Related Insights Section */}
        <div className="mt-12">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-6">
            Wawasan Lainnya
          </h2>
          <div className="bg-surface-container rounded-lg p-6 border border-outline-variant/20 text-center">
            <p className="text-on-surface-variant">Tidak ada wawasan terkait lainnya</p>
          </div>
        </div>
      </div>
    </div>
  )
}
