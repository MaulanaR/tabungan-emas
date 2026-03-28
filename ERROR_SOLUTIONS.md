# Error Solutions - The Sovereign Vault

## Error 1: "Could not find the table 'public.gold_purchases'"

**Penyebab:** Database tables belum dibuat.

**Solusi:**
1. Buka SETUP.md
2. Follow Step 1-4 (copy-paste SQL ke Supabase SQL Editor)
3. Run SQL migration

---

## Error 2: "violates foreign key constraint 'gold_purchases_user_id_fkey'"

**Penyebab:** User profile tidak ada di tabel `users`.

**Solusi:**
1. Buka CRITICAL_FIX.md
2. Gunakan SOLUSI 1 (fastest) atau SOLUSI 2
3. Refresh aplikasi
4. Logout → Login
5. Coba tambah pembelian lagi

---

## Error 3: "Email verification tidak diterima"

**Solusi:**
1. Check spam/junk folder
2. Tunggu 5-10 menit
3. Coba daftar dengan email berbeda
4. Atau disable email verification di Supabase Settings (tidak recommended untuk production)

---

## Error 4: "Can't login setelah sign up"

**Solusi:**
1. Pastikan sudah klik email verification link
2. Tunggu 2-3 detik setelah verifikasi
3. Refresh page
4. Clear browser cache (Ctrl+Shift+Delete)

---

## Error 5: "Form submit tidak bekerja"

**Solusi:**
1. Buka Browser Console (F12)
2. Check error messages
3. Pastikan environment variables benar (Settings → Vars)
4. Refresh page
5. Try clearing cache

---

## Error 6: "Harga emas tidak muncul di form"

**Solusi:**
1. Ini adalah expected behavior jika database kosong
2. Jalankan SQL seed untuk tambah initial prices:
```sql
INSERT INTO public.gold_prices (brand, buy_price, sell_price, price_change_percent)
VALUES 
  ('Antam', 1132000, 1031000, 0.8),
  ('UBS', 1135000, 1034000, 0.5),
  ('Emasku', 1130000, 1029000, 1.2),
  ('Pegadaian', 1128000, 1027000, 0.3);
```
3. Refresh aplikasi

---

## Error 7: "RLS policy error" atau "permission denied"

**Solusi:**
1. Jalankan ulang database setup SQL dari SETUP.md
2. Pastikan tidak ada error saat execute
3. Jalankan SQL dari CRITICAL_FIX.md Step 2 untuk fix trigger
4. Refresh aplikasi

---

## Debugging Tips

### Check Database
```sql
-- Lihat semua tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Lihat user profiles
SELECT id, email, full_name FROM public.users;

-- Lihat gold purchases
SELECT id, user_id, brand, weight_grams FROM public.gold_purchases;

-- Lihat gold prices
SELECT brand, buy_price, sell_price FROM public.gold_prices;
```

### Check Authentication
```javascript
// Di browser console
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
console.log(user) // Lihat user data
```

---

## Getting Help

1. **Check files:**
   - SETUP.md - Database setup
   - CRITICAL_FIX.md - Foreign key error
   - QUICK_FIX.md - Quick solutions

2. **Check Supabase logs:**
   - Supabase Dashboard → Logs
   - Look for errors related to your tables

3. **Check v0 logs:**
   - Open dev console (F12)
   - Look for red error messages

---

## Quick Checklist

Before asking for help, make sure:
- ✅ Database tables created (SETUP.md Step 3)
- ✅ Environment variables set (check Settings → Vars)
- ✅ User profile exists (CRITICAL_FIX.md)
- ✅ Browser cache cleared (Ctrl+Shift+Delete)
- ✅ Page refreshed multiple times
- ✅ Logged out and logged back in
