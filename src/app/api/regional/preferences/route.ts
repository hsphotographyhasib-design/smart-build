import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'
import { getFullRegionalConfig } from '@/lib/regional/regional-config'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    // Get user preferences
    let prefs = await db.userPreference.findUnique({ where: { userId: user.id } })

    // If no preferences yet, use defaults based on... return empty (frontend will use detected)
    if (!prefs) {
      // Create default preferences
      prefs = await db.userPreference.create({
        data: { userId: user.id },
      })
    }

    // Build full config from preferences or defaults
    const countryCode = prefs.countryId
      ? (await db.country.findUnique({ where: { id: prefs.countryId } }))?.code ?? 'BN'
      : 'BN'

    const currencyCode = prefs.currencyId
      ? (await db.currency.findUnique({ where: { id: prefs.currencyId } }))?.code
      : undefined

    const languageCode = prefs.languageId
      ? (await db.language.findUnique({ where: { id: prefs.languageId } }))?.code
      : undefined

    const config = getFullRegionalConfig(countryCode)

    // Override with user's saved preferences
    if (currencyCode) {
      const { getCurrencyByCode } = await import('@/lib/regional/regional-config')
      const currency = getCurrencyByCode(currencyCode)
      if (currency) {
        (config as any).currency = {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          symbolNative: currency.symbolNative,
          decimalDigits: currency.decimalDigits,
        }
      }
    }

    if (languageCode) {
      const { getLanguageByCode } = await import('@/lib/regional/regional-config')
      const language = getLanguageByCode(languageCode)
      if (language) {
        (config as any).language = {
          code: language.code,
          name: language.name,
          nativeName: language.nativeName,
        }
      }
    }

    return NextResponse.json({ success: true, data: { ...config, prefs } })
  } catch (error) {
    console.error('Get preferences error:', error)
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    const body = await request.json()
    const { countryId, currencyId, languageId, timezone, dateFormat, locale } = body

    // Upsert user preferences
    const prefs = await db.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        countryId: countryId ?? null,
        currencyId: currencyId ?? null,
        languageId: languageId ?? null,
        timezone: timezone ?? null,
        dateFormat: dateFormat ?? null,
        locale: locale ?? null,
      },
      update: {
        ...(countryId !== undefined && { countryId }),
        ...(currencyId !== undefined && { currencyId }),
        ...(languageId !== undefined && { languageId }),
        ...(timezone !== undefined && { timezone }),
        ...(dateFormat !== undefined && { dateFormat }),
        ...(locale !== undefined && { locale }),
      },
    })

    return NextResponse.json({ success: true, data: prefs })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}