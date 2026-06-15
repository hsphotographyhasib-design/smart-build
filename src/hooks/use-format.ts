'use client'

import { useCallback, useMemo } from 'react'
import { useRegion } from '@/components/providers/regional-provider'
import { convertCurrency } from '@/lib/regional/regional-config'

export function useFormat() {
  const { currency, dateFormat, timezone, country, taxRules, phonePlaceholder } = useRegion()

  const currencyCode = currency?.code ?? 'BND'
  const currencySymbol = currency?.symbolNative ?? 'B$'
  const decimalDigits = currency?.decimalDigits ?? 2
  const currencyLocale = (currency as any)?.locale ?? 'en'

  // Full currency formatting: B$ 1,500.00
  const formatCurrency = useCallback((amount: number, overrideCode?: string): string => {
    // Handle null/undefined/NaN gracefully
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
    const code = overrideCode || currencyCode
    const cur = currency && !overrideCode ? currency : null

    if (!cur && overrideCode) {
      // Try basic formatting for override codes
      try {
        return new Intl.NumberFormat('en', {
          style: 'currency',
          currency: code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          currencyDisplay: 'code',
        }).format(safeAmount)
      } catch {
        return `${code} ${safeAmount.toLocaleString()}`
      }
    }

    if (!cur) return `${safeAmount.toFixed(2)}`

    const { symbolNative, decimalDigits: dd } = cur

    // IDR: no decimals, dot thousands separator
    if (code === 'IDR') {
      return `${symbolNative} ${Math.round(safeAmount).toLocaleString('id-ID')}`
    }

    // VND, THB: no decimals
    if (code === 'VND' || code === 'THB') {
      return `${symbolNative} ${Math.round(safeAmount).toLocaleString()}`
    }

    // Use Intl.NumberFormat for number formatting, then prepend our custom symbol
    // (Intl's narrowSymbol strips prefixes like "B" from "B$", so we use our own symbol)
    try {
      const formatted = new Intl.NumberFormat(cur.locale || 'en', {
        minimumFractionDigits: dd,
        maximumFractionDigits: dd,
      }).format(safeAmount)
      return `${symbolNative}${formatted}`
    } catch {
      return `${symbolNative} ${safeAmount.toLocaleString(undefined, {
        minimumFractionDigits: dd,
        maximumFractionDigits: dd,
      })}`
    }
  }, [currency, currencyCode])

  // Compact currency formatting: B$1.5M, S$245K, Rp560K
  const formatCurrencyCompact = useCallback((amount: number): string => {
    if (amount >= 1_000_000_000) {
      const val = amount / 1_000_000_000
      return `${currencySymbol}${(val % 1 === 0 ? val.toFixed(0) : val.toFixed(1))}B`
    }
    if (amount >= 1_000_000) {
      const val = amount / 1_000_000
      return `${currencySymbol}${(val % 1 === 0 ? val.toFixed(0) : val.toFixed(1))}M`
    }
    if (amount >= 1_000) {
      const val = amount / 1_000
      return `${currencySymbol}${(val % 1 === 0 ? val.toFixed(0) : val.toFixed(1))}K`
    }
    return `${currencySymbol}${Math.round(amount).toLocaleString()}`
  }, [currencySymbol])

  // Convert pricing from base BND to user's local currency
  const convertAndFormat = useCallback((bndAmount: number): string => {
    if (currencyCode === 'BND') return formatCurrency(bndAmount)
    const converted = convertCurrency(bndAmount, 'BND', currencyCode)
    return formatCurrency(converted)
  }, [currencyCode, formatCurrency])

  // Convert + compact format for pricing display
  const convertAndFormatCompact = useCallback((bndAmount: number): string => {
    if (currencyCode === 'BND') return formatCurrencyCompact(bndAmount)
    const converted = convertCurrency(bndAmount, 'BND', currencyCode)
    return formatCurrencyCompact(converted)
  }, [currencyCode, formatCurrencyCompact])

  // Just the currency symbol
  const getCurrencySymbol = useCallback((): string => {
    return currencySymbol
  }, [currencySymbol])

  // Just the currency code
  const getCurrencyCode = useCallback((): string => {
    return currencyCode
  }, [currencyCode])

  // Get phone placeholder for detected country
  const getPhonePlaceholder = useCallback((): string => {
    return phonePlaceholder ?? '+673 7123456'
  }, [phonePlaceholder])

  // Get calling code
  const getCallingCode = useCallback((): string => {
    return country?.callingCode ?? '+673'
  }, [country])

  // Get country flag emoji
  const getCountryFlag = useCallback((): string => {
    return country?.flagEmoji ?? '🇧🇳'
  }, [country])

  // Get country name
  const getCountryName = useCallback((): string => {
    return country?.name ?? 'Brunei'
  }, [country])

  // Full country label for selectors: 🇧🇳 Brunei (BND)
  const getCountryLabel = useCallback((): string => {
    return `${getCountryFlag()} ${getCountryName()} (${currencyCode})`
  }, [getCountryFlag, getCountryName, currencyCode])

  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`
      case 'DD/MM/YYYY':
      default:
        return `${day}/${month}/${year}`
    }
  }, [dateFormat])

  const formatDateTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''

    // Use locale-aware time formatting
    const locale = country?.code === 'US' ? 'en-US' : 'en-GB'
    const time = d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${formatDate(date)} ${time}`
  }, [dateFormat, formatDate, country])

  const formatPhone = useCallback((phone: string): string => {
    if (!country) return phone
    const cleaned = phone.replace(/^0+/, '')
    return `${country.callingCode} ${cleaned}`
  }, [country])

  const formatTax = useCallback((amount: number): string => {
    if (!taxRules || taxRules.rate === 0) return 'No tax'
    const taxAmount = amount * taxRules.rate
    return `${taxRules.name} (${(taxRules.rate * 100).toFixed(0)}%): ${formatCurrency(taxAmount)}`
  }, [taxRules, formatCurrency])

  // Get dynamic tax registration label (e.g. "GST No." for India, "Tax Reg. No." for Brunei)
  const getTaxName = useCallback((): string => {
    if (!taxRules || taxRules.rate === 0) return 'Tax Reg. No.'
    return `${taxRules.name} No.`
  }, [taxRules])

  // Short tax name for column headers (e.g. "GST", "SST", "Tax" for zero-tax)
  const getTaxShortName = useCallback((): string => {
    if (!taxRules || taxRules.rate === 0) return 'Tax'
    return taxRules.name
  }, [taxRules])

  return {
    formatCurrency,
    formatCurrencyCompact,
    convertAndFormat,
    convertAndFormatCompact,
    getCurrencySymbol,
    getCurrencyCode,
    getPhonePlaceholder,
    getCallingCode,
    getCountryFlag,
    getCountryName,
    getCountryLabel,
    formatDate,
    formatDateTime,
    formatPhone,
    formatTax,
    getTaxName,
    getTaxShortName,
    // Raw values
    currency,
    currencyCode,
    currencySymbol,
    decimalDigits,
    dateFormat,
    timezone,
    country,
    taxRules,
  }
}
