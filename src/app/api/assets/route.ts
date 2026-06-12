import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status

    const items = await db.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, code, type, category, purchaseDate, purchasePrice, location } = body

    if (!name || !code || !type) {
      return NextResponse.json({ success: false, error: 'Name, code, and type are required' }, { status: 400 })
    }

    const existing = await db.asset.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Asset code already exists' }, { status: 400 })
    }

    const item = await db.asset.create({
      data: {
        name,
        code,
        type,
        category: category || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: parseFloat(purchasePrice) || 0,
        currentValue: parseFloat(purchasePrice) || 0,
        location: location || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Asset',
      entityId: item.id,
      newValues: { name, code, type },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create' }, { status: 500 })
  }
}