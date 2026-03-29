# Emas API Integration Documentation

## Overview

This project is integrated with Emas API (emas.maulanar.my.id) for real-time gold price data from trusted Indonesian sources including Antam (Logammulia.com) and Galeri 24.

## Prerequisites

1. **Emas API Key**: You need to obtain an API key from [emas.maulanar.my.id/dashboard](https://emas.maulanar.my.id/dashboard)
2. **Environment Variable**: Configure your API key in `.env` file

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Emas API Configuration
EMAS_API_KEY="YOUR_EMAS_API_KEY"
```

**Important:**
- Sign up at [emas.maulanar.my.id](https://emas.maulanar.my.id) to get your API key
- Without an API key, requests will be rate-limited or blocked
- Use the API key for all production applications

## Architecture

### 1. API Client (`lib/api/emas-api.ts`)

The `EmasApiClient` class provides methods to interact with the Emas API:

```typescript
import { getEmasApiClient, fetchAndStoreGoldPrices } from '@/lib/api/emas-api'

// Get API client instance
const client = getEmasApiClient()

// Fetch all prices with filters
const prices = await client.fetchAllPrices({
  brand: 'antam',
  limit: 10,
  sort_by: 'sell_price',
  order: 'asc'
})

// Fetch prices by brand
const antamPrices = await client.fetchPricesByBrand('Antam')

// Fetch prices by resource
const galeri24Prices = await client.fetchPricesByResource('galeri24')

// Fetch and store prices in database
const result = await fetchAndStoreGoldPrices()
```

### 2. API Endpoints

#### Sync Gold Prices
**POST** `/api/gold-prices/sync`

Fetches the latest gold prices from Emas API and stores them in the database.

**Response:**
```json
{
  "success": true,
  "message": "Successfully imported 15 gold prices",
  "importedCount": 15
}
```

### 3. Auto-Sync System

The application includes an automatic price synchronization system:

- **Initial Sync**: Runs when user first visits the app
- **Periodic Sync**: Automatically syncs prices every 60 minutes
- **Manual Sync**: Users can manually refresh prices via sync button

#### Auto-Sync Component (`components/gold-prices-auto-sync.tsx`)

Automatically included in the root layout, runs client-side:

```typescript
// Uses localStorage to track last sync time
// Syncs if no previous sync or if > 60 minutes since last sync
// Prevents duplicate syncs across multiple tabs
```

### 4. Display Components

#### GoldPricesDisplay (`components/gold-prices-display.tsx`)

Reusable component for displaying current gold prices with:
- Real-time updates via Supabase real-time subscriptions
- Automatic price change indicators
- Sync button for manual refresh
- Last update time display

## Data Structure

### Gold Price Schema

```typescript
interface GoldPrice {
  id: string
  brand: string              // Brand name (ANTAM, UBS, etc.)
  resource: string          // Data source (antam, galeri24)
  weight: number           // Weight in grams
  sell_price: number       // Sell price per gram (buy_price)
  buyback_price: number    // Buyback price per gram (sell_price)
  price_change_percent: number  // Price change percentage
  fetched_at: string      // ISO timestamp of last update
}
```

### Database Schema

```sql
CREATE TABLE public.gold_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  buy_price NUMERIC(12, 2) NOT NULL,
  sell_price NUMERIC(12, 2) NOT NULL,
  price_change_percent NUMERIC(5, 2),
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Usage Examples

### 1. Display Gold Prices in UI

```tsx
import GoldPricesDisplay from '@/components/gold-prices-display'

export default function MyPage() {
  return (
    <div>
      <GoldPricesDisplay />
    </div>
  )
}
```

### 2. Get Latest Price for a Brand

```typescript
import { createClient } from '@/lib/supabase/server'

async function getLatestPrice(brand: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gold_prices')
    .select('*')
    .eq('brand', brand)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()
  
  return data
}
```

### 3. Calculate Total Portfolio Value

```typescript
async function calculatePortfolioValue(purchases: any[]) {
  const supabase = await createClient()
  
  let totalValue = 0
  
  for (const purchase of purchases) {
    const { data: price } = await supabase
      .from('gold_prices')
      .select('sell_price')
      .eq('brand', purchase.brand)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()
    
    if (price) {
      totalValue += purchase.weight_grams * price.sell_price
    }
  }
  
  return totalValue
}
```

### 4. Trigger Manual Sync

```typescript
async function syncGoldPrices() {
  const response = await fetch('/api/gold-prices/sync', {
    method: 'POST',
  })
  
  const result = await response.json()
  console.log('Sync result:', result)
}
```

## API Features

### Supported Data Sources

- **Antam**: Official prices from Logammulia.com
- **Galeri 24**: Retail prices from Galeri24.co.id

### Filtering Options

The API supports advanced filtering via query parameters:

```typescript
// Filter by brand
client.fetchAllPrices({ brand: 'antam' })

// Filter by weight
client.fetchAllPrices({ weight: 1 })

// Filter by price range
client.fetchAllPrices({
  weight_gte: 1,
  weight_lte: 10,
  sort_by: 'sell_price',
  order: 'asc'
})

// Pagination
client.fetchAllPrices({
  page: 1,
  limit: 20
})
```

### Available Operators

- `eq` - Equal to (default)
- `gt` / `gte` - Greater than (or equal to)
- `lt` / `lte` - Less than (or equal to)
- `like` - SQL LIKE pattern matching

## Performance Optimization

### 1. Caching Strategy

- **Server-side**: No cache (`cache: 'no-store'`) to ensure fresh data
- **Database**: Upsert operations prevent duplicates
- **Client-side**: localStorage prevents excessive API calls

### 2. Real-time Updates

```typescript
// Supabase real-time subscription
supabase
  .channel('gold_prices_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'gold_prices',
  }, (payload) => {
    console.log('Gold prices updated:', payload)
    // Refresh UI
  })
  .subscribe()
```

### 3. Batch Operations

```typescript
// Fetch and store multiple brands at once
const result = await fetchAndStoreGoldPrices()
// Returns all available brands in single API call
```

## Security Considerations

1. **API Key Protection**
   - Never expose API keys in client-side code
   - Store in environment variables
   - Use Supabase Edge Functions for sensitive operations

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Cache results when appropriate
   - Monitor API usage

3. **Data Validation**
   - Validate price data before storing
   - Handle API errors gracefully
   - Log suspicious price changes

## Troubleshooting

### Common Issues

**1. "EMAS_API_KEY environment variable is not set"**
- Add `EMAS_API_KEY` to `.env` file
- Restart development server
- Verify key is correct format

**2. "Failed to fetch gold prices"**
- Check internet connection
- Verify API key is valid
- Check Emas API status
- Review rate limits

**3. Prices not updating**
- Check auto-sync logs in browser console
- Verify Supabase real-time subscription is active
- Manually trigger sync via sync button
- Check database RLS policies

**4. Duplicate prices in database**
- Ensure unique constraint on (brand, fetched_at)
- Check upsert logic
- Review sync frequency

### Debugging

Enable detailed logging:

```typescript
// In lib/api/emas-api.ts
console.log('Fetching gold prices from:', url)
console.log('Response:', response)
console.log('Inserted:', importedCount, 'prices')
```

Check browser console for:
- API request logs
- Sync status messages
- Error details

## Monitoring

### Sync Status Tracking

The auto-sync component tracks:
- Last sync time (localStorage)
- Sync success/failure
- Number of prices imported

### Performance Metrics

Monitor:
- API response times
- Database query performance
- Sync frequency
- Failed sync attempts

## Best Practices

1. **Initial Data Load**: Pre-populate database with historical data
2. **Sync Frequency**: Balance between freshness and API usage
3. **Error Handling**: Implement retry logic for failed syncs
4. **User Feedback**: Show sync status to users
5. **Fallback Data**: Display cached data if sync fails

## API Documentation

For more details about the Emas API:
- Official Docs: https://emas.maulanar.my.id/docs
- Dashboard: https://emas.maulanar.my.id/dashboard
- Base URL: https://emas.maulanar.my.id

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Ensure Supabase database is accessible
4. Review Emas API documentation
5. Check rate limits and API usage

---

**Note:** Always test with a valid API key before deploying to production. Monitor API usage to avoid hitting rate limits.
