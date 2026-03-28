'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
      } else {
        router.push('/auth/sign-up-success')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-surface-container-low">
      {/* Hero Image Section (Web) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-inverse-surface">
        <div className="absolute inset-0 bg-gradient-to-tr from-inverse-surface via-inverse-surface/80 to-transparent z-10"></div>
        <img
          alt="Gold vault"
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] contrast-[1.1]"
          src="https://images.unsplash.com/photo-1516245834210-c4ee322b8c3f?w=800&h=800&fit=crop"
        />
        <div className="relative z-20 flex flex-col justify-end p-16 h-full max-w-2xl">
          <div className="mb-6 h-1 w-24 bg-primary"></div>
          <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
            Mulai Perjalanan <span className="text-primary-container">Kekayaan Anda</span>.
          </h1>
          <p className="text-secondary-fixed text-lg lg:text-xl font-light leading-relaxed max-w-md">
            Bergabunglah dengan ribuan pengguna yang telah mengamankan aset emas mereka dengan teknologi terdepan.
          </p>
        </div>
      </div>

      {/* Sign Up Container */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 lg:px-24 bg-surface z-20 relative">
        {/* Mobile Logo */}
        <div className="md:hidden absolute top-8 left-8">
          <div className="flex items-center gap-2">
            <span className="text-primary text-3xl">🔒</span>
            <span className="font-headline font-bold tracking-tighter text-on-surface text-xl">The Sovereign Vault</span>
          </div>
        </div>

        <div className="w-full max-w-md flex flex-col">
          {/* Header */}
          <div className="mb-12">
            <div className="hidden md:flex items-center gap-2 mb-10">
              <span className="text-primary text-2xl">🛡️</span>
              <span className="font-headline font-bold tracking-tighter text-primary text-lg">The Sovereign Vault</span>
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
              Daftar Akun Baru
            </h2>
            <p className="font-label text-on-surface-variant text-sm">
              Buat akun untuk mulai mengelola aset emas Anda.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-8">
            <div className="space-y-6">
              {/* Full Name Field */}
              <div className="relative group">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary text-on-surface py-4 px-1 transition-all placeholder:text-on-surface-variant/40"
                    required
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              {/* Email Field */}
              <div className="relative group">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.com"
                    className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary text-on-surface py-4 px-1 transition-all placeholder:text-on-surface-variant/40"
                    required
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary text-on-surface py-4 px-1 transition-all placeholder:text-on-surface-variant/40"
                    required
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-4 text-on-surface-variant/50 hover:text-primary transition-colors"
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative group">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-surface-container-low border-none border-b-2 border-outline-variant/20 focus:ring-0 focus:border-primary text-on-surface py-4 px-1 transition-all placeholder:text-on-surface-variant/40"
                    required
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-focus-within:w-full"></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-error-container/20 border border-error-container p-3 rounded-md">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-5 rounded-md shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Mendaftar...' : 'Buat Akun'} {!loading && '➔'}
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-12 text-center">
            <p className="font-label text-sm text-on-surface-variant">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline underline-offset-4 ml-1">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
