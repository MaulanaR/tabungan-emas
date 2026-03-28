'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewInsightPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'analisis',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const categories = [
    { id: 'analisis', label: 'Analisis Pasar' },
    { id: 'berita', label: 'Berita' },
    { id: 'tips', label: 'Tips & Trik' },
    { id: 'pembaruan', label: 'Pembaruan' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create insight')
      }

      router.push('/dashboard/admin/insights')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/admin/insights"
          className="inline-flex items-center text-primary font-bold mb-4 hover:underline"
        >
          ← Kembali
        </Link>
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          Buat Wawasan Baru
        </h1>
        <p className="text-on-surface-variant mt-2">
          Bagikan analisis atau berita terbaru tentang pasar emas
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">
            Judul Wawasan
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Contoh: Tren Harga Emas Naik di Q1 2024"
            className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">
            Kategori
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface focus:outline-none focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold text-on-surface mb-2">
            Konten
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Tulis wawasan Anda di sini. Anda bisa menggunakan enter untuk membuat paragraf baru."
            rows={10}
            className="w-full px-4 py-3 rounded-lg bg-surface-container border border-outline-variant/20 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary resize-none"
            required
          />
          <p className="text-xs text-on-surface-variant mt-2">
            {formData.content.length} karakter
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-on-primary font-bold py-4 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Menyimpan...' : 'Publikasikan Wawasan'}
          </button>
          <Link
            href="/dashboard/admin/insights"
            className="flex-1 text-center bg-surface-container text-on-surface font-bold py-4 rounded-lg border border-outline-variant/20 hover:border-primary transition-all"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
