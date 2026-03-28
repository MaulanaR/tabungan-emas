interface GoldPrice {
  brand: string
  resource: string
  weight: number
  sell_price: number
  buyback_price: number
  updated_at: string
}

interface GoldPricesResponse {
  status: string
  data: GoldPrice[]
  meta?: {
    page: number
    per_page: number
    total_items: number
    total_pages: number
  }
}

const EMAS_API_BASE_URL = 'https://emas.maulanar.my.id'

export class EmasApiClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetchAllPrices(params?: {
    limit?: number
    page?: number
    brand?: string
    resource?: string
    weight?: number
    sort_by?: string
    order?: string
  }): Promise<GoldPricesResponse> {
    const queryParams = new URLSearchParams()

    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.brand) queryParams.append(`brand[eq]`, params.brand)
    if (params?.resource) queryParams.append(`resource[eq]`, params.resource)
    if (params?.weight) queryParams.append(`weight[eq]`, params.weight.toString())
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)

    const url = `${EMAS_API_BASE_URL}/api/prices${queryParams.toString() ? '?' + queryParams.toString() : ''}`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch gold prices: ${response.statusText}`)
    }

    return response.json()
  }

  async fetchPricesByBrand(brand: string): Promise<GoldPricesResponse> {
    const url = `${EMAS_API_BASE_URL}/api/prices/brand/${encodeURIComponent(brand)}`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch gold prices for brand ${brand}: ${response.statusText}`)
    }

    return response.json()
  }

  async fetchPricesByResource(resource: string): Promise<GoldPricesResponse> {
    const url = `${EMAS_API_BASE_URL}/api/prices/resource/${encodeURIComponent(resource)}`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch gold prices for resource ${resource}: ${response.statusText}`)
    }

    return response.json()
  }
}

let apiClient: EmasApiClient | null = null

export function getEmasApiClient(): EmasApiClient {
  if (!apiClient) {
    const apiKey = process.env.EMAS_API_KEY

    if (!apiKey) {
      throw new Error('EMAS_API_KEY environment variable is not set')
    }

    apiClient = new EmasApiClient(apiKey)
  }

  return apiClient
}

export async function fetchAndStoreGoldPrices(): Promise<{ success: boolean; message: string; importedCount?: number }> {
  try {
    const client = getEmasApiClient()

    const response = await client.fetchAllPrices({ limit: 50 })

    if (response.status !== 'success' || !response.data) {
      return {
        success: false,
        message: 'Failed to fetch gold prices from API',
      }
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    let importedCount = 0

    for (const price of response.data) {
      const { error } = await supabase
        .from('gold_prices')
        .upsert({
          brand: price.brand,
          buy_price: price.sell_price,
          sell_price: price.buyback_price,
          price_change_percent: 0,
          fetched_at: new Date(price.updated_at).toISOString(),
        }, {
          onConflict: 'brand,fetched_at',
        })

      if (!error) {
        importedCount++
      }
    }

    return {
      success: true,
      message: `Successfully imported ${importedCount} gold prices`,
      importedCount,
    }
  } catch (error: any) {
    console.error('Error fetching and storing gold prices:', error)
    return {
      success: false,
      message: error.message || 'Failed to fetch and store gold prices',
    }
  }
}

export default getEmasApiClient
