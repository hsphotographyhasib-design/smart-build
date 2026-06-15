import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { customer: { name: { contains: search } } },
      ]
    }

    const items = await db.salesInvoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const data = items.map((si) => ({
      id: si.id,
      invoiceNo: si.invoiceNo,
      customerId: si.customerId,
      customer: si.customer,
      invoiceDate: si.invoiceDate.toISOString(),
      dueDate: si.dueDate?.toISOString() ?? null,
      subtotal: si.subtotal,
      tax: si.tax,
      total: si.total,
      paidAmount: si.paidAmount,
      status: si.status,
      notes: si.notes,
      createdAt: si.createdAt.toISOString(),
      updatedAt: si.updatedAt.toISOString(),
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
    const { customerId, invoiceDate, dueDate, items, taxPercent, notes } = body

    if (!invoiceDate) {
      return NextResponse.json({ success: false, error: 'Invoice date is required' }, { status: 400 })
    }

    // Generate invoice number
    const count = await db.salesInvoice.count()
    const invoiceNo = `SI-${String(count + 1).padStart(4, '0')}`

    // Calculate totals
    let subtotal = 0
    if (Array.isArray(items)) {
      for (const item of items) {
        subtotal += (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
      }
    }
    const taxPercentVal = parseFloat(taxPercent) || 0
    const tax = subtotal * (taxPercentVal / 100)
    const total = subtotal + tax

    const item = await db.salesInvoice.create({
      data: {
        invoiceNo,
        customerId: customerId || null,
        userId: user.id,
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        tax,
        total,
        notes: notes || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'SalesInvoice',
      entityId: item.id,
      newValues: { invoiceNo, total },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create' }, { status: 500 })
  }
}