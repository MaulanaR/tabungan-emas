import { Badge } from '@/components/ui/badge'

interface TierBadgeProps {
  tier: string
  className?: string
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const tierColors = {
    FREE: 'bg-gray-100 text-gray-800 border-gray-300',
    LITE: 'bg-blue-50 text-blue-800 border-blue-200',
    STANDARD: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    PRO: 'bg-purple-50 text-purple-800 border-purple-200'
  }

  const tierIcons = {
    FREE: '🆓',
    LITE: '💫',
    STANDARD: '⭐',
    PRO: '👑'
  }

  const tierLabels = {
    FREE: 'FREE',
    LITE: 'LITE',
    STANDARD: 'STANDARD',
    PRO: 'PRO'
  }

  const tierKey = (tier || 'STANDARD').toUpperCase() as keyof typeof tierColors
  const colorClass = tierColors[tierKey] || tierColors.STANDARD
  const icon = tierIcons[tierKey] || tierIcons.STANDARD
  const label = tierLabels[tierKey] || tierLabels.STANDARD

  return (
    <Badge className={`font-bold px-3 py-1 border ${colorClass} ${className}`}>
      <span className="mr-1">{icon}</span>
      {label}
    </Badge>
  )
}
