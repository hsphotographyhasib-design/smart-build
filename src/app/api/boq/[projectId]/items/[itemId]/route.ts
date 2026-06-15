import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ projectId: string; itemId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { projectId, itemId } = await params
    const body = await request.json()
    const { description, unit, quantity, unitRate } = body

    const boq = await db.bOQ.findUnique({ where: { projectId } })
    if (!boq) {
      return NextResponse.json({ success: false, error: 'BOQ not found for this project' }, { status: 404 })
    }

    const existing = await db.bOQItem.findUnique({ where: { id: itemId, boqId: boq.id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    const newQuantity = quantity !== undefined ? quantity : existing.quantity
    const newRate = unitRate !== undefined ? unitRate : existing.unitRate
    const amount = newQuantity * newRate

    const updated = await db.bOQItem.update({
      where: { id: itemId },
      data: {
        description: description || existing.description,
        unit: unit || existing.unit,
        quantity: newQuantity,
        unitRate: newRate,
        amount,
      },
    })

    // BOQ মোট পুনরায় হিসাব করা হচ্ছে
    const allItems = await db.bOQItem.findMany({ where: { boqId: boq.id } })
    const total = allItems.reduce((sum, item) => sum + item.amount, 0)
    await db.bOQ.update({ where: { id: boq.id }, data: { total } })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'BOQItem',
      entityId: itemId,
      oldValues: { amount: existing.amount },
      newValues: { amount },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('BOQ Item PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update BOQ item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string; itemId: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { projectId, itemId } = await params

    const boq = await db.bOQ.findUnique({ where: { projectId } })
    if (!boq) {
      return NextResponse.json({ success: false, error: 'BOQ not found for this project' }, { status: 404 })
    }

    const existing = await db.bOQItem.findUnique({ where: { id: itemId, boqId: boq.id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'BOQ item not found' }, { status: 404 })
    }

    await db.bOQItem.delete({ where: { id: itemId } })

    // BOQ মোট পুনরায় হিসাব করা হচ্ছে
    const allItems = await db.bOQItem.findMany({ where: { boqId: boq.id } })
    const total = allItems.reduce((sum, item) => sum + item.amount, 0)
    await db.bOQ.update({ where: { id: boq.id }, data: { total } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'BOQItem',
      entityId: itemId,
      oldValues: { description: existing.description },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: { id: itemId } })
  } catch (error) {
    console.error('BOQ Item DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete BOQ item' }, { status: 500 })
  }
}