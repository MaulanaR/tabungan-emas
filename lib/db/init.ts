import { runMigrations } from '@/lib/db/migrate-new'

// This file is imported by next.config.mjs or other entry points
// to ensure migrations run before the application starts

let hasRunMigrations = false

export async function ensureMigrations() {
  if (hasRunMigrations) {
    return
  }

  try {
    console.log('🚀 Ensuring database migrations...')
    const result = await runMigrations()

    if (result.success) {
      console.log('✅ Database migrations completed successfully')
      hasRunMigrations = true
    } else {
      console.warn('⚠️ Migration warning:', result.error)
    }
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

// Auto-run when module is imported
ensureMigrations()
