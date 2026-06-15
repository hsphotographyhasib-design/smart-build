import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brand: { contains: search } },
      ]
    }

    const items = await db.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const data = items.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      unit: p.unit,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      minStock: p.minStock,
      isActive: p.isActive,
      category: p.category,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))

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
    const { categoryId, name, sku, brand, unit, costPrice, sellingPrice, currentStock, minStock } = body

    if (!categoryId || !name || !sku) {
      return NextResponse.json({ success: false, error: 'Category, name, and SKU are required' }, { status: 400 })
    }

    const existing = await db.product.findUnique({ where: { sku } })
    if (existing) {
      return NextResponse.json({ success: false, error: 'SKU already exists' }, { status: 400 })
    }

    const item = await db.product.create({
      data: {
        categoryId,
        name,
        sku,
        brand: brand || null,
        unit: unit || 'pcs',
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        currentStock: parseFloat(currentStock) || 0,
        minStock: parseFloat(minStock) || 0,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Product',
      entityId: item.id,
      newValues: { name, sku },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create' }, { status: 500 })
  }
}