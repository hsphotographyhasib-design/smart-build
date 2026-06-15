import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { convertCurrency } from '@/lib/regional/regional-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const amount = parseFloat(searchParams.get('amount') ?? '0')

    const currencies = await db.currency.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    })

    const formatted = currencies.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      symbol: c.symbol,
      symbolNative: c.symbolNative,
      decimalDigits: c.decimalDigits,
    }))

    // If conversion params provided, do conversion
    let conversion: Record<string, unknown> | null = null
    if (from && to && amount > 0) {
      const convertedAmount = convertCurrency(amount, from, to)
      const fromCurrency = currencies.find((c) => c.code === from.toUpperCase())
      const toCurrency = currencies.find((c) => c.code === to.toUpperCase())
      conversion = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        amount,
        result: Math.round(convertedAmount * 100) / 100,
        fromCurrency: fromCurrency?.symbolNative ?? from,
        toCurrency: toCurrency?.symbolNative ?? to,
        rate: Math.round((convertedAmount / amount) * 10000) / 10000,
      }
    }

    return NextResponse.json({ success: true, data: { currencies: formatted, conversion } })
  } catch (error) {
    console.error('Get currencies error:', error)
    return NextResponse.json({ error: 'Failed to get currencies' }, { status: 500 })
  }
}
