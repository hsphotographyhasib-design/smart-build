// ============ আঞ্চলিক ফরম্যাটিং সহায়ক সামগ্রী ============

import { CURRENCIES, COUNTRIES } from './regional-config'

/**
 * সংখ্যাকে মুদ্রা হিসেবে ফরম্যাট করা হচ্ছে
 * উদাহরণ: B$ 1,500.00 | S$ 2,340.50 | Rp 1.500.000 | ฿ 25,130
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode.toUpperCase()]
  if (!currency) return `${amount.toFixed(2)}`

  const { code, symbolNative, decimalDigits, locale } = currency

  // IDR-এর জন্য বিশেষ প্রক্রিয়াকরণ - হাজার বিভাজক হিসেবে ডট ব্যবহৃত হয়
  if (code === 'IDR') {
    const formatted = Math.round(amount).toLocaleString('id-ID')
    return `${symbolNative} ${formatted}`
  }

  // VND-এর জন্য বিশেষ প্রক্রিয়াকরণ - দশমিক নেই, কমা হাজার বিভাজক
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
    // অসমর্থিত Intl মুদ্রার জন্য বিকল্প
    return `${symbolNative} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    })}`
  }
}

/**
 * শুধুমাত্র মুদ্রা প্রতীক প্রদান করা হচ্ছে
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCIES[code.toUpperCase()]?.symbolNative ?? code
}

/**
 * নির্দিষ্ট ফরম্যাট অনুযায়ী তারিখ স্ট্রিং ফরম্যাট করা হচ্ছে
 * সমর্থিত: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
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
 * সময়সহ তারিখ ফরম্যাট করা হচ্ছে
 */
export function formatDateTime(date: Date | string, format: string = 'DD/MM/YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : d
  if (isNaN(d.getTime())) return ''

  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${formatDate(d, format)} ${time}`
}

/**
 * দেশের কলিং কোড সহ ফোন নম্বর ফরম্যাট করা হচ্ছে
 */
export function formatPhone(phone: string, countryCode: string): string {
  const country = COUNTRIES[countryCode.toUpperCase()]
  if (!country) return phone

  // প্রাথমিক ০ বা দেশের কোড থাকলে সরানো হচ্ছে
  const cleaned = phone.replace(/^0+/, '').replace(/^\+?\d{1,3}/, '')
  return `${country.callingCode} ${cleaned}`
}

/**
 * দেশের পতাকা ইমোজি প্রদান করা হচ্ছে
 */
export function getCountryFlag(code: string): string {
  return COUNTRIES[code.toUpperCase()]?.flagEmoji ?? ''
}

/**
 * দেশের নাম প্রদান করা হচ্ছে
 */
export function getCountryName(code: string): string {
  return COUNTRIES[code.toUpperCase()]?.name ?? code
}

/**
 * ফরম্যাট অনুযায়ী তারিখ স্ট্রিং থেকে Date অবজেক্ট পার্স করা হচ্ছে
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
 * প্রদত্ত দেশের জন্য ঠিকানা ফরম্যাট করা হচ্ছে
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
 * আপেক্ষিক সময় ফরম্যাট করা হচ্ছে (যেমন, "2 hours ago", "3 days ago")
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
