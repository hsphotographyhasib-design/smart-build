import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const rates = await db.exchangeRate.findMany({
      include: {
        fromCurrency: { select: { code: true, name: true, symbol: true } },
        toCurrency: { select: { code: true, name: true, symbol: true } },
      },
      orderBy: { fetchedAt: 'desc' },
    })

    const formatted = rates.map((r) => ({
      id: r.id,
      from: r.fromCurrency.code,
      to: r.toCurrency.code,
      rate: r.rate,
      source: r.source,
      fetchedAt: r.fetchedAt,
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error) {
    console.error('Get exchange rates error:', error)
    return NextResponse.json({ error: 'Failed to get exchange rates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await db.session.findUnique({ where: { token }, include: { user: true } })
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { fromCurrencyId, toCurrencyId, rate } = body

    if (!fromCurrencyId || !toCurrencyId || rate === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existing = await db.exchangeRate.findUnique({
      where: { fromCurrencyId_toCurrencyId: { fromCurrencyId, toCurrencyId } },
    })

    if (existing) {
      const updated = await db.exchangeRate.update({
        where: { id: existing.id },
        data: { rate, fetchedAt: new Date(), source: 'manual' },
      })
      return NextResponse.json({ success: true, data: updated })
    } else {
      const created = await db.exchangeRate.create({
        data: { fromCurrencyId, toCurrencyId, rate, source: 'manual' },
      })
      return NextResponse.json({ success: true, data: created })
    }
  } catch (error) {
    console.error('Update exchange rates error:', error)
    return NextResponse.json({ error: 'Failed to update exchange rate' }, { status: 500 })
  }
}
