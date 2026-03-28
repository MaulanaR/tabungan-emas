'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
        
        // Check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (userData?.role === 'admin') {
          setIsAdmin(true)
        }
        
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-on-surface-variant">Memproses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low pb-24">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface">The Sovereign Vault</p>
              <p className="text-[10px] text-on-surface-variant">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
              >
                ⚙️ Admin
              </Link>
            )}
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/auth/login')
              }}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md border-t border-outline-variant/10 rounded-t-3xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-around items-center">
          <Link
            href="/dashboard/vault"
            className="flex flex-col items-center justify-center text-stone-500 hover:text-primary transition-colors py-2 px-4"
          >
            <span className="text-2xl mb-1">🏦</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Brankas</span>
          </Link>
          <Link
            href="/dashboard/purchases"
            className="flex flex-col items-center justify-center text-stone-500 hover:text-primary transition-colors py-2 px-4"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Beli</span>
          </Link>
          <Link
            href="/dashboard/market"
            className="flex flex-col items-center justify-center text-stone-500 hover:text-primary transition-colors py-2 px-4"
          >
            <span className="text-2xl mb-1">📈</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Pasar</span>
          </Link>
          <Link
            href="/dashboard/insights"
            className="flex flex-col items-center justify-center text-stone-500 hover:text-primary transition-colors py-2 px-4"
          >
            <span className="text-2xl mb-1">📝</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Wawasan</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex flex-col items-center justify-center text-stone-500 hover:text-primary transition-colors py-2 px-4"
          >
            <span className="text-2xl mb-1">👤</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
