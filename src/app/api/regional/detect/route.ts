import { NextRequest, NextResponse } from 'next/server'
import { resolveUserCountry, getFullRegionalConfig } from '@/lib/regional/regional-config'

export async function GET(request: NextRequest) {
  try {
    // Check for explicit country override (e.g. ?country=SG)
    const urlCountry = request.nextUrl.searchParams.get('country')
    if (urlCountry && getFullRegionalConfig(urlCountry.toUpperCase())) {
      const config = getFullRegionalConfig(urlCountry.toUpperCase())
      return NextResponse.json({
        success: true,
        data: config,
        detected: {
          source: 'user_selected',
          resolvedCountry: urlCountry.toUpperCase(),
        },
      })
    }

    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      request.headers.get('cf-connecting-ip') ??
      null

    // Get browser locale
    const acceptLanguage = request.headers.get('accept-language') ?? ''
    const browserLocale = acceptLanguage.split(',')[0]?.trim() ?? null

    // Get timezone from header (set by frontend via JS)
    const timezone = request.headers.get('x-timezone') ?? null

    // Resolve country using priority chain
    const countryCode = resolveUserCountry({
      userPreference: null, // Not logged in context here
      browserLocale,
      timezone,
      ip,
    })

    const config = getFullRegionalConfig(countryCode)

    return NextResponse.json({
      success: true,
      data: config,
      detected: {
        ip: ip ? `${ip.substring(0, 8)}...` : null,
        browserLocale,
        timezone,
        resolvedCountry: countryCode,
      },
    })
  } catch (error) {
    console.error('Regional detect error:', error)
    // Fallback to Brunei
    return NextResponse.json({
      success: true,
      data: getFullRegionalConfig('BN'),
      detected: { error: 'Detection failed, using defaults' },
    })
  }
}
