'use client'

import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-surface-container-low flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-4">
            Verifikasi Email
          </h1>
          <p className="text-on-surface-variant text-lg">
            Kami telah mengirimkan link verifikasi ke email Anda. Silakan cek inbox Anda dan klik link untuk mengaktifkan akun.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-xl mb-8 border border-outline-variant/30">
          <p className="text-sm text-on-surface-variant mb-4">
            Jangan lupa cek folder spam jika email tidak muncul di inbox.
          </p>
          <p className="text-xs text-on-surface-variant/70">
            Link verifikasi akan berlaku selama 24 jam.
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-block w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold py-4 rounded-md shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all"
        >
          Kembali ke Login
        </Link>

        <p className="text-sm text-on-surface-variant mt-8">
          Sudah mengklik link?{' '}
          <Link href="/auth/login" className="text-primary font-bold hover:underline">
            Masuk ke akun Anda
          </Link>
        </p>
      </div>
    </div>
  )
}
