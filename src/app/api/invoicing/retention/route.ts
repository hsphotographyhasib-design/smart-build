import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()

    // মোট ধারণ আটকানো এবং মুক্ত করা হয়েছে
    const [totalHeld, totalReleased] = await Promise.all([
      db.invoice.aggregate({
        _sum: { retentionAmount: true },
        where: { retentionAmount: { gt: 0 }, status: { not: 'cancelled' } },
      }),
      db.invoice.aggregate({
        _sum: { retentionReleased: true },
        where: { retentionReleased: { gt: 0 }, status: { not: 'cancelled' } },
      }),
    ])

    // প্রজেক্ট অনুযায়ী ধারণ
    const byProject = await db.invoice.groupBy({
      by: ['projectId'],
      where: { retentionAmount: { gt: 0 }, status: { not: 'cancelled' } },
      _sum: { retentionAmount: true, retentionReleased: true },
      _count: true,
    })
    const projectIds = byProject.map(p => p.projectId)
    const projects = projectIds.length > 0
      ? await db.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, name: true, code: true },
        })
      : []
    const projectMap = new Map(projects.map(p => [p.id, p]))

    // ভেন্ডর অনুযায়ী ধারণ
    const byVendor = await db.invoice.groupBy({
      by: ['vendorId', 'vendorName'],
      where: { retentionAmount: { gt: 0 }, vendorId: { not: null }, status: { not: 'cancelled' } },
      _sum: { retentionAmount: true, retentionReleased: true },
      _count: true,
    })

    // বিলম্বিত ধারণ (retentionDueDate অতিক্রান্ত এবং সম্পূর্ণভাবে মুক্ত নয়)
    const overdueRetention = await db.invoice.findMany({
      where: {
        retentionAmount: { gt: 0 },
        retentionDueDate: { not: null, lt: now },
        status: { not: 'cancelled' },
      },
      select: {
        id: true,
        invoiceNo: true,
        vendorName: true,
        projectId: true,
        retentionAmount: true,
        retentionReleased: true,
        retentionDueDate: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        totalHeld: totalHeld._sum.retentionAmount || 0,
        totalReleased: totalReleased._sum.retentionReleased || 0,
        totalOutstanding: (totalHeld._sum.retentionAmount || 0) - (totalReleased._sum.retentionReleased || 0),
        byProject: byProject.map(p => ({
          projectId: p.projectId,
          project: projectMap.get(p.projectId) || { id: p.projectId, name: 'Unknown', code: '' },
          totalHeld: p._sum.retentionAmount || 0,
          totalReleased: p._sum.retentionReleased || 0,
          outstanding: (p._sum.retentionAmount || 0) - (p._sum.retentionReleased || 0),
          invoiceCount: p._count,
        })),
        byVendor: byVendor.map(v => ({
          vendorId: v.vendorId,
          vendorName: v.vendorName,
          totalHeld: v._sum.retentionAmount || 0,
          totalReleased: v._sum.retentionReleased || 0,
          outstanding: (v._sum.retentionAmount || 0) - (v._sum.retentionReleased || 0),
          invoiceCount: v._count,
        })),
        overdueRetention: overdueRetention.map(inv => ({
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          vendorName: inv.vendorName,
          projectId: inv.projectId,
          totalHeld: inv.retentionAmount,
          released: inv.retentionReleased,
          outstanding: inv.retentionAmount - inv.retentionReleased,
          dueDate: inv.retentionDueDate,
        })),
      },
    })
  } catch (error) {
    console.error('Retention summary error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch retention data' }, { status: 500 })
  }
}