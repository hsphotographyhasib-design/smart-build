// ============ REGIONAL FORMATTING UTILITIES ============

import { CURRENCIES, COUNTRIES } from './regional-config'

/**
 * Format a number as currency
 * Examples: B$ 1,500.00 | S$ 2,340.50 | Rp 1.500.000 | ฿ 25,130
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()]
  if (!currency) return `${amount.toFixed(2)}`

  const { code, symbolNative, decimalDigits, locale } = currency

  // Special handling for IDR - uses dot as thousands separator
  if (code === 'IDR') {
    const formatted = Math.round(amount).toLocaleString('id-ID')
    return `${symbolNative} ${formatted}`
  }

  // Special handling for VND - no decimals, comma thousands
  if (code === 'VND') {
    const formatted = Math.round(amount).toLocaleString('vi-VN')
    return `${symbolNative} ${formatted}`
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
      currencyDisplay: 'narrowSymbol',
    }).format(amount)
  } catch {
    // Fallback for unsupported Intl currency
    return `${symbolNative} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    })}`
  }
}

/**
 * Get just the currency symbol
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCIES[code.toUpperCase()]?.symbolNative ?? code
}

/**
 * Format a date string based on the specified format
 * Supports: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 */
export function formatDate(date: Date | string, format: string = 'DD/MM/YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`
  }
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string, format: string = 'DD/MM/YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : d
  if (isNaN(d.getTime())) return ''

  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${formatDate(d, format)} ${time}`
}

/**
 * Format a phone number with country calling code
 */
export function formatPhone(phone: string, countryCode: string): string {
  const country = COUNTRIES[countryCode.toUpperCase()]
  if (!country) return phone

  // Strip leading 0 or country code if present
  const cleaned = phone.replace(/^0+/, '').replace(/^\+?\d{1,3}/, '')
  return `${country.callingCode} ${cleaned}`
}

/**
 * Get country flag emoji
 */
export function getCountryFlag(code: string): string {
  return COUNTRIES[code.toUpperCase()]?.flagEmoji ?? ''
}

/**
 * Get country name
 */
export function getCountryName(code: string): string {
  return COUNTRIES[code.toUpperCase()]?.name ?? code
}

/**
 * Parse a date string into a Date object based on format
 */
export function parseDate(dateStr: string, format: string): Date | null {
  if (!dateStr) return null
  const parts = dateStr.split(/[\/\-]/)
  if (parts.length !== 3) return null

  let day: number, month: number, year: number

  switch (format) {
    case 'MM/DD/YYYY':
      month = parseInt(parts[0], 10)
      day = parseInt(parts[1], 10)
      year = parseInt(parts[2], 10)
      break
    case 'YYYY-MM-DD':
      year = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10)
      day = parseInt(parts[2], 10)
      break
    case 'DD/MM/YYYY':
    default:
      day = parseInt(parts[0], 10)
      month = parseInt(parts[1], 10)
      year = parseInt(parts[2], 10)
      break
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  return new Date(year, month - 1, day)
}

/**
 * Format an address for the given country
 */
export function formatAddress(
  address: {
    street?: string
    city?: string
    state?: string
    district?: string
    province?: string
    postalCode?: string
    country?: string
  },
  countryCode: string
): string {
  const country = COUNTRIES[countryCode.toUpperCase()]
  const parts: string[] = []

  if (address.street) parts.push(address.street)
  if (address.district) parts.push(address.district)
  if (address.city) parts.push(address.city)
  if (address.state || address.province) parts.push(address.state || address.province || '')
  if (address.postalCode) parts.push(address.postalCode)
  if (address.country) parts.push(address.country)
  else if (country) parts.push(country.name)

  return parts.join(', ')
}

/**
 * Format a relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`
  return formatDate(d, 'DD/MM/YYYY')
}
