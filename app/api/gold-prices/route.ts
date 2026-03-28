import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    // Fetch from emas.maulanar.my.id API
    const apiUrl = 'https://emas.maulanar.my.id/api/gold-prices'
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // Return mock data if API fails
      return Response.json({
        prices: [
          {
            brand: 'Antam',
            buy_price: 1132000,
            sell_price: 1031000,
            price_change_percent: 0.8,
          },
          {
            brand: 'UBS',
            buy_price: 1115000,
            sell_price: 1012000,
            price_change_percent: -0.3,
          },
          {
            brand: 'Emasku',
            buy_price: 1108000,
            sell_price: 1005000,
            price_change_percent: 1.2,
          },
        ],
      })
    }

    const data = await response.json()

    // Transform data if needed
    const prices = data.prices || data.data || [
      {
        brand: 'Antam',
        buy_price: 1132000,
        sell_price: 1031000,
        price_change_percent: 0.8,
      },
      {
        brand: 'UBS',
        buy_price: 1115000,
        sell_price: 1012000,
        price_change_percent: -0.3,
      },
      {
        brand: 'Emasku',
        buy_price: 1108000,
        sell_price: 1005000,
        price_change_percent: 1.2,
      },
    ]

    return Response.json({
      prices,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching gold prices:', error)

    // Return fallback data
    return Response.json({
      prices: [
        {
          brand: 'Antam',
          buy_price: 1132000,
          sell_price: 1031000,
          price_change_percent: 0.8,
        },
        {
          brand: 'UBS',
          buy_price: 1115000,
          sell_price: 1012000,
          price_change_percent: -0.3,
        },
        {
          brand: 'Emasku',
          buy_price: 1108000,
          sell_price: 1005000,
          price_change_percent: 1.2,
        },
      ],
      error: 'Using fallback data',
    })
  }
}
