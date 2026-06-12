import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth, createAuditLog } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const method = searchParams.get('method')
    const projectId = searchParams.get('projectId')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (status && status !== 'all') where.status = status
    if (method && method !== 'all') where.method = method
    if (projectId) where.projectId = projectId
    if (fromDate || toDate) {
      where.date = {}
      if (fromDate) where.date.gte = new Date(fromDate)
      if (toDate) where.date.lte = new Date(toDate)
    }

    const [items, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          project: { select: { id: true, name: true, code: true } },
          invoice: { select: { id: true, invoiceNo: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
    ])

    return NextResponse.json({ success: true, data: items, total, page, limit })
  } catch (error) {
    console.error('Payments GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { projectId, invoiceId, amount, method, reference, date, notes } = body

    if (!projectId || !amount || !method || !date) {
      return NextResponse.json({ success: false, error: 'Project, amount, method and date are required' }, { status: 400 })
    }

    const count = await db.payment.count()
    const paymentNo = `PAY-${String(count + 1).padStart(4, '0')}`

    const created = await db.payment.create({
      data: {
        projectId,
        invoiceId: invoiceId || null,
        paymentNo,
        amount: parseFloat(amount),
        method,
        reference: reference || null,
        date: new Date(date),
        receivedBy: user.name,
        notes: notes || null,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        invoice: { select: { id: true, invoiceNo: true } },
      },
    })

    // Update invoice paid amount if linked
    if (invoiceId) {
      const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })
      if (invoice) {
        const allPayments = await db.payment.findMany({
          where: { invoiceId, status: 'completed' },
          select: { amount: true },
        })
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0)
        const newStatus = totalPaid >= invoice.total ? 'paid' : totalPaid > 0 ? 'partial' : invoice.status
        await db.invoice.update({
          where: { id: invoiceId },
          data: { paidAmount: totalPaid, status: newStatus },
        })
      }
    }

    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      entity: 'Payment',
      entityId: created.id,
      newValues: { paymentNo, amount: created.amount },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error) {
    console.error('Payments POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to record payment' }, { status: 500 })
  }
}