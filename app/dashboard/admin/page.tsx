'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalAdmins: number
  totalInsights: number
  totalPurchases: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalInsights: 0,
    totalPurchases: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const { data: users } = await supabase.from('users').select('role')
      const { data: insights } = await supabase.from('market_insights').select('id')
      const { data: purchases } = await supabase.from('gold_purchases').select('id')

      setStats({
        totalUsers: users?.length || 0,
        totalAdmins: users?.filter((u: any) => u.role === 'admin').length || 0,
        totalInsights: insights?.length || 0,
        totalPurchases: purchases?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({
    title,
    value,
    icon,
    link,
  }: {
    title: string
    value: number
    icon: string
    link?: string
  }) => {
    const content = (
      <div className="bg-surface-container rounded-lg border border-outline-variant/20 p-6 hover:shadow-lg hover:border-primary/50 transition-all">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-on-surface-variant text-sm font-medium mb-2">
              {title}
            </p>
            <p className="font-headline text-4xl font-bold text-primary">
              {value}
            </p>
          </div>
          <div className="text-4xl opacity-30">{icon}</div>
        </div>
      </div>
    )

    return link ? <Link href={link}>{content}</Link> : content
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary-container/10 rounded-lg border border-primary/20 p-8">
        <h1 className="font-headline text-3xl font-bold text-on-surface mb-2">
          Selamat Datang, Admin
        </h1>
        <p className="text-on-surface-variant">
          Kelola wawasan pasar dan administrasi sistem Sovereign Vault
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-on-surface-variant">Memuat statistik...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Pengguna" value={stats.totalUsers} icon="👥" />
          <StatCard title="Admin Aktif" value={stats.totalAdmins} icon="🔐" />
          <StatCard
            title="Wawasan Pasar"
            value={stats.totalInsights}
            icon="📝"
            link="/dashboard/admin/insights"
          />
          <StatCard
            title="Total Pembelian"
            value={stats.totalPurchases}
            icon="📊"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/insights/new">
          <div className="bg-surface-container rounded-lg border border-outline-variant/20 p-8 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">➕</div>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                Baru
              </div>
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
              Buat Wawasan Baru
            </h3>
            <p className="text-on-surface-variant text-sm">
              Tambahkan analisis atau berita terbaru tentang pasar emas
            </p>
          </div>
        </Link>

        <Link href="/dashboard/admin/insights">
          <div className="bg-surface-container rounded-lg border border-outline-variant/20 p-8 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">📋</div>
              <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                Kelola
              </div>
            </div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
              Kelola Wawasan
            </h3>
            <p className="text-on-surface-variant text-sm">
              Edit, hapus, atau lihat semua wawasan yang sudah dipublikasikan
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-container rounded-lg border border-outline-variant/20 p-6">
        <h2 className="font-headline text-xl font-bold text-on-surface mb-6">
          Aktivitas Terbaru
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg">
            <div className="text-2xl">📝</div>
            <div className="flex-1">
              <p className="font-medium text-on-surface">Wawasan pasar diperbarui</p>
              <p className="text-xs text-on-surface-variant">Tadi</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg">
            <div className="text-2xl">👤</div>
            <div className="flex-1">
              <p className="font-medium text-on-surface">Pengguna baru terdaftar</p>
              <p className="text-xs text-on-surface-variant">1 hari yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
