import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }
    if (category) where.category = category

    const materials = await db.material.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    const data = materials.map((m) => {
      let stockStatus = 'in_stock'
      if (m.currentStock <= 0) stockStatus = 'out_of_stock'
      else if (m.currentStock <= m.minStock) stockStatus = 'low_stock'

      return {
        id: m.id,
        name: m.name,
        code: m.code,
        unit: m.unit,
        category: m.category,
        description: m.description,
        currentStock: m.currentStock,
        minStock: m.minStock,
        unitPrice: m.unitPrice,
        stockStatus,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, code, unit, category, description, currentStock, minStock, unitPrice } = body

    if (!name || !code || !unit) {
      return NextResponse.json({ success: false, error: 'Name, code, and unit are required' }, { status: 400 })
    }

    const existing = await db.material.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Material code already exists' }, { status: 400 })
    }

    const material = await db.material.create({
      data: {
        name,
        code,
        unit,
        category: category || null,
        description: description || null,
        currentStock: currentStock || 0,
        minStock: minStock || 0,
        unitPrice: unitPrice || 0,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Material',
      entityId: material.id,
      newValues: { name, code },
    })

    return NextResponse.json({ success: true, data: material })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create material' }, { status: 500 })
  }
}
