import { NextRequest, NextResponse } from 'next/server'
import { resolveUserCountry, getFullRegionalConfig } from '@/lib/regional/regional-config'

export async function GET(request: NextRequest) {
  try {
    // স্পষ্ট দেশ ওভাররাইড যাচাই করা হচ্ছে (যেমন ?country=SG)
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

    // ক্লায়েন্টের IP পাওয়া হচ্ছে
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      request.headers.get('cf-connecting-ip') ??
      null

    // ব্রাউজার লোকেল পাওয়া হচ্ছে
    const acceptLanguage = request.headers.get('accept-language') ?? ''
    const browserLocale = acceptLanguage.split(',')[0]?.trim() ?? null

    // হেডার থেকে টাইমজোন পাওয়া হচ্ছে (ফ্রন্টএন্ডের মাধ্যমে JS দ্বারা সেট করা)
    const timezone = request.headers.get('x-timezone') ?? null

    // অগ্রাধিকার চেইন ব্যবহার করে দেশ নির্ধারণ করা হচ্ছে
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
    // ব্রুনাইতে ফলব্যাক করা হচ্ছে
    return NextResponse.json({
      success: true,
      data: getFullRegionalConfig('BN'),
      detected: { error: 'Detection failed, using defaults' },
    })
  }
}
