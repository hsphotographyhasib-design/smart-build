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

  // সম্পূর্ণ মুদ্রা ফরম্যাটিং: B$ 1,500.00
  const formatCurrency = useCallback((amount: number, overrideCode?: string): string => {
    // null/undefined/NaN নিয় গ্রেসফুলি হ্যান্ডেল হলে পরিচাল
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

    // ওভাররাইড কোডের জন্য চেষ্টা করা হচ্ছে – ডট হাজার বিভাজক ব্যবহার
    if (code === 'IDR') {
      return `${symbolNative} ${Math.round(safeAmount).toLocaleString('id-ID')}`
    }

    // VND, THB: দশমিক নেই
    if (code === 'VND' || code === 'THB') {
      return `${symbolNative} ${Math.round(safeAmount).toLocaleString()}`
    }

    // Intl.NumberFormat দিয় সংখ্যা ফরম্যাটিং ব্যবহার, তারপর কাস্টম সিম্বল ব্যবহার
    // (Intl-এর narrowSymbol "B" কে "B$" স্ট্রিপ করে, তাইম আমাদের নিজে সিম্বল ব্যবহার করা হচ্ছে)
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

  // কম্প্যাক্ট মুদ্রা ফরম্যাটিং: B$1.5M, S$245K, Rp560K
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

  // বেস BND থেকে ব্যবহারীর স্থানীয় মুদ্রা রূপান্ট
  const convertAndFormat = useCallback((bndAmount: number): string => {
    if (currencyCode === 'BND') return formatCurrency(bndAmount)
    const converted = convertCurrency(bndAmount, 'BND', currencyCode)
    return formatCurrency(converted)
  }, [currencyCode, formatCurrency])

  // রূপান্ট + কম্যাক্ট ফরম্যাট প্রাইসিং প্রদর্শনের জন্য
  const convertAndFormatCompact = useCallback((bndAmount: number): string => {
    if (currencyCode === 'BND') return formatCurrencyCompact(bndAmount)
    const converted = convertCurrency(bndAmount, 'BND', currencyCode)
    return formatCurrencyCompact(converted)
  }, [currencyCode, formatCurrencyCompact])

  // শুধুমাত্র মুদ্রা প্রতীক
  const getCurrencySymbol = useCallback((): string => {
    return currencySymbol
  }, [currencySymbol])

  // শুধুমাত্র মুদ্রা কোড
  const getCurrencyCode = useCallback((): string => {
    return currencyCode
  }, [currencyCode])

  // সনাকেত দেশের জন্য ফোন প্লেসহোল্ডার প্রদান করা হচ্ছে
  const getPhonePlaceholder = useCallback((): string => {
    return phonePlaceholder ?? '+673 7123456'
  }, [phonePlaceholder])

  // কলিং কোড প্রদান করা হচ্ছে
  const getCallingCode = useCallback((): string => {
    return country?.callingCode ?? '+673'
  }, [country])

  // দেশের পতাকা ইমোজি প্রদান করা হচ্ছে
  const getCountryFlag = useCallback((): string => {
    return country?.flagEmoji ?? '🇧🇳'
  }, [country])

  // দেশের নাম প্রদান করা হচ্ছে
  const getCountryName = useCallback((): string => {
    return country?.name ?? 'Brunei'
  }, [country])

  // সিলেক্টর জন্য দেশের লেবেল: 🇧🇳 ব্রুনাই (BND)
  const getCountryLabel = useCallback((): string => {
    return `${getCountryFlag()} ${getCountryName()} (${currencyCode})`
  }, [getCountryFlag, getCountryName, currencyCode])

  // তারিখ ও স্ট্রিং ফরম্যাট করা হচ্ছে
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

    // দৈনিক-সময় ফরম্যাট ফরম্যাট ব্যবহার করা হচ্ছে
    // লোকেল-সচেব সচেয়া সময় ফরম্যাট করা হচ্ছে
    const time = d.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${formatDate(date)} ${time}`
  }, [dateFormat, formatDate, country])

  // ফোন নম্বর ফরম্যাট করা হচ্ছে
    if (!country) return phone
    const cleaned = phone.replace(/^0+/, '')
    return `${country.callingCode} ${cleaned}`
  }, [country])

  // কর হর নিয়ম ফরম্যাট করা হচ্ছে
    if (!taxRules || taxRules.rate === 0) return 'No tax'
    const taxAmount = amount * taxRules.rate
    return `${taxRules.name} (${(taxRules.rate * 100).toFixed(0)}%): ${formatCurrency(taxAmount)}`
  }, [taxRules, formatCurrency])

  // ডায়নামিক ট্যাক রেজিস্ট্রেশন লেবেল (যেমন "GST No." ভারত, ব্রুনাই "Tax Reg. No." হবে)
  const getTaxName = useCallback((): string => {
    if (!taxRules || taxRules.rate === 0) return 'Tax Reg. No.'
    return `${taxRules.name} No.`
  }, [taxRules])

  // কলাম হেডারের জন্য লেবেল (যেমন "GST", "SST", শূন্য করের জন্য)
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
    // কাঁচ মান প্রদান করা হচ্ছে
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
