# CRITICAL FIX - Foreign Key Constraint Error

Jika Anda mendapatkan error:
```
insert or update on table "gold_purchases" violates foreign key constraint "gold_purchases_user_id_fkey"
```

Ini berarti user profile tidak ada di tabel `users`. **Ada 2 solusi - gunakan salah satu:**

---

## ✅ SOLUSI 1: Cepat (Recommended) - Hanya Refresh & Coba Lagi

Aplikasi sudah diupdate dengan auto-fix untuk error ini. Cukup:

1. **Refresh halaman aplikasi** (F5 atau Cmd+R)
2. **Logout** (jika sudah login)
3. **Login lagi**
4. **Coba tambah pembelian** - seharusnya bekerja sekarang

Selesai! Aplikasi akan otomatis membuat user profile saat login atau submit form.

---

## 🔧 SOLUSI 2: Manual Fix - Jika Solusi 1 Tidak Berhasil

### Step 1: Buka Supabase SQL Editor

1. Buka https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **+ New Query**

### Step 2: Jalankan SQL untuk Perbaiki Trigger

Copy-paste SQL ini dan klik **Run**:

```sql
-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate function dengan security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Buat User Profile yang Missing

Jalankan SQL ini untuk membuat profile untuk user yang sudah ada:

```sql
-- Insert users yang belum punya profile
INSERT INTO public.users (id, email, full_name)
SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Test

1. Refresh aplikasi
2. Logout → Login
3. Coba tambah pembelian emas
4. Seharusnya berhasil sekarang

---

## 🔍 Debugging - Jika Masih Error

**Cek apakah user profile sudah ada:**

1. Buka Supabase SQL Editor
2. Jalankan:
```sql
-- Lihat semua user yang terdaftar
SELECT id, email, full_name FROM public.users;

-- Lihat user di auth (seharusnya lebih banyak dari public.users)
SELECT id, email FROM auth.users;
```

3. Bandingkan - seharusnya user di `auth.users` juga ada di `public.users`
4. Jika tidak seimbang, jalankan ulang SQL di Step 3

---

## ℹ️ Penjelasan Teknis

User profile tidak terbuat otomatis karena:
- Trigger `handle_new_user` mungkin tidak berjalan saat signup
- Email verification mungkin menunda pembuatan profile

**Aplikasi sudah diupdate untuk:**
- ✅ Otomatis membuat user profile saat first login
- ✅ Otomatis membuat profile saat submit form
- ✅ Tidak akan error lagi di login/register mendatang

---

**Pilih salah satu solusi di atas. Jika masih error setelah kedua solusi, coba:**
- Clear browser cache (Ctrl+Shift+Delete)
- Buat akun baru dengan email berbeda
