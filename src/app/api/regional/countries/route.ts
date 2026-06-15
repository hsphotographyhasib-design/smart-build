import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const countries = await db.country.findMany({
      where: { isActive: true },
      include: {
        currencies: {
          include: { currency: true },
          where: { isDefault: true },
        },
        languages: {
          include: { language: true },
          where: { isDefault: true },
        },
        taxRules: {
          where: { isActive: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const formatted = countries.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      callingCode: c.callingCode,
      flagEmoji: c.flagEmoji,
      timezone: c.timezone,
      utcOffset: c.utcOffset,
      dateFormat: c.dateFormat,
      currency: c.currencies[0]?.currency ?? null,
      language: c.languages[0]?.language ?? null,
      taxRules: c.taxRules.map((t) => ({
        id: t.id,
        name: t.name,
        rate: t.rate,
        appliesTo: t.appliesTo,
      })),
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error('Get countries error:', error)
    return NextResponse.json({ error: 'Failed to get countries' }, { status: 500 })
  }
}
