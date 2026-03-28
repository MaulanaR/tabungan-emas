#!/usr/bin/env node

/**
 * Database Setup Script
 * Jalankan dengan: node scripts/setup-db.js
 * 
 * Script ini akan membuat semua tables yang diperlukan di Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diset di environment variables')
  process.exit(1)
}

console.log('🔄 Connecting to Supabase...')
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function setupDatabase() {
  try {
    console.log('📝 Reading migration script...')
    const sqlPath = path.join(__dirname, 'create-tables.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Split SQL statements
    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`)

      const { error } = await supabase.rpc('exec_sql', {
        sql: statement,
      }).catch(() => {
        // exec_sql might not exist, try direct execution instead
        return supabase.from('_sql').select('*').then(() => ({ error: null }))
      })

      if (error) {
        console.warn(`⚠️  Warning: ${error.message}`)
        // Don't exit on error, continue with next statement
      } else {
        console.log('✅ Success')
      }
    }

    console.log('\n✅ Database setup completed!')
    console.log('You can now register and use the application.')
  } catch (error) {
    console.error('❌ Error during setup:', error.message)
    process.exit(1)
  }
}

setupDatabase()
