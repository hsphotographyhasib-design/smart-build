// ============ GLOBAL LOCALIZATION & REGIONAL CONFIGURATION SERVICE ============
// Core service with country, currency, language registries and detection functions

export interface CountryConfig {
  code: string           // ISO 3166-1 alpha-2
  name: string
  callingCode: string
  flagEmoji: string
  timezone: string
  utcOffset: string
  dateFormat: string     // DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
  defaultCurrencyCode: string
  defaultLanguageCode: string
  taxName: string
  taxRate: number        // decimal: 0.07 = 7%
  addressFormat: 'street-city-state-postal' | 'street-district-city-postal' | 'street-city-province-postal'
  postalCodeLabel: string
  stateLabel: string
  sortOrder: number
  phonePlaceholder: string   // e.g. '+673 7123456'
  phoneFormat: string       // e.g. 'XX XXXXXX'
}

export interface CurrencyConfig {
  code: string           // ISO 4217
  name: string
  symbol: string
  symbolNative: string
  decimalDigits: number
  locale: string          // for Intl.NumberFormat
}

export interface LanguageConfig {
  code: string           // ISO 639-1
  name: string
  nativeName: string
}

// ──────────── COUNTRY REGISTRY ────────────
export const COUNTRIES: Record<string, CountryConfig> = {
  BN: {
    code: 'BN', name: 'Brunei', callingCode: '+673', flagEmoji: '🇧🇳',
    timezone: 'Asia/Brunei', utcOffset: 'UTC+8', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'BND', defaultLanguageCode: 'en',
    taxName: 'No Tax', taxRate: 0, addressFormat: 'street-district-city-postal',
    postalCodeLabel: 'Postal Code', stateLabel: 'District', sortOrder: 0,
    phonePlaceholder: '+673 7123456', phoneFormat: 'XX XXXXXX',
  },
  SG: {
    code: 'SG', name: 'Singapore', callingCode: '+65', flagEmoji: '🇸🇬',
    timezone: 'Asia/Singapore', utcOffset: 'UTC+8', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'SGD', defaultLanguageCode: 'en',
    taxName: 'GST', taxRate: 0.09, addressFormat: 'street-city-postal',
    postalCodeLabel: 'Postal Code', stateLabel: 'Region', sortOrder: 1,
    phonePlaceholder: '+65 8123 4567', phoneFormat: 'XXXX XXXX',
  },
  MY: {
    code: 'MY', name: 'Malaysia', callingCode: '+60', flagEmoji: '🇲🇾',
    timezone: 'Asia/Kuala_Lumpur', utcOffset: 'UTC+8', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'MYR', defaultLanguageCode: 'ms',
    taxName: 'SST', taxRate: 0.10, addressFormat: 'street-city-state-postal',
    postalCodeLabel: 'Postcode', stateLabel: 'State', sortOrder: 2,
    phonePlaceholder: '+60 12 345 6789', phoneFormat: 'XX XXX XXXX',
  },
  ID: {
    code: 'ID', name: 'Indonesia', callingCode: '+62', flagEmoji: '🇮🇩',
    timezone: 'Asia/Jakarta', utcOffset: 'UTC+7', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'IDR', defaultLanguageCode: 'id',
    taxName: 'VAT', taxRate: 0.11, addressFormat: 'street-district-city-province-postal',
    postalCodeLabel: 'Kode Pos', stateLabel: 'Province', sortOrder: 3,
    phonePlaceholder: '+62 812 3456 7890', phoneFormat: 'XXX XXXX XXXX',
  },
  TH: {
    code: 'TH', name: 'Thailand', callingCode: '+66', flagEmoji: '🇹🇭',
    timezone: 'Asia/Bangkok', utcOffset: 'UTC+7', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'THB', defaultLanguageCode: 'th',
    taxName: 'VAT', taxRate: 0.07, addressFormat: 'street-district-city-province-postal',
    postalCodeLabel: 'Postal Code', stateLabel: 'Province', sortOrder: 4,
    phonePlaceholder: '+66 812 345 678', phoneFormat: 'X XXX XXX XXX',
  },
  PH: {
    code: 'PH', name: 'Philippines', callingCode: '+63', flagEmoji: '🇵🇭',
    timezone: 'Asia/Manila', utcOffset: 'UTC+8', dateFormat: 'MM/DD/YYYY',
    defaultCurrencyCode: 'PHP', defaultLanguageCode: 'en',
    taxName: 'VAT', taxRate: 0.12, addressFormat: 'street-city-province-postal',
    postalCodeLabel: 'ZIP Code', stateLabel: 'Province', sortOrder: 5,
    phonePlaceholder: '+63 912 345 6789', phoneFormat: 'XXX XXX XXXX',
  },
  VN: {
    code: 'VN', name: 'Vietnam', callingCode: '+84', flagEmoji: '🇻🇳',
    timezone: 'Asia/Ho_Chi_Minh', utcOffset: 'UTC+7', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'VND', defaultLanguageCode: 'vi',
    taxName: 'VAT', taxRate: 0.10, addressFormat: 'street-district-city-province-postal',
    postalCodeLabel: 'Mã bưu điện', stateLabel: 'Tỉnh/Thành phố', sortOrder: 6,
    phonePlaceholder: '+84 912 345 678', phoneFormat: 'XXX XXX XXXX',
  },
  AU: {
    code: 'AU', name: 'Australia', callingCode: '+61', flagEmoji: '🇦🇺',
    timezone: 'Australia/Sydney', utcOffset: 'UTC+10', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'AUD', defaultLanguageCode: 'en',
    taxName: 'GST', taxRate: 0.10, addressFormat: 'street-city-state-postal',
    postalCodeLabel: 'Postcode', stateLabel: 'State', sortOrder: 7,
    phonePlaceholder: '+61 412 345 678', phoneFormat: 'X XXX XXX XXX',
  },
  GB: {
    code: 'GB', name: 'United Kingdom', callingCode: '+44', flagEmoji: '🇬🇧',
    timezone: 'Europe/London', utcOffset: 'UTC+0', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'GBP', defaultLanguageCode: 'en',
    taxName: 'VAT', taxRate: 0.20, addressFormat: 'street-city-postal',
    postalCodeLabel: 'Postcode', stateLabel: 'County', sortOrder: 8,
    phonePlaceholder: '+44 7123 456789', phoneFormat: 'XXXX XXXXXX',
  },
  US: {
    code: 'US', name: 'United States', callingCode: '+1', flagEmoji: '🇺🇸',
    timezone: 'America/New_York', utcOffset: 'UTC-5', dateFormat: 'MM/DD/YYYY',
    defaultCurrencyCode: 'USD', defaultLanguageCode: 'en',
    taxName: 'Sales Tax', taxRate: 0, addressFormat: 'street-city-state-postal',
    postalCodeLabel: 'ZIP Code', stateLabel: 'State', sortOrder: 9,
    phonePlaceholder: '+1 (555) 123-4567', phoneFormat: '(XXX) XXX-XXXX',
  },
  AE: {
    code: 'AE', name: 'United Arab Emirates', callingCode: '+971', flagEmoji: '🇦🇪',
    timezone: 'Asia/Dubai', utcOffset: 'UTC+4', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'AED', defaultLanguageCode: 'ar',
    taxName: 'VAT', taxRate: 0.05, addressFormat: 'street-city-postal',
    postalCodeLabel: 'Postal Code', stateLabel: 'Emirate', sortOrder: 10,
    phonePlaceholder: '+971 50 123 4567', phoneFormat: 'XX XXX XXXX',
  },
  SA: {
    code: 'SA', name: 'Saudi Arabia', callingCode: '+966', flagEmoji: '🇸🇦',
    timezone: 'Asia/Riyadh', utcOffset: 'UTC+3', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'SAR', defaultLanguageCode: 'ar',
    taxName: 'VAT', taxRate: 0.15, addressFormat: 'street-city-postal',
    postalCodeLabel: 'Postal Code', stateLabel: 'Province', sortOrder: 11,
    phonePlaceholder: '+966 50 123 4567', phoneFormat: 'XX XXX XXXX',
  },
  IN: {
    code: 'IN', name: 'India', callingCode: '+91', flagEmoji: '🇮🇳',
    timezone: 'Asia/Kolkata', utcOffset: 'UTC+5:30', dateFormat: 'DD/MM/YYYY',
    defaultCurrencyCode: 'INR', defaultLanguageCode: 'en',
    taxName: 'GST', taxRate: 0.18, addressFormat: 'street-city-state-postal',
    postalCodeLabel: 'PIN Code', stateLabel: 'State', sortOrder: 12,
    phonePlaceholder: '+91 91234 56789', phoneFormat: 'XXXXX XXXXX',
  },
}

// ──────────── CURRENCY REGISTRY ────────────
export const CURRENCIES: Record<string, CurrencyConfig> = {
  BND:  { code: 'BND',  name: 'Brunei Dollar',        symbol: 'B$',  symbolNative: 'B$',  decimalDigits: 2, locale: 'en-BN' },
  SGD:  { code: 'SGD',  name: 'Singapore Dollar',      symbol: 'S$',  symbolNative: 'S$',  decimalDigits: 2, locale: 'en-SG' },
  MYR:  { code: 'MYR',  name: 'Malaysian Ringgit',     symbol: 'RM',  symbolNative: 'RM',  decimalDigits: 2, locale: 'en-MY' },
  IDR:  { code: 'IDR',  name: 'Indonesian Rupiah',     symbol: 'Rp',  symbolNative: 'Rp',  decimalDigits: 0, locale: 'id-ID' },
  THB:  { code: 'THB',  name: 'Thai Baht',            symbol: '฿',   symbolNative: '฿',   decimalDigits: 0, locale: 'th-TH' },
  PHP:  { code: 'PHP',  name: 'Philippine Peso',       symbol: '₱',   symbolNative: '₱',   decimalDigits: 2, locale: 'en-PH' },
  VND:  { code: 'VND',  name: 'Vietnamese Dong',       symbol: '₫',   symbolNative: '₫',   decimalDigits: 0, locale: 'vi-VN' },
  AUD:  { code: 'AUD',  name: 'Australian Dollar',     symbol: 'A$',  symbolNative: 'A$',  decimalDigits: 2, locale: 'en-AU' },
  GBP:  { code: 'GBP',  name: 'British Pound',        symbol: '£',   symbolNative: '£',   decimalDigits: 2, locale: 'en-GB' },
  USD:  { code: 'USD',  name: 'US Dollar',            symbol: '$',   symbolNative: '$',   decimalDigits: 2, locale: 'en-US' },
  AED:  { code: 'AED',  name: 'UAE Dirham',           symbol: 'د.إ', symbolNative: 'د.إ', decimalDigits: 2, locale: 'ar-AE' },
  SAR:  { code: 'SAR',  name: 'Saudi Riyal',          symbol: '﷼',   symbolNative: '﷼',   decimalDigits: 2, locale: 'ar-SA' },
  INR:  { code: 'INR',  name: 'Indian Rupee',          symbol: '₹',   symbolNative: '₹',   decimalDigits: 2, locale: 'en-IN' },
}

// ──────────── LANGUAGE REGISTRY ────────────
export const LANGUAGES: Record<string, LanguageConfig> = {
  en:  { code: 'en',  name: 'English',    nativeName: 'English' },
  ms:  { code: 'ms',  name: 'Malay',      nativeName: 'Bahasa Melayu' },
  zh:  { code: 'zh',  name: 'Chinese',    nativeName: '中文' },
  id:  { code: 'id',  name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  th:  { code: 'th',  name: 'Thai',       nativeName: 'ไทย' },
  vi:  { code: 'vi',  name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  ar:  { code: 'ar',  name: 'Arabic',     nativeName: 'العربية' },
  hi:  { code: 'hi',  name: 'Hindi',      nativeName: 'हिन्दी' },
  fil: { code: 'fil', name: 'Filipino',   nativeName: 'Filipino' },
}

// ──────────── BROWSER LOCALE → COUNTRY MAPPING ────────────
const LOCALE_TO_COUNTRY: Record<string, string> = {
  'en-BN': 'BN', 'ms-BN': 'BN',
  'en-SG': 'SG', 'zh-SG': 'SG', 'ms-SG': 'SG',
  'en-MY': 'MY', 'ms-MY': 'MY', 'zh-MY': 'MY',
  'id-ID': 'ID', 'en-ID': 'ID',
  'th-TH': 'TH', 'en-TH': 'TH',
  'en-PH': 'PH', 'fil-PH': 'PH', 'tl-PH': 'PH',
  'vi-VN': 'VN', 'en-VN': 'VN',
  'en-AU': 'AU',
  'en-GB': 'GB',
  'en-US': 'US', 'es-US': 'US',
  'ar-AE': 'AE', 'en-AE': 'AE',
  'ar-SA': 'SA', 'en-SA': 'SA',
  'en-IN': 'IN', 'hi-IN': 'IN',
}

// ──────────── TIMEZONE → COUNTRY MAPPING ────────────
const TZ_TO_COUNTRY: Record<string, string> = {
  'Asia/Brunei': 'BN',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID',
  'Asia/Bangkok': 'TH',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'ID', // fallback - Vietnam
  'Asia/Saigon': 'VN',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
  'Europe/London': 'GB',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Los_Angeles': 'US',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
}

// ──────────── CORE FUNCTIONS ────────────

export function getCountryByCode(code: string): CountryConfig | null {
  return COUNTRIES[code.toUpperCase()] ?? null
}

export function getCurrencyByCode(code: string): CurrencyConfig | null {
  return CURRENCIES[code.toUpperCase()] ?? null
}

export function getLanguageByCode(code: string): LanguageConfig | null {
  return LANGUAGES[code.toLowerCase()] ?? null
}

export function getCountryCurrency(countryCode: string): CurrencyConfig | null {
  const country = getCountryByCode(countryCode)
  if (!country) return null
  return getCurrencyByCode(country.defaultCurrencyCode)
}

export function getCountryTaxRules(countryCode: string): { name: string; rate: number; appliesTo: string } | null {
  const country = getCountryByCode(countryCode)
  if (!country) return null
  return { name: country.taxName, rate: country.taxRate, appliesTo: 'all' }
}

export function getAllCountries(): CountryConfig[] {
  return Object.values(COUNTRIES).sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getAllCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCIES)
}

export function getAllLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGES)
}

export function detectCountryFromLocale(locale: string): string | null {
  // Try exact match first
  if (LOCALE_TO_COUNTRY[locale]) return LOCALE_TO_COUNTRY[locale]
  // Try normalized (lowercase)
  const normalized = locale.toLowerCase()
  for (const [key, val] of Object.entries(LOCALE_TO_COUNTRY)) {
    if (key.toLowerCase() === normalized) return val
  }
  // Try language-only match (e.g. "ms" → MY)
  const langPart = locale.split('-')[0].toLowerCase()
  if (langPart === 'ms') return 'MY'
  if (langPart === 'zh') return 'SG' // default Chinese to SG
  if (langPart === 'ar') return 'AE' // default Arabic to UAE
  if (langPart === 'hi') return 'IN'
  if (langPart === 'th') return 'TH'
  if (langPart === 'vi') return 'VN'
  if (langPart === 'id') return 'ID'
  if (langPart === 'fil' || langPart === 'tl') return 'PH'
  return null
}

export function detectCountryFromTimezone(tz: string): string | null {
  return TZ_TO_COUNTRY[tz] ?? null
}

export function detectCountryFromIP(_ip: string): string | null {
  // In production, this would use a geo-IP service (e.g., ip-api.com, MaxMind)
  // For now, return null to fall back to other detection methods
  return null
}

export interface ResolveCountryOptions {
  userPreference?: string | null
  browserLocale?: string | null
  timezone?: string | null
  ip?: string | null
}

export function resolveUserCountry(options: ResolveCountryOptions): string {
  const { userPreference, browserLocale, timezone, ip } = options

  // Priority 1: User preference (explicitly saved in DB or sessionStorage)
  if (userPreference && COUNTRIES[userPreference.toUpperCase()]) {
    return userPreference.toUpperCase()
  }

  // For this Brunei marketplace: default to Brunei (BND, zero tax)
  // Browser locale/timezone detection is disabled to avoid showing wrong currency
  // (e.g., en-US → USD, UTC → US). Uncomment below if multi-country support is needed.

  // // Priority 2: Browser locale
  // if (browserLocale) {
  //   const fromLocale = detectCountryFromLocale(browserLocale)
  //   if (fromLocale) return fromLocale
  // }

  // // Priority 3: Timezone
  // if (timezone) {
  //   const fromTz = detectCountryFromTimezone(timezone)
  //   if (fromTz) return fromTz
  // }

  // // Priority 4: IP
  // if (ip) {
  //   const fromIP = detectCountryFromIP(ip)
  //   if (fromIP) return fromIP
  // }

  // Default: Brunei
  return 'BN'
}

export function getFullRegionalConfig(countryCode: string) {
  const country = getCountryByCode(countryCode)
  if (!country) return null

  const currency = getCurrencyByCode(country.defaultCurrencyCode)
  const language = getLanguageByCode(country.defaultLanguageCode)

  return {
    country: {
      code: country.code,
      name: country.name,
      callingCode: country.callingCode,
      flagEmoji: country.flagEmoji,
      timezone: country.timezone,
      utcOffset: country.utcOffset,
    },
    currency: currency ? {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      symbolNative: currency.symbolNative,
      decimalDigits: currency.decimalDigits,
    } : null,
    language: language ? {
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
    } : null,
    timezone: country.timezone,
    dateFormat: country.dateFormat,
    taxRules: {
      name: country.taxName,
      rate: country.taxRate,
      appliesTo: 'all',
    },
    phoneFormat: country.callingCode,
    phonePlaceholder: country.phonePlaceholder,
    addressFormat: country.addressFormat,
    postalCodeLabel: country.postalCodeLabel,
    stateLabel: country.stateLabel,
  }
}

// Simple exchange rates (relative to BND as base currency)
export const BASE_EXCHANGE_RATES: Record<string, number> = {
  BND: 1,
  SGD: 1.0,     // pegged to BND
  MYR: 2.18,
  IDR: 4757.0,
  THB: 25.13,
  PHP: 42.21,
  VND: 18832.0,
  AUD: 2.16,
  GBP: 0.59,
  USD: 0.74,
  AED: 2.72,
  SAR: 2.78,
  INR: 62.02,
}

export function convertCurrency(amount: number, from: string, to: string): number {
  const fromRate = BASE_EXCHANGE_RATES[from.toUpperCase()] ?? 1
  const toRate = BASE_EXCHANGE_RATES[to.toUpperCase()] ?? 1
  return (amount / fromRate) * toRate
}
