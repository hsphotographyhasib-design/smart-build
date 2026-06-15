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

    const item = await db.customer.findUnique({
      where: { id },
      include: { _count: { select: { salesInvoices: true } } },
    })
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: { ...item, invoiceCount: item._count.salesInvoices } })
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

    const existing = await db.customer.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const updated = await db.customer.update({
      where: { id },
      data: {
        name: body.name ?? undefined,
        email: body.email !== undefined ? body.email : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        address: body.address !== undefined ? body.address : undefined,
        gstNo: body.gstNo !== undefined ? body.gstNo : undefined,
        balance: body.balance !== undefined ? body.balance : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Customer',
      entityId: id,
      oldValues: { name: existing.name },
      newValues: { name: updated.name },
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

    const existing = await db.customer.findUnique({
      where: { id },
      include: { _count: { select: { salesInvoices: true } } },
    })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (existing._count.salesInvoices > 0) {
      return NextResponse.json({ success: false, error: 'Cannot delete with existing invoices' }, { status: 400 })
    }

    await db.customer.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'Customer',
      entityId: id,
      oldValues: { name: existing.name },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}