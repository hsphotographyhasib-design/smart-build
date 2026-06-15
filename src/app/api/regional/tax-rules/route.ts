import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('countryCode')

    const where = countryCode ? { country: { code: countryCode.toUpperCase() } } : {}

    const taxRules = await db.taxRule.findMany({
      where,
      include: {
        country: { select: { code: true, name: true, flagEmoji: true } },
      },
      orderBy: { name: 'asc' },
    })

    const formatted = taxRules.map((t) => ({
      id: t.id,
      name: t.name,
      rate: t.rate,
      appliesTo: t.appliesTo,
      description: t.description,
      country: t.country,
      effectiveDate: t.effectiveDate,
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error('Get tax rules error:', error)
    return NextResponse.json({ error: 'Failed to get tax rules' }, { status: 500 })
  }
}
