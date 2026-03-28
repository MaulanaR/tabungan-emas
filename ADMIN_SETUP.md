# Admin Panel Setup Guide

## Fitur Baru yang Ditambahkan

✅ **Market Insights** - Halaman untuk membaca wawasan pasar  
✅ **Admin Panel** - Dashboard admin untuk kelola wawasan dan pengguna  
✅ **Role Management** - Sistem role admin/user  
✅ **CRUD Wawasan** - Buat, edit, hapus wawasan pasar  
✅ **User Management** - Ubah role pengguna (admin/user)  

---

## Step 1: Database Migration

Sebelum menggunakan fitur admin, jalankan migration script untuk menambahkan role dan market_insights table.

### Buka Supabase SQL Editor:

1. Kunjungi https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Klik **+ New Query**

### Copy-paste SQL ini dan jalankan:

```sql
-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create market_insights table
CREATE TABLE IF NOT EXISTS public.market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for market_insights
CREATE INDEX IF NOT EXISTS idx_market_insights_created_by ON public.market_insights(created_by);
CREATE INDEX IF NOT EXISTS idx_market_insights_category ON public.market_insights(category);
CREATE INDEX IF NOT EXISTS idx_market_insights_created_at ON public.market_insights(created_at DESC);

-- Enable RLS for market_insights
ALTER TABLE public.market_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_insights (public read)
DROP POLICY IF EXISTS "insights_select_public" ON public.market_insights;
CREATE POLICY "insights_select_public" ON public.market_insights FOR SELECT USING (true);

-- RLS Policies for market_insights (admin only insert/update/delete)
DROP POLICY IF EXISTS "insights_insert_admin" ON public.market_insights;
CREATE POLICY "insights_insert_admin" ON public.market_insights FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "insights_update_admin" ON public.market_insights;
CREATE POLICY "insights_update_admin" ON public.market_insights FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "insights_delete_admin" ON public.market_insights;
CREATE POLICY "insights_delete_admin" ON public.market_insights FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Klik Run** dan tunggu sampai selesai.

---

## Step 2: Buat Admin User Pertama

Setelah migration selesai, ubah role user Anda menjadi admin:

### SQL untuk membuat admin:

```sql
-- Ganti 'admin@example.com' dengan email Anda
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Verifikasi (opsional)
SELECT email, role FROM public.users;
```

---

## Step 3: Test Admin Panel

1. **Refresh aplikasi** (F5 atau Cmd+R)
2. **Login** dengan akun yang sudah dibuat admin
3. Anda akan melihat tombol **⚙️ Admin** di header
4. Klik tombol Admin untuk akses dashboard

---

## Admin Panel Features

### Dashboard Admin

- Lihat statistik: Total Users, Admin, Wawasan, Pembelian
- Quick actions: Buat Wawasan Baru, Kelola Wawasan
- Recent Activity

### Kelola Wawasan

#### Buat Wawasan Baru
- Judul
- Konten (dengan support markdown/line breaks)
- Kategori: Analisis Pasar, Berita, Tips & Trik, Pembaruan
- Auto-publish setelah submit

#### Edit Wawasan
- Update judul, konten, kategori
- Klik Edit di list wawasan

#### Hapus Wawasan
- Klik tombol Hapus
- Konfirmasi penghapusan

### Kelola Pengguna

- Lihat semua pengguna terdaftar
- Ubah role user menjadi admin atau sebaliknya
- Real-time update

---

## User Roles

### User (Default)
- ✅ Lihat wawasan pasar
- ✅ Input pembelian emas
- ✅ Lihat harga pasar
- ✅ Kelola profil
- ❌ Buat/edit wawasan
- ❌ Kelola pengguna

### Admin
- ✅ Semua fitur User
- ✅ Buat/edit/hapus wawasan pasar
- ✅ Kelola role pengguna
- ✅ Akses admin panel

---

## Page Structure

### User Pages
- `/dashboard/insights` - Baca wawasan (Public)
- `/dashboard/insights/[id]` - Detail wawasan

### Admin Pages
- `/dashboard/admin` - Admin Dashboard
- `/dashboard/admin/insights` - Kelola wawasan (list)
- `/dashboard/admin/insights/new` - Buat wawasan baru
- `/dashboard/admin/insights/[id]/edit` - Edit wawasan
- `/dashboard/admin/users` - Kelola pengguna

---

## API Endpoints

### Public (Semua)
```
GET /api/insights - Dapatkan semua wawasan
GET /api/insights/[id] - Dapatkan detail wawasan
```

### Admin Only
```
POST /api/insights - Buat wawasan baru
PUT /api/insights/[id] - Update wawasan
DELETE /api/insights/[id] - Hapus wawasan
```

---

## Troubleshooting

### Tombol Admin tidak muncul
**Solusi:**
- Pastikan role user sudah di-update ke 'admin'
- Refresh halaman (F5)
- Logout → Login ulang

### Tidak bisa membuat wawasan
**Solusi:**
- Pastikan Anda sudah admin
- Check error message di form
- Verifikasi RLS policy di Supabase

### Wawasan tidak muncul di public page
**Solusi:**
- Refresh halaman
- Cek apakah wawasan sudah dipublikasikan
- Cek RLS policy untuk SELECT

---

## Next Steps

1. ✅ Jalankan database migration
2. ✅ Assign admin role ke user
3. ✅ Akses admin panel
4. ✅ Buat wawasan pasar pertama
5. ✅ Lihat di halaman insights publik
6. (Optional) Integrate dengan API harga emas eksternal

Selamat! Admin panel sudah siap digunakan! 🎉
