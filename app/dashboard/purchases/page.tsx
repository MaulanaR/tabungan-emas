'use client'

import Link from 'next/link'

export default function PurchasesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Transaksi Pembelian</h1>
        <p className="text-on-surface-variant">Kelola pembelian emas Anda</p>
      </div>

      <div className="space-y-4">
        <Link
          href="/dashboard/add-purchase"
          className="w-full block text-center bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-lg shadow-lg hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          ➕ Tambah Pembelian Baru
        </Link>

        <div className="bg-surface-container-lowest p-8 rounded-xl text-center border border-outline-variant/30">
          <p className="text-on-surface-variant text-lg mb-4">💼</p>
          <p className="text-on-surface-variant mb-4">Kelola semua pembelian emas Anda di halaman Brankas</p>
          <Link href="/dashboard/vault" className="text-primary font-bold hover:underline">
            Lihat Riwayat Pembelian
          </Link>
        </div>
      </div>
    </div>
  )
}
