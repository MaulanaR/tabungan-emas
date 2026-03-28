import { NextResponse } from 'next/server'
import { runMigrations } from '@/lib/db/migrate-new'

export async function POST() {
  try {
    console.log('Migration endpoint called')
    const result = await runMigrations()

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Migrations completed successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Migration endpoint error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('Migration status check called')
    const result = await runMigrations()

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Migrations completed successfully' })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Migration status check error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
