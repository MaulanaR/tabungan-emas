'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TierInfoDisplay } from '@/components/tier-info-display'

interface TierInfo {
  tier: string
  purchases_this_year: number
  max_purchases_per_year: number
  remaining_purchases: number
  usage_percentage: number
}

export default function AddPurchasePage() {
  const [formData, setFormData] = useState({
    brand: 'Antam',
    weight_grams: '',
    purchase_price_per_gram: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purity_percentage: '99.9',
    certificate_number: '',
    notes: '',
  })

  const [goldPrices, setGoldPrices] = useState<any[]>([])
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Allowed gold brands
  const allowedBrands = ['Antam', 'UBS', 'Emasku', 'Waris', 'Galeri24']

  useEffect(() => {
    fetchTierInfo()
  }, [])

  const fetchTierInfo = async () => {
    try {
      const response = await fetch('/api/tier-info')
      if (response.ok) {
        const data = await response.json()
        setTierInfo(data)
      }
    } catch (err) {
      console.error('Error fetching tier info:', err)
    }
  }

  const fetchGoldPrices = async () => {
    try {
      const { data } = await supabase
        .from('gold_prices')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(20)

      if (data) {
        const uniqueBrands = Array.from(
          new Map(data.map((item) => [item.brand, item])).values()
        )
        // Filter only allowed brands
        const filteredBrands = uniqueBrands.filter((brand) =>
          allowedBrands.includes(brand.brand)
        )
        setGoldPrices(filteredBrands)
      }
    } catch (err) {
      console.error('Error fetching gold prices:', err)
    }
  }

  useEffect(() => {
    fetchGoldPrices()

    const channel = supabase
      .channel('gold_prices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'gold_prices',
      }, fetchGoldPrices)
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  const handleSelectBrand = (brand: string) => {
    if (!allowedBrands.includes(brand)) {
      console.warn(`Brand "${brand}" is not allowed`)
      return
    }

    const priceData = goldPrices.find((p) => p.brand === brand)
    setFormData({
      ...formData,
      brand,
      purchase_price_per_gram: priceData?.buy_price?.toString() || '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate brand
    if (!allowedBrands.includes(formData.brand)) {
      setError('Brand emas tidak valid. Hanya brand Antam, UBS, Emasku, Waris, dan Galeri24 yang diperbolehkan.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Check tier limits before proceeding
      if (tierInfo && tierInfo.remaining_purchases <= 0) {
        setError('Anda telah mencapai batas pembelian tahunan. Silakan upgrade tier Anda untuk melanjutkan.')
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('User not authenticated')
        return
      }

      // Ensure user profile exists in database
      const ensureRes = await fetch('/api/ensure-user', {
        method: 'POST',
      })

      if (!ensureRes.ok) {
        throw new Error('Failed to ensure user profile exists')
      }

      const weightGrams = parseFloat(formData.weight_grams)
      const pricePerGram = parseFloat(formData.purchase_price_per_gram)
      const totalPrice = weightGrams * pricePerGram

      const { error: insertError } = await supabase
        .from('gold_purchases')
        .insert({
          user_id: user.id,
          brand: formData.brand,
          weight_grams: weightGrams,
          purchase_price_per_gram: pricePerGram,
          total_purchase_price: totalPrice,
          purchase_date: formData.purchase_date,
          purity_percentage: parseFloat(formData.purity_percentage),
          certificate_number: formData.certificate_number || null,
          notes: formData.notes || null,
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard/vault')
        }, 2000)
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const weightGrams = parseFloat(formData.weight_grams) || 0
  const pricePerGram = parseFloat(formData.purchase_price_per_gram) || 0
  const totalPrice = weightGrams * pricePerGram

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-display text-3xl text-on-surface">Tambah Pembelian Emas</h1>
        <p className="text-on-surface-variant">Catat pembelian emas baru Anda di sini</p>
      </div>

      {/* Tier Info Display */}
      <TierInfoDisplay showUpgradeAlert={true} />

      {/* Success Message */}
      {success && (
        <div className="sovereign-card border-l-4 border-success">
          <p className="text-success font-medium">✓ Pembelian berhasil dicatat!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="sovereign-card border-l-4 border-error">
          <p className="text-error font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Selection */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Brand Emas
          </label>
          <select
            value={formData.brand}
            onChange={(e) => handleSelectBrand(e.target.value)}
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none"
            required
          >
            <option value="">Pilih Brand Emas</option>
            {allowedBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-on-surface-variant mt-1">
            Brand yang tersedia: Antam, UBS, Emasku, Waris, Galeri24
          </p>
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Berat (gram)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.weight_grams}
            onChange={(e) => setFormData({ ...formData, weight_grams: e.target.value })}
            placeholder="0.00"
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none"
            required
          />
        </div>

        {/* Price Per Gram */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Harga per Gram (Rp)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.purchase_price_per_gram}
            onChange={(e) => setFormData({ ...formData, purchase_price_per_gram: e.target.value })}
            placeholder="0.00"
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none"
            required
          />
          {goldPrices.length > 0 && (
            <p className="text-[10px] text-on-surface-variant">
              Harga pasar saat ini: Rp{' '}
              {goldPrices
                .find((p) => p.brand === formData.brand)
                ?.buy_price?.toLocaleString('id-ID', { maximumFractionDigits: 0 }) || '-'}
            </p>
          )}
        </div>

        {/* Purity */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Kemurnian (%)
          </label>
          <select
            value={formData.purity_percentage}
            onChange={(e) => setFormData({ ...formData, purity_percentage: e.target.value })}
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none"
          >
            <option value="99.9">99.9% (LM/Antam Standard)</option>
            <option value="99.5">99.5%</option>
            <option value="99">99%</option>
            <option value="95">95%</option>
          </select>
        </div>

        {/* Purchase Date */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Tanggal Pembelian
          </label>
          <input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none"
            required
          />
        </div>

        {/* Certificate Number */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Nomor Sertifikat (opsional)
          </label>
          <input
            type="text"
            value={formData.certificate_number}
            onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
            placeholder="Nomor sertifikat jika ada"
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            Catatan (opsional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Catatan tambahan tentang pembelian ini"
            rows={3}
            className="w-full bg-surface-container-lowest border-b-2 border-outline-variant/20 focus:border-primary text-on-surface py-3 px-2 rounded-lg focus:outline-none resize-none"
          />
        </div>

        {/* Total Preview */}
        <div className="sovereign-card">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant text-sm">Total Harga:</span>
            <span className="text-display text-xl text-gradient-gold">
              Rp {totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {weightGrams.toLocaleString('id-ID', { maximumFractionDigits: 2 })} gr @ Rp{' '}
            {pricePerGram.toLocaleString('id-ID', { maximumFractionDigits: 0 })}/gr
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-gold-clad flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pembelian'}
          </button>
          <Link
            href="/dashboard/vault"
            className="flex-1 text-center sovereign-card text-on-surface font-display font-bold py-4 hover:bg-surface-container transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
