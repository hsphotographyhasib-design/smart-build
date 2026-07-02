'use client'

import { useCountUp } from './motion'
import { useMemo } from 'react'

/** Animated count-up number with compact currency / number formatting. */
export function AnimatedNumber({
  value, format = 'number', duration = 900,
}: {
  value: number
  format?: 'money' | 'money-full' | 'number' | 'percent' | 'int'
  duration?: number
}) {
  const v = useCountUp(value, duration)
  return <>{formatValue(v, format)}</>
}

function formatValue(v: number, format: string): string {
  switch (format) {
    case 'money':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(v || 0)
    case 'money-full':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0)
    case 'percent':
      return `${(v || 0).toFixed(1)}%`
    case 'int':
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v || 0)
    default:
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(v || 0)
  }
}
