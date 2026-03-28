'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function VaultPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Ensure user profile exists
          try {
            const ensureRes = await fetch('/api/ensure-user', {
              method: 'POST',
            })
            if (!ensureRes.ok) {
              console.error('Failed to ensure user profile')
            }
          } catch (err) {
            console.error('Error ensuring user profile:', err)
          }

          // Fetch user profile
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileData) {
            setUserProfile(profileData)
          }

          // Fetch purchases
          const { data: purchasesData } = await supabase
            .from('gold_purchases')
            .select('*')
            .eq('user_id', user.id)
            .order('purchase_date', { ascending: false })

          if (purchasesData) {
            setPurchases(purchasesData)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  const totalValue = purchases.reduce((sum, p) => sum + (p.total_purchase_price || 0), 0)
  const totalGrams = purchases.reduce((sum, p) => sum + (p.weight_grams || 0), 0)

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
      {/* Portfolio Summary */}
      <section className="space-y-4">
        <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-8 rounded-2xl shadow-lg">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Total Saldo Emas</p>
              <h2 className="font-headline text-4xl font-extrabold">
                {totalGrams.toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-lg">gr</span>
              </h2>
            </div>
            <div className="pt-4 border-t border-on-primary/20">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Nilai Total</p>
              <p className="font-headline text-2xl font-extrabold">
                Rp {totalValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Jumlah Pembelian</p>
            <p className="font-headline text-3xl font-extrabold text-on-surface">{purchases.length}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Harga Rata-rata</p>
            <p className="font-headline text-2xl font-extrabold text-on-surface">
              Rp{' '}
              {purchases.length > 0
                ? (totalValue / purchases.length).toLocaleString('id-ID', { maximumFractionDigits: 0 })
                : 0}
            </p>
          </div>
        </div>
      </section>

      {/* Action Button */}
      <Link
        href="/dashboard/add-purchase"
        className="w-full block text-center bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-lg shadow-lg hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
      >
        Tambah Pembelian Emas
      </Link>

      {/* Purchases List */}
      <section className="space-y-4">
        <h3 className="text-xl font-headline font-bold text-on-surface">Riwayat Pembelian</h3>
        
        {purchases.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl text-center border border-outline-variant/30">
            <p className="text-on-surface-variant text-lg mb-4">📦</p>
            <p className="text-on-surface-variant">Belum ada data pembelian</p>
            <Link
              href="/dashboard/add-purchase"
              className="inline-block mt-4 text-primary font-bold hover:underline"
            >
              Tambah Pembelian Pertama
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-headline font-bold text-on-surface">{purchase.brand}</h4>
                    <p className="text-[10px] text-on-surface-variant">
                      {new Date(purchase.purchase_date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-on-surface">
                      {purchase.weight_grams.toLocaleString('id-ID', { maximumFractionDigits: 2 })} gr
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      @ Rp {purchase.purchase_price_per_gram.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">
                    Purity: {purchase.purity_percentage}%
                  </span>
                  <p className="font-headline font-bold text-primary">
                    Rp {purchase.total_purchase_price.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
