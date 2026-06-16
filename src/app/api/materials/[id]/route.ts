import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const material = await db.material.findUnique({
      where: { id },
      include: {
        _count: { select: { stockMovement: true } },
      },
    })

    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 })
    }

    let stockStatus = 'in_stock'
    if (material.currentStock <= 0) stockStatus = 'out_of_stock'
    else if (material.currentStock <= material.minStock) stockStatus = 'low_stock'

    return NextResponse.json({
      success: true,
      data: {
        id: material.id,
        name: material.name,
        code: material.code,
        unit: material.unit,
        category: material.category,
        description: material.description,
        currentStock: material.currentStock,
        minStock: material.minStock,
        unitPrice: material.unitPrice,
        stockStatus,
        movementCount: material._count.stockMovement,
        createdAt: material.createdAt.toISOString(),
        updatedAt: material.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { name, code, unit, category, description, minStock, unitPrice } = body

    const existing = await db.material.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 })
    }

    if (code && code !== existing.code) {
      const codeExists = await db.material.findUnique({ where: { code } })
      if (codeExists) {
        return NextResponse.json({ success: false, error: 'Material code already exists' }, { status: 400 })
      }
    }

    const updated = await db.material.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code || undefined,
        unit: unit || undefined,
        category: category !== undefined ? category : undefined,
        description: description !== undefined ? description : undefined,
        minStock: minStock !== undefined ? minStock : undefined,
        unitPrice: unitPrice !== undefined ? unitPrice : undefined,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Material',
      entityId: id,
      oldValues: { name: existing.name, code: existing.code },
      newValues: { name: updated.name, code: updated.code },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.material.findUnique({
      where: { id },
      include: { _count: { select: { stockMovement: true } } },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 })
    }

    await db.stockMovement.deleteMany({ where: { materialId: id } })
    await db.material.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'Material',
      entityId: id,
      oldValues: { name: existing.name, code: existing.code },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
