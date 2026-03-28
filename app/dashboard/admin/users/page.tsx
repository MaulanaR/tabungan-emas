'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TierBadge } from '@/components/tier-badge'

interface User {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  tier: 'FREE' | 'LITE' | 'STANDARD' | 'PRO'
  purchases_this_year: number
  tier_active_since: string
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: 'user' | 'admin') {
    setUpdating(userId)

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      )
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Gagal mengubah role pengguna')
    } finally {
      setUpdating(null)
    }
  }

  async function handleTierChange(userId: string, newTier: 'FREE' | 'LITE' | 'STANDARD' | 'PRO') {
    setUpdating(userId)

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          tier: newTier,
          tier_active_since: new Date().toISOString(),
          purchases_this_year: 0 // Reset purchases when tier changes
        })
        .eq('id', userId)

      if (error) throw error

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, tier: newTier, purchases_this_year: 0, tier_active_since: new Date().toISOString() } : u
        )
      )
    } catch (error) {
      console.error('Error updating user tier:', error)
      alert('Gagal mengubah tier pengguna')
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface">
          Kelola Pengguna
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          {users.length} pengguna terdaftar
        </p>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-on-surface-variant">Memuat pengguna...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-surface-container rounded-lg border border-outline-variant/20 p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="font-headline text-xl font-bold text-on-surface mb-2">
            Belum Ada Pengguna
          </h3>
          <p className="text-on-surface-variant">
            Pengguna akan muncul di sini setelah mereka mendaftar
          </p>
        </div>
      ) : (
        <div className="sovereign-card overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-surface-container border-b border-surface-container-high text-sm font-bold text-on-surface">
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Nama</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-1">Pembelian</div>
            <div className="col-span-2">Terdaftar</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-surface-container-high">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-0 px-6 py-4 hover:bg-surface-container-low transition-colors"
              >
                {/* Email */}
                <div className="md:col-span-3">
                  <p className="text-micro text-on-surface-variant md:hidden mb-1">
                    Email
                  </p>
                  <p className="text-on-surface break-all text-sm font-medium">
                    {user.email}
                  </p>
                </div>

                {/* Name */}
                <div className="md:col-span-2">
                  <p className="text-micro text-on-surface-variant md:hidden mb-1">
                    Nama
                  </p>
                  <p className="text-on-surface text-sm">
                    {user.full_name || '-'}
                  </p>
                </div>

                {/* Role */}
                <div className="md:col-span-2">
                  <p className="text-micro text-on-surface-variant md:hidden mb-1">
                    Role
                  </p>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value as 'user' | 'admin'
                      )
                    }
                    disabled={updating === user.id}
                    className="w-full px-3 py-1.5 rounded-lg text-sm font-bold bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Tier */}
                <div className="md:col-span-2">
                  <p className="text-micro text-on-surface-variant md:hidden mb-1">
                    Tier
                  </p>
                  <select
                    value={user.tier}
                    onChange={(e) =>
                      handleTierChange(
                        user.id,
                        e.target.value as 'FREE' | 'LITE' | 'STANDARD' | 'PRO'
                      )
                    }
                    disabled={updating === user.id}
                    className="w-full px-3 py-1.5 rounded-lg text-sm font-bold bg-surface-container-lowest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="FREE">FREE</option>
                    <option value="LITE">LITE</option>
                    <option value="STANDARD">STANDARD</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>

                {/* Purchases */}
                <div className="md:col-span-1">
                  <p className="text-micro text-on-surface-variant md:hidden mb-1">
                    Pembelian
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface text-sm font-bold">
                      {user.purchases_this_year || 0}
                    </span>
                    <TierBadge tier={user.tier} className="!px-2 !py-0.5 !text-[10px]" />
                  </div>
                </div>

                {/* Registered Date */}
                <div className="md:col-span-2">
                  <p className="text-micro text-on-surface-variant md:hidden mb-1">
                    Terdaftar
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="sovereign-card border-l-4 border-primary">
        <p className="font-display font-bold text-sm mb-3">💡 Informasi</p>
        <ul className="text-sm space-y-2 text-on-surface-variant">
          <li>• Admin dapat membuat dan mengelola wawasan pasar</li>
          <li>• User hanya dapat melihat wawasan dan mengelola pembelian mereka</li>
          <li>• Ubah role pengguna dengan dropdown di kolom Role</li>
          <li>• Atur tier pengguna (FREE/LITE/STANDARD/PRO) untuk membatasi pembelian tahunan</li>
          <li>• Tier FREE=3, LITE=10, STANDARD=20, PRO=100 pembelian per tahun</li>
          <li>• Mengubah tier akan mereset counter pembelian pengguna</li>
        </ul>
      </div>
    </div>
  )
}
