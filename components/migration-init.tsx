import { runMigrations } from '@/lib/db/migrate-new'

export default async function MigrationInit() {
  // Only run migrations in development or on initial production setup
  if (process.env.NODE_ENV === 'development' || !process.env.MIGRATIONS_RUN) {
    try {
      const result = await runMigrations()

      if (result.success) {
        console.log('Database migrations completed successfully')
      } else {
        console.warn('Migration warning:', result.error)
      }
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  return null
}
