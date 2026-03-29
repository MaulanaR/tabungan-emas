'use client'

import { useEffect } from 'react'

export default function GoldPricesAutoSync() {
  useEffect(() => {
    const syncPrices = async () => {
      try {
        console.log('Auto-syncing gold prices...')
        const response = await fetch('/api/gold-prices/sync', {
          method: 'POST',
        })

        const data = await response.json()
        console.log('Auto-sync result:', data)
      } catch (error) {
        console.error('Auto-sync error:', error)
      }
    }

    const syncInitially = () => {
      const lastSync = localStorage.getItem('lastGoldPriceSync')

      if (!lastSync) {
        syncPrices()
        localStorage.setItem('lastGoldPriceSync', new Date().toISOString())
      } else {
        const lastSyncDate = new Date(lastSync)
        const hoursSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60 * 60)

        if (hoursSinceSync >= 1) {
          syncPrices()
          localStorage.setItem('lastGoldPriceSync', new Date().toISOString())
        }
      }
    }

    syncInitially()

    const interval = setInterval(() => {
      syncPrices()
      localStorage.setItem('lastGoldPriceSync', new Date().toISOString())
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
