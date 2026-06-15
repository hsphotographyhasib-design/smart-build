import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (customerId) where.customerId = customerId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { notes: { contains: search } },
      ]
    }

    const [invoices, total] = await Promise.all([
      db.maintenanceInvoice.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true, address: true } },
          ticket: { select: { id: true, ticketNo: true, subject: true } },
          workOrder: { select: { id: true, workOrderNo: true } },
          issuedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.maintenanceInvoice.count({ where }),
    ])

    const data = invoices.map((inv) => JSON.parse(JSON.stringify(inv)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invoices'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      ticketId, workOrderId, customerId,
      labourCost, materialCost, transportCost,
      serviceCharges, tax, discount, notes, status,
    } = body

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 })
    }

    // Auto-generate invoice number
    const year = new Date().getFullYear()
    const prefix = 'MIV'
    const count = await db.maintenanceInvoice.count({
      where: { invoiceNo: { startsWith: `${prefix}-${year}` } },
    })
    const invoiceNo = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`

    const subtotal = (labourCost || 0) + (materialCost || 0) + (transportCost || 0) + (serviceCharges || 0)
    const total = subtotal + (tax || 0) - (discount || 0)

    const invoice = await db.maintenanceInvoice.create({
      data: {
        invoiceNo,
        ticketId: ticketId || null,
        workOrderId: workOrderId || null,
        customerId,
        labourCost: labourCost || 0,
        materialCost: materialCost || 0,
        transportCost: transportCost || 0,
        serviceCharges: serviceCharges || 0,
        tax: tax || 0,
        discount: discount || 0,
        total,
        status: status || 'draft',
        notes: notes || null,
        issuedById: authUser.id,
      },
      include: {
        customer: { select: { name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'MaintenanceInvoice',
      entityId: invoice.id,
      newValues: { invoiceNo, total },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(invoice)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create invoice'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}