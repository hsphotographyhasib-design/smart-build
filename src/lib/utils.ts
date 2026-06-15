import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============ FORMATTING UTILITIES ============

/**
 * Format a number as currency (INR by default).
 * Consolidated from 37+ duplicate implementations across the codebase.
 */
export function formatCurrency(
  amount: number,
  options?: {
    currency?: 'INR' | 'USD'
    notation?: 'standard' | 'compact'
    compactMaxFrac?: number
    maximumFractionDigits?: number
  }
): string {
  const {
    currency = 'INR',
    notation = 'standard',
    compactMaxFrac = 1,
    maximumFractionDigits = 0,
  } = options || {}

  const locale = currency === 'INR' ? 'en-IN' : 'en-US'

  if (notation === 'compact') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: compactMaxFrac,
    }).format(amount)
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * Format INR amounts with Cr/L/K notation for large numbers.
 * E.g., 15000000 → "₹1.5Cr", 230000 → "₹2.3L", 500000 → "₹5.0L"
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Format a date relative to now (e.g., "2 hours ago", "3 days ago").
 * Consolidated from 4 duplicate implementations.
 */
export function formatTimeAgo(dateStr: string | Date): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Format a date as a readable string.
 */
export function formatDate(dateStr: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaults: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
  return new Date(dateStr).toLocaleDateString('en-IN', options || defaults)
}

/**
 * Cap a pagination limit to prevent excessive queries.
 */
export function capPaginationLimit(limit: number, max = 100): number {
  return Math.max(1, Math.min(limit, max))
}
