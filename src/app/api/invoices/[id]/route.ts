import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        invoiceItem: true,
        project: { select: { id: true, name: true, code: true } },
        payment: { select: { id: true, paymentNo: true, amount: true, status: true, date: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    console.error('Invoice GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { clientName, issueDate, dueDate, items, taxPercent, discount, notes, status } = body

    const existing = await db.invoice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    const subtotal = items ? items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) : existing.subtotal
    const taxAmount = subtotal * ((taxPercent ?? (existing.tax / existing.subtotal) * 100) / 100)
    const discountAmount = discount ?? existing.discount
    const total = subtotal + taxAmount - discountAmount

    // আইটেম প্রদান করা হলে, পুরনো মুছে নতুন তৈরি করা হচ্ছে
    if (items && items.length > 0) {
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } })
      await db.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      })
    }

    const updated = await db.invoice.update({
      where: { id },
      data: {
        clientId: clientName !== undefined ? clientName : existing.clientId,
        issueDate: issueDate ? new Date(issueDate) : existing.issueDate,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existing.dueDate,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        notes: notes !== undefined ? notes : existing.notes,
        status: status || existing.status,
      },
      include: { invoiceItem: true, project: { select: { id: true, name: true, code: true } } },
    })

    await createAuditLog({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Invoice',
      entityId: id,
      oldValues: { total: existing.total },
      newValues: { total: updated.total },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Invoice PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update invoice' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await db.invoice.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 })
    }

    await db.invoice.delete({ where: { id } })

    await createAuditLog({
      userId: user.id,
      action: 'DELETE',
      entity: 'Invoice',
      entityId: id,
      oldValues: { invoiceNo: existing.invoiceNo },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Invoice DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete invoice' }, { status: 500 })
  }
}