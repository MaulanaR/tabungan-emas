'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TierBadge } from '@/components/tier-badge'
import { TierInfoDisplay } from '@/components/tier-info-display'

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileData) {
            setUserProfile(profileData)
          }

          const { data: purchasesData } = await supabase
            .from('gold_purchases')
            .select('*')
            .eq('user_id', user.id)

          if (purchasesData) {
            setPurchases(purchasesData)
            const total = purchasesData.reduce(
              (sum, p) => sum + (p.total_purchase_price || 0),
              0
            )
            setTotalValue(total)
          }
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
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
      {/* Profile Header */}
      <section className="text-center space-y-4">
        <div className="relative group">
          <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg mx-auto mb-4 ring-4 ring-primary-fixed/30 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-5xl">
            {userProfile?.email?.[0]?.toUpperCase() || '👤'}
          </div>
        </div>
        <div>
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
            {userProfile?.full_name || 'User'}
          </h1>
          <p className="text-secondary text-sm font-medium">{userProfile?.email}</p>
          <div className="mt-4">
            <TierBadge tier={userProfile?.tier || 'STANDARD'} />
          </div>
        </div>
      </section>

      {/* Portfolio Summary */}
      <section className="space-y-2">
        <div className="sovereign-card">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-micro text-secondary mb-2">Total Saldo Emas</p>
              <h2 className="text-display text-3xl text-gradient-gold">
                {userProfile?.total_gold_grams?.toLocaleString('id-ID', { maximumFractionDigits: 2 }) || '0'}{' '}
                <span className="text-lg font-bold text-on-surface">gr</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-micro text-secondary mb-2">Nilai Saat Ini</p>
              <p className="text-display text-xl text-on-surface">
                Rp {totalValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between">
            <span className="status-chip trending">📈 +4.2% Bulan Ini</span>
            <Link href="/dashboard/vault" className="text-sm font-bold text-primary hover:underline">
              Lihat Rincian →
            </Link>
          </div>
        </div>
      </section>

      {/* Tier Usage Information */}
      <section className="space-y-2">
        <TierInfoDisplay />
      </section>

      {/* Account Settings */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary px-2">Pengaturan Akun</h3>
        <div className="space-y-2">
          {/* Security */}
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors group border border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                🔐
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Keamanan Akun</p>
                <p className="text-[11px] text-secondary">Sandi, 2FA, Biometrik</p>
              </div>
            </div>
            <span>→</span>
          </button>

          {/* Verification */}
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                🆔
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Verifikasi Identitas</p>
                <p className="text-[11px] text-on-tertiary-container font-semibold">
                  {userProfile?.kyc_verified ? '✓ Terverifikasi (KYC)' : 'Belum Terverifikasi'}
                </p>
              </div>
            </div>
            <span>→</span>
          </button>

          {/* Notifications */}
          <button className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-primary">
                🔔
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-on-surface">Pengaturan Notifikasi</p>
                <p className="text-[11px] text-secondary">Harga emas, Transaksi</p>
              </div>
            </div>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* Help & Information */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary px-2">Informasi &amp; Bantuan</h3>
        <div className="space-y-2">
          <a
            href="#"
            className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/30"
          >
            <div className="flex items-center gap-4">
              <span>❓</span>
              <span className="text-sm font-semibold text-on-surface">Bantuan</span>
            </div>
            <span className="text-sm">↗</span>
          </a>
          <a
            href="#"
            className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/30"
          >
            <div className="flex items-center gap-4">
              <span>📄</span>
              <span className="text-sm font-semibold text-on-surface">Syarat &amp; Ketentuan</span>
            </div>
            <span className="text-sm">↗</span>
          </a>
          <a
            href="#"
            className="w-full flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/30"
          >
            <div className="flex items-center gap-4">
              <span>🔒</span>
              <span className="text-sm font-semibold text-on-surface">Kebijakan Privasi</span>
            </div>
            <span className="text-sm">↗</span>
          </a>
        </div>
      </section>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-error-container/20 rounded-xl hover:bg-error-container/40 transition-colors border border-error/30 mt-8"
      >
        <span className="text-xl">🚪</span>
        <span className="text-sm font-bold text-error">Keluar</span>
      </button>

      {/* Footer */}
      <footer className="text-center pb-8 opacity-40 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">The Sovereign Vault v1.0</p>
        <p className="text-[9px]">Gold Inventory Management System</p>
      </footer>
    </div>
  )
}
