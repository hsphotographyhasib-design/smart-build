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

    const item = await db.salesInvoice.findUnique({
      where: { id },
      include: { customer: true, user: { select: { id: true, name: true } } },
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

    const existing = await db.salesInvoice.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    const updated = await db.salesInvoice.update({
      where: { id },
      data: {
        customerId: body.customerId !== undefined ? body.customerId : undefined,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : body.dueDate === null ? null : undefined,
        subtotal: body.subtotal !== undefined ? parseFloat(body.subtotal) : undefined,
        tax: body.tax !== undefined ? parseFloat(body.tax) : undefined,
        total: body.total !== undefined ? parseFloat(body.total) : undefined,
        paidAmount: body.paidAmount !== undefined ? parseFloat(body.paidAmount) : undefined,
        status: body.status ?? undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'SalesInvoice',
      entityId: id,
      oldValues: { invoiceNo: existing.invoiceNo, status: existing.status },
      newValues: { invoiceNo: updated.invoiceNo, status: updated.status },
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

    const existing = await db.salesInvoice.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    await db.salesInvoice.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'SalesInvoice',
      entityId: id,
      oldValues: { invoiceNo: existing.invoiceNo },
    })

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete' }, { status: 500 })
  }
}