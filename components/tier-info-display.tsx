'use client'

import { useEffect, useState } from 'react'
import { TierBadge } from './tier-badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TierInfo {
  tier: string
  purchases_this_year: number
  max_purchases_per_year: number
  remaining_purchases: number
  usage_percentage: number
}

interface TierInfoDisplayProps {
  className?: string
  showUpgradeAlert?: boolean
}

export function TierInfoDisplay({ className = '', showUpgradeAlert = false }: TierInfoDisplayProps) {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTierInfo() {
      try {
        const response = await fetch('/api/tier-info')
        if (response.ok) {
          const data = await response.json()
          setTierInfo(data)
        }
      } catch (error) {
        console.error('Error fetching tier info:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTierInfo()
  }, [])

  if (loading) {
    return (
      <div className={`sovereign-card ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface-container rounded w-1/3"></div>
          <div className="h-2 bg-surface-container rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (!tierInfo) {
    return null
  }

  const isNearLimit = tierInfo.remaining_purchases <= 2
  const isAtLimit = tierInfo.remaining_purchases <= 0

  return (
    <div className={`sovereign-card ${className}`}>
      {/* Tier Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-on-surface-variant">Membership</span>
          <TierBadge tier={tierInfo.tier} />
        </div>
        {showUpgradeAlert && isNearLimit && (
          <span className="text-xs font-bold text-warning">⚠️ Near Limit</span>
        )}
      </div>

      {/* Usage Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">
            {tierInfo.purchases_this_year} / {tierInfo.max_purchases_per_year} purchases
          </span>
          <span className={`font-bold ${isAtLimit ? 'text-error' : isNearLimit ? 'text-warning' : 'text-success'}`}>
            {tierInfo.remaining_purchases} remaining
          </span>
        </div>
        <Progress 
          value={tierInfo.usage_percentage} 
          className="h-2"
        />
      </div>

      {/* Alert when at or near limit */}
      {isAtLimit && (
        <div className="mt-4 p-3 rounded-lg bg-red-50">
          <AlertDescription className="text-error text-sm">
            ⛔ You've reached your annual purchase limit. Upgrade your tier to continue adding purchases.
          </AlertDescription>
        </div>
      )}

      {isNearLimit && !isAtLimit && showUpgradeAlert && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50">
          <AlertDescription className="text-warning text-sm">
            ⚠️ You have only {tierInfo.remaining_purchases} purchase{tierInfo.remaining_purchases > 1 ? 's' : ''} left this year.
          </AlertDescription>
        </div>
      )}

      {/* Tier info text */}
      <div className="mt-4 text-xs text-on-surface-variant">
        <p>Annual quota resets on January 1st</p>
      </div>
    </div>
  )
}
