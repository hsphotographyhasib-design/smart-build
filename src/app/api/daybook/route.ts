import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}
    if (date) {
      const d = new Date(date)
      where.date = { gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()), lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) }
    }
    if (fromDate || toDate) {
      if (!where.date) where.date = {}
      if (fromDate) where.date.gte = new Date(fromDate)
      if (toDate) where.date.lte = new Date(toDate)
    }
    if (type && type !== 'all') where.type = type
    if (category) where.category = category

    const [items, total] = await Promise.all([
      db.dayBookEntry.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dayBookEntry.count({ where }),
    ])

    return NextResponse.json({ success: true, data: items, total, page, limit })
  } catch (error) {
    console.error('Daybook GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch daybook entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { date, description, category, type, amount, reference } = body

    if (!date || !description || !category || !type || !amount) {
      return NextResponse.json({ success: false, error: 'Date, description, category, type and amount are required' }, { status: 400 })
    }

    const created = await db.dayBookEntry.create({
      data: {
        date: new Date(date),
        description,
        category,
        type,
        amount: parseFloat(amount),
        reference: reference || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'DayBookEntry',
      entityId: created.id,
      newValues: { type, amount: created.amount },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Daybook POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create daybook entry' }, { status: 500 })
  }
}