import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

const INR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (projectId) where.projectId = projectId
    if (fromDate || toDate) {
      where.issueDate = {}
      if (fromDate) where.issueDate.gte = new Date(fromDate)
      if (toDate) where.issueDate.lte = new Date(toDate)
    }

    const [items, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: {
          items: true,
          project: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.invoice.count({ where }),
    ])

    return NextResponse.json({ success: true, data: items, total, page, limit })
  } catch (error) {
    console.error('Invoices GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { projectId, clientName, issueDate, dueDate, items, taxPercent, discount, notes } = body

    if (!projectId || !issueDate || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Project, issue date and at least one item are required' }, { status: 400 })
    }

    // Calculate invoice number
    const count = await db.invoice.count()
    const invoiceNo = `INV-${String(count + 1).padStart(4, '0')}`

    // Calculate subtotal and total
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * ((taxPercent || 0) / 100)
    const discountAmount = discount || 0
    const total = subtotal + taxAmount - discountAmount

    const invoiceItems = items.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }))

    const created = await db.invoice.create({
      data: {
        projectId,
        clientId: clientName || null,
        invoiceNo,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        notes: notes || null,
        items: { create: invoiceItems },
      },
      include: { items: true, project: { select: { id: true, name: true, code: true } } },
    })

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Invoice',
      entityId: created.id,
      newValues: { invoiceNo, total },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Invoices POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create invoice' }, { status: 500 })
  }
}