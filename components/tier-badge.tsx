interface TierBadgeProps {
  tier: string
  className?: string
}

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const tierStyles = {
    FREE: {
      base: 'bg-stone-50 text-stone-700 border-stone-200',
      gradient: 'from-stone-200 to-stone-100',
      icon: '🆓',
      label: 'FREE'
    },
    LITE: {
      base: 'bg-blue-50 text-blue-700 border-blue-200',
      gradient: 'from-blue-100 to-blue-50',
      icon: '💫',
      label: 'LITE'
    },
    STANDARD: {
      base: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      gradient: 'from-emerald-100 to-emerald-50',
      icon: '⭐',
      label: 'STANDARD'
    },
    PRO: {
      base: 'bg-purple-50 text-purple-700 border-purple-200',
      gradient: 'from-purple-100 to-purple-50',
      icon: '👑',
      label: 'PRO'
    }
  }

  const tierKey = (tier || 'STANDARD').toUpperCase() as keyof typeof tierStyles
  const style = tierStyles[tierKey] || tierStyles.STANDARD

  return (
    <span className={`status-chip ${style.base} ${className}`}>
      <span className="mr-1">{style.icon}</span>
      {style.label}
    </span>
  )
}
