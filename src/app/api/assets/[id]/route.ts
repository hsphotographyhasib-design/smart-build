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

    const item = await db.asset.findUnique({
      where: { id },
      include: { issues: true, maintenance: true },
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

    const existing = await db.asset.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const updated = await db.asset.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        type: body.type ?? undefined,
        category: body.category !== undefined ? body.category : undefined,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        purchasePrice: body.purchasePrice !== undefined ? parseFloat(body.purchasePrice) : undefined,
        currentValue: body.currentValue !== undefined ? parseFloat(body.currentValue) : undefined,
        status: body.status ?? undefined,
        location: body.location !== undefined ? body.location : undefined,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Asset',
      entityId: id,
      oldValues: { name: existing.name, status: existing.status },
      newValues: { name: updated.name, status: updated.status },
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

    const existing = await db.asset.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await db.asset.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'Asset',
      entityId: id,
      oldValues: { name: existing.name, code: existing.code },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}