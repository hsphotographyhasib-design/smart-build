import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const invoices = await db.invoice.findMany({
      where: {
        projectId: id,
        status: { not: 'cancelled' },
      },
      orderBy: { issueDate: 'desc' },
      include: {
        items: true,
        payments: { orderBy: { createdAt: 'desc' } },
      },
    })

    // Summary stats
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
    const totalOutstanding = totalAmount - totalPaid
    const overdueAmount = invoices
      .filter((inv) => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)

    return NextResponse.json({
      success: true,
      data: {
        invoices: JSON.parse(JSON.stringify(invoices)),
        summary: { totalAmount, totalPaid, totalOutstanding, overdueAmount, count: invoices.length },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}
