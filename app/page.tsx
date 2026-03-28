'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()
  }, [supabase])

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-on-surface-variant">Memproses...</p>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="text-6xl mb-4">🏦</div>
            <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-4">
              The Sovereign Vault
            </h1>
            <p className="text-on-surface-variant text-lg">
              Selamat datang kembali! Mari kita kelola aset emas Anda.
            </p>
          </div>

          <Link
            href="/dashboard/vault"
            className="inline-block w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all mb-4"
          >
            Buka Brankas
          </Link>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              setIsLoggedIn(false)
            }}
            className="w-full text-center text-primary font-bold py-3 rounded-lg border border-primary/30 hover:bg-primary/5 transition-colors"
          >
            Keluar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center max-w-md space-y-8">
        <div className="space-y-4">
          <div className="text-6xl mb-4">🏦</div>
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">
            The Sovereign Vault
          </h1>
          <p className="text-on-surface-variant text-lg">
            Aplikasi pencatatan pembelian emas yang aman dan profesional.
          </p>
        </div>

        <div className="space-y-3 pt-8">
          <Link
            href="/auth/login"
            className="w-full block text-center bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-lg shadow-lg hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
          >
            Masuk
          </Link>

          <Link
            href="/auth/sign-up"
            className="w-full block text-center bg-surface-container-lowest text-on-surface font-headline font-bold py-5 rounded-lg border-2 border-primary/30 hover:border-primary hover:bg-primary/5 active:scale-[0.98] transition-all"
          >
            Daftar Akun Baru
          </Link>
        </div>

        <div className="pt-8 border-t border-outline-variant/20 space-y-2 opacity-60">
          <p className="text-[10px] font-bold uppercase tracking-widest">Fitur Utama</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-2xl">🔐</span>
              <p className="text-[10px] mt-2">Aman</p>
            </div>
            <div>
              <span className="text-2xl">📊</span>
              <p className="text-[10px] mt-2">Real-time</p>
            </div>
            <div>
              <span className="text-2xl">📱</span>
              <p className="text-[10px] mt-2">Mobile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
