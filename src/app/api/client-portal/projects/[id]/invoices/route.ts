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

    // ক্লায়েন্ট পোর্টাল অ্যাক্সেস নিয়ন্ত্রণ
    if (!['client', 'super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied. Client portal only.' }, { status: 403 })
    }

    const { id } = await params

    // ক্লায়েন্ট ভূমিকার জন্য, প্রজেক্টটি তাদের নিজের কিনা যাচাই করা হচ্ছে
    if (user.role === 'client') {
      const project = await db.project.findUnique({
        where: { id },
        select: { clientId: true },
      })
      if (!project || project.clientId !== user.id) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
    }

    const invoices = await db.invoice.findMany({
      where: {
        projectId: id,
        status: { not: 'cancelled' },
      },
      orderBy: { issueDate: 'desc' },
      include: {
        invoiceItem: true,
        payment: { orderBy: { createdAt: 'desc' } },
      },
    })

    // সারসংক্ষেপ পরিসংখ্যান
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
