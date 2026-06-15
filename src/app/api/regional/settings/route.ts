import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    let settings = await db.regionalSetting.findFirst()
    if (!settings) {
      settings = await db.regionalSetting.create({
        data: {
          defaultLanguage: 'en',
          defaultTimezone: 'Asia/Brunei',
          autoDetect: true,
          pricingBase: 'BND',
          demoPhone: '+673 123 4567',
          demoEmail: 'demo@smartbuild.bn',
        },
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('আঞ্চলিক সেটিংস পাওয়া হচ্ছে error:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })

    const body = await request.json()
    const {
      defaultLanguage, defaultTimezone, autoDetect, pricingBase,
      demoPhone, demoEmail, features, countryId, baseCurrencyId,
    } = body

    let settings = await db.regionalSetting.findFirst()
    if (!settings) {
      settings = await db.regionalSetting.create({
        data: {
          defaultLanguage: defaultLanguage ?? 'en',
          defaultTimezone: defaultTimezone ?? 'Asia/Brunei',
          autoDetect: autoDetect ?? true,
          pricingBase: pricingBase ?? 'BND',
          demoPhone, demoEmail,
          countryId, baseCurrencyId,
          features: features ? JSON.stringify(features) : undefined,
        },
      })
    } else {
      settings = await db.regionalSetting.update({
        where: { id: settings.id },
        data: {
          ...(defaultLanguage !== undefined && { defaultLanguage }),
          ...(defaultTimezone !== undefined && { defaultTimezone }),
          ...(autoDetect !== undefined && { autoDetect }),
          ...(pricingBase !== undefined && { pricingBase }),
          ...(demoPhone !== undefined && { demoPhone }),
          ...(demoEmail !== undefined && { demoEmail }),
          ...(countryId !== undefined && { countryId }),
          ...(baseCurrencyId !== undefined && { baseCurrencyId }),
          ...(features !== undefined && { features: JSON.stringify(features) }),
        },
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Update regional settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
