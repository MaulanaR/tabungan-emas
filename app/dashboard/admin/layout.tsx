'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!userData || userData.role !== 'admin') {
          router.push('/dashboard/vault')
          return
        }

        setIsAdmin(true)
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/dashboard/vault')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-on-surface-variant">Memverifikasi akses...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Admin Header */}
      <div className="sticky top-0 z-50 bg-surface-container border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-xl font-bold text-primary">
                Admin Panel
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                Kelola wawasan pasar dan pengguna
              </p>
            </div>
            <Link
              href="/dashboard/vault"
              className="text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-surface-container border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            <Link
              href="/dashboard/admin"
              className="py-4 px-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors font-medium text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/admin/insights"
              className="py-4 px-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors font-medium text-sm"
            >
              Kelola Wawasan
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="py-4 px-2 border-b-2 border-transparent text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors font-medium text-sm"
            >
              Kelola Pengguna
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
