import { NextResponse } from 'next/server'
import { fetchAndStoreGoldPrices } from '@/lib/api/emas-api'

export async function POST() {
  try {
    const result = await fetchAndStoreGoldPrices()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        importedCount: result.importedCount,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Gold prices sync error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to sync gold prices',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await fetchAndStoreGoldPrices()

    return NextResponse.json({
      success: result.success,
      message: result.message,
      importedCount: result.importedCount,
    })
  } catch (error: any) {
    console.error('Gold prices status error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to check gold prices status',
      },
      { status: 500 }
    )
  }
}
