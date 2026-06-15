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

    const supplier = await db.supplier.findUnique({
      where: { id },
      include: {
        _count: { select: { purchaseOrders: true } },
      },
    })

    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: supplier.id,
        name: supplier.name,
        code: supplier.code,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        gstNo: supplier.gstNo,
        balance: supplier.balance,
        isActive: supplier.isActive,
        orderCount: supplier._count.purchaseOrders,
        createdAt: supplier.createdAt.toISOString(),
        updatedAt: supplier.updatedAt.toISOString(),
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
    const { name, code, contact, email, phone, address, gstNo, balance, isActive } = body

    const existing = await db.supplier.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }

    if (code && code !== existing.code) {
      const codeExists = await db.supplier.findUnique({ where: { code } })
      if (codeExists) {
        return NextResponse.json({ success: false, error: 'Supplier code already exists' }, { status: 400 })
      }
    }

    const updated = await db.supplier.update({
      where: { id },
      data: {
        name: name || undefined,
        code: code || undefined,
        contact: contact !== undefined ? contact : undefined,
        email: email !== undefined ? email : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        gstNo: gstNo !== undefined ? gstNo : undefined,
        balance: balance !== undefined ? balance : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Supplier',
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

    const existing = await db.supplier.findUnique({
      where: { id },
      include: { _count: { select: { purchaseOrders: true } } },
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 })
    }

    if (existing._count.purchaseOrders > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete supplier with existing purchase orders' }, { status: 400 })
    }

    await db.supplier.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'Supplier',
      entityId: id,
      oldValues: { name: existing.name, code: existing.code },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}
