import { db } from '@/lib/db'

/**
 * ডাটাবেজে সকল আঞ্চলিক লোকালাইজেশন ডেটা সিড করা হচ্ছে।
 * আইডেম্পোটেন্ট - একাধিকবার চালানো নিরাপদ।
 */
export async function seedRegionalData() {
  console.log('🌱 Seeding regional data...')

  // ──────────── মুদ্রা ────────────
  const currencyData: Record<string, { name: string; symbol: string; symbolNative: string; decimalDigits: number }> = {
    BND:  { name: 'Brunei Dollar',        symbol: 'B$',  symbolNative: 'B$',  decimalDigits: 2 },
    SGD:  { name: 'Singapore Dollar',      symbol: 'S$',  symbolNative: 'S$',  decimalDigits: 2 },
    MYR:  { name: 'Malaysian Ringgit',     symbol: 'RM',  symbolNative: 'RM',  decimalDigits: 2 },
    IDR:  { name: 'Indonesian Rupiah',     symbol: 'Rp',  symbolNative: 'Rp',  decimalDigits: 0 },
    THB:  { name: 'Thai Baht',            symbol: '฿',   symbolNative: '฿',   decimalDigits: 0 },
    PHP:  { name: 'Philippine Peso',       symbol: '₱',   symbolNative: '₱',   decimalDigits: 2 },
    VND:  { name: 'Vietnamese Dong',       symbol: '₫',   symbolNative: '₫',   decimalDigits: 0 },
    AUD:  { name: 'Australian Dollar',     symbol: 'A$',  symbolNative: 'A$',  decimalDigits: 2 },
    GBP:  { name: 'British Pound',        symbol: '£',   symbolNative: '£',   decimalDigits: 2 },
    USD:  { name: 'US Dollar',            symbol: '$',   symbolNative: '$',   decimalDigits: 2 },
    AED:  { name: 'UAE Dirham',           symbol: 'د.إ', symbolNative: 'د.إ', decimalDigits: 2 },
    SAR:  { name: 'Saudi Riyal',          symbol: '﷼',   symbolNative: '﷼',   decimalDigits: 2 },
    INR:  { name: 'Indian Rupee',          symbol: '₹',   symbolNative: '₹',   decimalDigits: 2 },
  }

  const currencyIds: Record<string, string> = {}
  for (const [code, data] of Object.entries(currencyData)) {
    const existing = await db.currency.findUnique({ where: { code } })
    if (existing) {
      currencyIds[code] = existing.id
    } else {
      const created = await db.currency.create({
        data: { code, ...data },
      })
      currencyIds[code] = created.id
      console.log(`  ✅ Currency: ${code} - ${data.name}`)
    }
  }

  // ──────────── দেশসমূহ ────────────
  const countryData = [
    { code: 'BN', name: 'Brunei',           callingCode: '+673', flagEmoji: '🇧🇳', timezone: 'Asia/Brunei',          utcOffset: 'UTC+8',    dateFormat: 'DD/MM/YYYY', sortOrder: 0 },
    { code: 'SG', name: 'Singapore',        callingCode: '+65', flagEmoji: '🇸🇬', timezone: 'Asia/Singapore',       utcOffset: 'UTC+8',    dateFormat: 'DD/MM/YYYY', sortOrder: 1 },
    { code: 'MY', name: 'Malaysia',         callingCode: '+60', flagEmoji: '🇲🇾', timezone: 'Asia/Kuala_Lumpur',   utcOffset: 'UTC+8',    dateFormat: 'DD/MM/YYYY', sortOrder: 2 },
    { code: 'ID', name: 'Indonesia',        callingCode: '+62', flagEmoji: '🇮🇩', timezone: 'Asia/Jakarta',         utcOffset: 'UTC+7',    dateFormat: 'DD/MM/YYYY', sortOrder: 3 },
    { code: 'TH', name: 'Thailand',         callingCode: '+66', flagEmoji: '🇹🇭', timezone: 'Asia/Bangkok',         utcOffset: 'UTC+7',    dateFormat: 'DD/MM/YYYY', sortOrder: 4 },
    { code: 'PH', name: 'Philippines',      callingCode: '+63', flagEmoji: '🇵🇭', timezone: 'Asia/Manila',          utcOffset: 'UTC+8',    dateFormat: 'MM/DD/YYYY', sortOrder: 5 },
    { code: 'VN', name: 'Vietnam',          callingCode: '+84', flagEmoji: '🇻🇳', timezone: 'Asia/Ho_Chi_Minh',     utcOffset: 'UTC+7',    dateFormat: 'DD/MM/YYYY', sortOrder: 6 },
    { code: 'AU', name: 'Australia',        callingCode: '+61', flagEmoji: '🇦🇺', timezone: 'Australia/Sydney',     utcOffset: 'UTC+10',   dateFormat: 'DD/MM/YYYY', sortOrder: 7 },
    { code: 'GB', name: 'United Kingdom',   callingCode: '+44', flagEmoji: '🇬🇧', timezone: 'Europe/London',        utcOffset: 'UTC+0',    dateFormat: 'DD/MM/YYYY', sortOrder: 8 },
    { code: 'US', name: 'United States',    callingCode: '+1',  flagEmoji: '🇺🇸', timezone: 'America/New_York',     utcOffset: 'UTC-5',    dateFormat: 'MM/DD/YYYY', sortOrder: 9 },
    { code: 'AE', name: 'United Arab Emirates', callingCode: '+971', flagEmoji: '🇦🇪', timezone: 'Asia/Dubai',       utcOffset: 'UTC+4',    dateFormat: 'DD/MM/YYYY', sortOrder: 10 },
    { code: 'SA', name: 'Saudi Arabia',     callingCode: '+966', flagEmoji: '🇸🇦', timezone: 'Asia/Riyadh',         utcOffset: 'UTC+3',    dateFormat: 'DD/MM/YYYY', sortOrder: 11 },
    { code: 'IN', name: 'India',            callingCode: '+91', flagEmoji: '🇮🇳', timezone: 'Asia/Kolkata',         utcOffset: 'UTC+5:30', dateFormat: 'DD/MM/YYYY', sortOrder: 12 },
  ]

  // দেশের কোড → ডিফল্ট মুদ্রা কোড ম্যাপিং
  const countryCurrencyMap: Record<string, string> = {
    BN: 'BND', SG: 'SGD', MY: 'MYR', ID: 'IDR', TH: 'THB', PH: 'PHP', VN: 'VND',
    AU: 'AUD', GB: 'GBP', US: 'USD', AE: 'AED', SA: 'SAR', IN: 'INR',
  }

  // দেশের কোড → ডিফল্ট ভাষা কোড ম্যাপিং
  const countryLanguageMap: Record<string, string[]> = {
    BN: ['en'], SG: ['en', 'zh', 'ms'], MY: ['ms', 'en', 'zh'],
    ID: ['id', 'en'], TH: ['th', 'en'], PH: ['en', 'fil'],
    VN: ['vi', 'en'], AU: ['en'], GB: ['en'], US: ['en'],
    AE: ['ar', 'en'], SA: ['ar', 'en'], IN: ['en', 'hi'],
  }

  // কর নিয়মাবলী
  const countryTaxMap: Record<string, { name: string; rate: number }> = {
    BN: { name: 'No Tax', rate: 0 },
    SG: { name: 'GST', rate: 0.09 },
    MY: { name: 'SST', rate: 0.10 },
    ID: { name: 'VAT', rate: 0.11 },
    TH: { name: 'VAT', rate: 0.07 },
    PH: { name: 'VAT', rate: 0.12 },
    VN: { name: 'VAT', rate: 0.10 },
    AU: { name: 'GST', rate: 0.10 },
    GB: { name: 'VAT', rate: 0.20 },
    US: { name: 'Sales Tax', rate: 0 },
    AE: { name: 'VAT', rate: 0.05 },
    SA: { name: 'VAT', rate: 0.15 },
    IN: { name: 'GST', rate: 0.18 },
  }

  const countryIds: Record<string, string> = {}
  for (const c of countryData) {
    const existing = await db.country.findUnique({ where: { code: c.code } })
    if (existing) {
      countryIds[c.code] = existing.id
    } else {
      const created = await db.country.create({ data: c })
      countryIds[c.code] = created.id
      console.log(`  ✅ Country: ${c.flagEmoji} ${c.name} (${c.code})`)
    }
  }

  // ──────────── ভাষাসমূহ ────────────
  const languageData = [
    { code: 'en',  name: 'English',    nativeName: 'English' },
    { code: 'ms',  name: 'Malay',      nativeName: 'Bahasa Melayu' },
    { code: 'zh',  name: 'Chinese',    nativeName: '中文' },
    { code: 'id',  name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'th',  name: 'Thai',       nativeName: 'ไทย' },
    { code: 'vi',  name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'ar',  name: 'Arabic',     nativeName: 'العربية' },
    { code: 'hi',  name: 'Hindi',      nativeName: 'हिन्दी' },
    { code: 'fil', name: 'Filipino',   nativeName: 'Filipino' },
  ]

  const languageIds: Record<string, string> = {}
  for (const l of languageData) {
    const existing = await db.language.findUnique({ where: { code: l.code } })
    if (existing) {
      languageIds[l.code] = existing.id
    } else {
      const created = await db.language.create({ data: l })
      languageIds[l.code] = created.id
    }
  }

  // ──────────── আঞ্চলিক মুদ্রা লিংক ────────────
  for (const [cc, curCode] of Object.entries(countryCurrencyMap)) {
    const cid = countryIds[cc]
    const curId = currencyIds[curCode]
    if (!cid || !curId) continue

    const existing = await db.regionalCurrency.findUnique({
      where: { countryId_currencyId: { countryId: cid, currencyId: curId } },
    })
    if (!existing) {
      await db.regionalCurrency.create({
        data: { countryId: cid, currencyId: curId, isDefault: true },
      })
    }
  }

  // ──────────── দেশ-ভাষা লিংক ────────────
  for (const [cc, langs] of Object.entries(countryLanguageMap)) {
    const cid = countryIds[cc]
    if (!cid) continue

    for (let i = 0; i < langs.length; i++) {
      const langCode = langs[i]
      const langId = languageIds[langCode]
      if (!langId) continue

      const existing = await db.countryLanguage.findUnique({
        where: { countryId_languageId: { countryId: cid, languageId: langId } },
      })
      if (!existing) {
        await db.countryLanguage.create({
          data: { countryId: cid, languageId: langId, isDefault: i === 0 },
        })
      }
    }
  }

  // ──────────── কর নিয়মাবলী ────────────
  for (const [cc, tax] of Object.entries(countryTaxMap)) {
    const cid = countryIds[cc]
    if (!cid) continue

    const existing = await db.taxRule.findFirst({ where: { countryId: cid, name: tax.name } })
    if (!existing) {
      await db.taxRule.create({
        data: { countryId: cid, name: tax.name, rate: tax.rate },
      })
      console.log(`  ✅ Tax: ${cc} - ${tax.name} (${(tax.rate * 100).toFixed(0)}%)`)
    }
  }

  // ──────────── বিনিময় হার ────────────
  const baseCurrencyId = currencyIds['BND']
  if (baseCurrencyId) {
    const rates: Record<string, number> = {
      SGD: 1.0, MYR: 2.18, IDR: 4757, THB: 25.13, PHP: 42.21, VND: 18832,
      AUD: 2.16, GBP: 0.59, USD: 0.74, AED: 2.72, SAR: 2.78, INR: 62.02,
    }

    for (const [code, rate] of Object.entries(rates)) {
      const toCurrencyId = currencyIds[code]
      if (!toCurrencyId) continue

      const existing = await db.exchangeRate.findUnique({
        where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: baseCurrencyId, toCurrencyId } },
      })
      if (!existing) {
        await db.exchangeRate.create({
          data: { fromCurrencyId: baseCurrencyId, toCurrencyId, rate, source: 'manual' },
        })
      }
      // বিপরীত হারও তৈরি করা হচ্ছে
      const existingReverse = await db.exchangeRate.findUnique({
        where: { fromCurrencyId_toCurrencyId: { fromCurrencyId: toCurrencyId, toCurrencyId: baseCurrencyId } },
      })
      if (!existingReverse) {
        await db.exchangeRate.create({
          data: { fromCurrencyId: toCurrencyId, toCurrencyId: baseCurrencyId, rate: 1 / rate, source: 'manual' },
        })
      }
    }
  }

  // ──────────── ডিফল্ট আঞ্চলিক সেটিংস ────────────
  const existingSettings = await db.regionalSetting.findFirst()
  if (!existingSettings) {
    await db.regionalSetting.create({
      data: {
        defaultLanguage: 'en',
        defaultTimezone: 'Asia/Brunei',
        autoDetect: true,
        pricingBase: 'BND',
        demoPhone: '+673 123 4567',
        demoEmail: 'demo@smartbuild.bn',
        features: JSON.stringify({ maintenance: true, collaboration: true, clientPortal: true }),
      },
    })
    console.log('  ✅ Regional settings created')
  }

  console.log('✅ Regional data seeding complete!')
}

// সরাসরি কল করা হলে চালানো হবে
if (typeof require !== 'undefined' && require.main === module) {
  seedRegionalData().catch(console.error)
}
