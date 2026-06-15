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

    const item = await db.product.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: item })
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

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const updated = await db.product.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        brand: body.brand !== undefined ? body.brand : undefined,
        unit: body.unit ?? undefined,
        costPrice: body.costPrice !== undefined ? parseFloat(body.costPrice) : undefined,
        sellingPrice: body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : undefined,
        currentStock: body.currentStock !== undefined ? parseFloat(body.currentStock) : undefined,
        minStock: body.minStock !== undefined ? parseFloat(body.minStock) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Product',
      entityId: id,
      oldValues: { name: existing.name, sku: existing.sku },
      newValues: { name: updated.name, sku: updated.sku },
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

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await db.product.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'Product',
      entityId: id,
      oldValues: { name: existing.name, sku: existing.sku },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}