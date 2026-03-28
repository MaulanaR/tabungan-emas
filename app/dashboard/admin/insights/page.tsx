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

export default function AdminInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

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

  async function handleDelete(id: string) {
    if (!confirm('Apakah Anda yakin ingin menghapus wawasan ini?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      setInsights(insights.filter((i) => i.id !== id))
    } catch (error) {
      console.error('Error deleting insight:', error)
      alert('Gagal menghapus wawasan')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      analisis: 'bg-blue-100 text-blue-700',
      berita: 'bg-green-100 text-green-700',
      tips: 'bg-yellow-100 text-yellow-700',
      pembaruan: 'bg-purple-100 text-purple-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header with Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold text-on-surface">
            Kelola Wawasan
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {insights.length} wawasan dipublikasikan
          </p>
        </div>
        <Link
          href="/dashboard/admin/insights/new"
          className="bg-primary text-on-primary font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          ➕ Buat Wawasan Baru
        </Link>
      </div>

      {/* Insights List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-on-surface-variant">Memuat wawasan...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="bg-surface-container rounded-lg border border-outline-variant/20 p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            Belum Ada Wawasan
          </h3>
          <p className="text-on-surface-variant mb-6">
            Mulai buat wawasan pasar pertama Anda
          </p>
          <Link
            href="/dashboard/admin/insights/new"
            className="inline-block bg-primary text-on-primary font-bold py-2 px-4 rounded-lg hover:opacity-90"
          >
            Buat Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-surface-container rounded-lg border border-outline-variant/20 p-4 flex items-start justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="font-headline text-lg font-bold text-on-surface line-clamp-1">
                      {insight.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm line-clamp-1 mt-1">
                      {insight.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${getCategoryBadge(insight.category)}`}
                  >
                    {insight.category}
                  </span>
                  <time className="text-on-surface-variant text-xs">
                    {formatDate(insight.created_at)}
                  </time>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/dashboard/admin/insights/${insight.id}/edit`}
                  className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs hover:opacity-80 transition-all"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(insight.id)}
                  disabled={deleting === insight.id}
                  className="px-3 py-2 rounded-lg bg-red-100 text-red-700 font-bold text-xs hover:opacity-80 transition-all disabled:opacity-50"
                >
                  {deleting === insight.id ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
