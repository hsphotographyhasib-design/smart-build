import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()

    // স্ট্যাটাস গণনা
    const [
      pendingCount,
      approvedCount,
      rejectedCount,
      draftCount,
      paidCount,
      overdueCount,
    ] = await Promise.all([
      db.invoice.count({ where: { status: { in: ['pending_review', 'under_review', 'pending_approval'] } } }),
      db.invoice.count({ where: { status: 'approved' } }),
      db.invoice.count({ where: { status: 'rejected' } }),
      db.invoice.count({ where: { status: 'draft' } }),
      db.invoice.count({ where: { paymentStatus: 'paid' } }),
      db.invoice.count({ where: { paymentStatus: 'overdue' } }),
    ])

    // মূল্য সমষ্টি
    const [totalInvoiceValue, outstandingAmount, totalRetentionHeld, totalRetentionReleased] =
      await Promise.all([
        db.invoice.aggregate({ _sum: { total: true }, where: { status: { not: 'cancelled' } } }),
        db.invoice.aggregate({ _sum: { outstandingAmount: true }, where: { status: { not: 'cancelled' }, outstandingAmount: { gt: 0 } } }),
        db.invoice.aggregate({ _sum: { retentionAmount: true }, where: { retentionAmount: { gt: 0 } } }),
        db.invoice.aggregate({ _sum: { retentionReleased: true }, where: { retentionReleased: { gt: 0 } } }),
      ])

    // গড় অনুমোদন সময়
    const approvedInvoices = await db.invoice.findMany({
      where: { status: 'approved', submittedAt: { not: null }, approvedAt: { not: null } },
      select: { submittedAt: true, approvedAt: true },
    })
    let avgApprovalTime = 0
    if (approvedInvoices.length > 0) {
      const totalDays = approvedInvoices.reduce((sum, inv) => {
        const diff = (inv.approvedAt!.getTime() - inv.submittedAt!.getTime()) / (1000 * 60 * 60 * 24)
        return sum + diff
      }, 0)
      avgApprovalTime = Math.round((totalDays / approvedInvoices.length) * 100) / 100
    }

    // মাস অনুযায়ী ইনভয়েসের পরিমাণ (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const invoicesByMonth = await db.invoice.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: 'cancelled' } },
      select: { createdAt: true, total: true },
    })
    const volumeByMonth: Record<string, { count: number; total: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      volumeByMonth[key] = { count: 0, total: 0 }
    }
    for (const inv of invoicesByMonth) {
      const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (volumeByMonth[key]) {
        volumeByMonth[key].count++
        volumeByMonth[key].total += inv.total
      }
    }

    // মোট ইনভয়েস মূল্য অনুযায়ী শীর্ষ ৫ ভেন্ডর
    const topVendors = await db.invoice.groupBy({
      by: ['vendorId', 'vendorName'],
      where: { vendorId: { not: null }, status: { not: 'cancelled' } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    })

    // ইনভয়েস বয়স
    const unpaidInvoices = await db.invoice.findMany({
      where: { paymentStatus: { in: ['unpaid', 'partial', 'overdue'] }, status: { not: 'cancelled' }, dueDate: { not: null } },
      select: { dueDate: true, outstandingAmount: true },
    })
    const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
    for (const inv of unpaidInvoices) {
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - inv.dueDate!.getTime()) / (1000 * 60 * 60 * 24)))
      if (daysOverdue <= 30) aging['0-30'] += inv.outstandingAmount
      else if (daysOverdue <= 60) aging['31-60'] += inv.outstandingAmount
      else if (daysOverdue <= 90) aging['61-90'] += inv.outstandingAmount
      else aging['90+'] += inv.outstandingAmount
    }

    return NextResponse.json({
      success: true,
      data: {
        pendingCount,
        approvedCount,
        rejectedCount,
        draftCount,
        paidCount,
        overdueCount,
        totalInvoiceValue: totalInvoiceValue._sum.total || 0,
        outstandingAmount: outstandingAmount._sum.outstandingAmount || 0,
        totalRetentionHeld: totalRetentionHeld._sum.retentionAmount || 0,
        totalRetentionReleased: totalRetentionReleased._sum.retentionReleased || 0,
        avgApprovalTime,
        volumeByMonth,
        topVendors: topVendors.map(v => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          totalValue: v._sum.total || 0,
          invoiceCount: v._count,
        })),
        invoiceAging: aging,
      },
    })
  } catch (error) {
    console.error('Invoicing dashboard error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}