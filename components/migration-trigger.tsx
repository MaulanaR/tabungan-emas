'use client'

import { useEffect } from 'react'

export default function MigrationTrigger() {
  useEffect(() => {
    const runMigrations = async () => {
      const hasRun = sessionStorage.getItem('migrations-run')

      if (!hasRun) {
        try {
          console.log('Running database migrations...')
          const response = await fetch('/api/migrate', {
            method: 'POST',
          })

          const data = await response.json()

          if (data.success) {
            console.log('✓ Database migrations completed')
            sessionStorage.setItem('migrations-run', 'true')
          } else {
            console.warn('Migration warning:', data.error)
          }
        } catch (error) {
          console.error('Migration error:', error)
        }
      }
    }

    runMigrations()
  }, [])

  return null
}
