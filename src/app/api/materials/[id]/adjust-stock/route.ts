import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { quantity, type, unitPrice, reference, notes, projectId } = body

    if (quantity === undefined || quantity === null || quantity === 0) {
      return NextResponse.json({ success: false, error: 'Quantity is required and must be non-zero' }, { status: 400 })
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Type must be in, out, or adjustment' }, { status: 400 })
    }

    const material = await db.material.findUnique({ where: { id } })
    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 })
    }

    // Calculate new stock
    let newStock = material.currentStock
    if (type === 'in' || type === 'adjustment') {
      newStock += Math.abs(quantity)
    } else {
      newStock -= Math.abs(quantity)
      if (newStock < 0) {
        return NextResponse.json({ success: false, error: 'Insufficient stock for this adjustment' }, { status: 400 })
      }
    }

    // Create stock movement and update material in transaction
    const result = await db.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          materialId: id,
          projectId: projectId || null,
          type,
          quantity: type === 'out' ? -Math.abs(quantity) : Math.abs(quantity),
          unitPrice: unitPrice || null,
          reference: reference || null,
          notes: notes || null,
          date: new Date(),
        },
      })

      await tx.material.update({
        where: { id },
        data: { currentStock: newStock },
      })

      return movement
    })

    await createAuditLog({
      userId: user.id,
      action: 'adjust_stock',
      entity: 'Material',
      entityId: id,
      oldValues: { currentStock: material.currentStock },
      newValues: { currentStock: newStock, type, quantity },
    })

    return NextResponse.json({
      success: true,
      data: {
        movementId: result.id,
        materialId: id,
        previousStock: material.currentStock,
        newStock,
        adjustment: type === 'out' ? -Math.abs(quantity) : Math.abs(quantity),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to adjust stock' }, { status: 500 })
  }
}
