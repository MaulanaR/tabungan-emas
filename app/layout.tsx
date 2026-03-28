import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <MigrationRunner />
      </body>
    </html>
  )
}

function MigrationRunner() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            // Run migrations only once per session
            if (typeof window !== 'undefined' && !sessionStorage.getItem('migrationsRun')) {
              fetch('/api/migrate')
                .then(res => res.json())
                .then(data => {
                  if (data.success) {
                    console.log('Database migrations completed successfully');
                    sessionStorage.setItem('migrationsRun', 'true');
                  } else {
                    console.warn('Migration warning:', data.error);
                  }
                })
                .catch(err => {
                  console.error('Migration error:', err);
                });
            }
          })();
        `,
      }}
    />
  )
}

