import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()

    // ── KPI counts ──
    const [
      activeTenders,
      openInvitations,
      pendingSubmissions,
      submittedBids,
      awardedBids,
      expiredBids,
      totalTenderValue,
      totalInvitations,
      totalVendors,
      pendingApprovals,
    ] = await Promise.all([
      db.tenderBidPackage.count({ where: { status: { in: ['draft', 'published', 'under_evaluation'] } } }),
      db.tenderInvitation.count({ where: { status: { in: ['sent', 'opened', 'accepted'] } } }),
      db.tenderBid.count({ where: { status: 'draft' } }),
      db.tenderBid.count({ where: { status: 'submitted' } }),
      db.tenderBidPackage.count({ where: { status: 'awarded' } }),
      db.tenderBidPackage.count({
        where: { status: { in: ['published', 'under_evaluation'] }, tenderClosingDate: { lt: now } },
      }),
      db.tenderBidPackage.aggregate({
        _sum: { estimatedBudget: true },
        where: { status: { in: ['draft', 'published', 'under_evaluation', 'awarded'] } },
      }),
      db.tenderInvitation.count({ where: { status: { not: 'declined' } } }),
      db.tenderVendor.count({ where: { isActive: true } }),
      db.tenderAward.count({ where: { status: 'recommended' } }),
    ])

    const vendorParticipationRate = totalVendors > 0
      ? Math.round((totalInvitations / totalVendors) * 100)
      : 0

    // ── Bid savings ──
    const awardedPackages = await db.tenderAward.findMany({
      where: { status: { in: ['approved', 'issued', 'accepted'] } },
      include: { package: { select: { estimatedBudget: true } } },
    })
    let totalEstimated = 0
    let totalAwarded = 0
    for (const aw of awardedPackages) {
      totalEstimated += aw.package.estimatedBudget
      totalAwarded += aw.awardAmount
    }
    const bidSavings = totalEstimated - totalAwarded

    // ── Upcoming deadlines ──
    const upcomingDeadlines = await db.tenderBidPackage.findMany({
      where: { status: 'published', tenderClosingDate: { gte: now } },
      select: {
        id: true, packageNo: true, name: true, tenderClosingDate: true, bidDueDate: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { tenderClosingDate: 'asc' },
      take: 5,
    })

    // ── Tender pipeline (by status) ──
    const pipelineRaw = await db.tenderBidPackage.groupBy({
      by: ['status'],
      _count: true,
    })
    const statusOrder = ['draft', 'published', 'under_evaluation', 'awarded', 'cancelled', 'closed']
    const pipeline = statusOrder.map((s) => ({
      status: s,
      count: pipelineRaw.find((p) => p.status === s)?._count || 0,
    }))

    // ── Recent tenders ──
    const recentTenders = await db.tenderBidPackage.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true, packageNo: true, name: true, status: true, estimatedBudget: true, createdAt: true,
        project: { select: { id: true, name: true, code: true } },
        category: { select: { name: true } },
        _count: { select: { invitations: true, bids: true } },
      },
    })

    // ── Recent activity timeline (audit-style) ──
    const recentAwards = await db.tenderAward.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, awardAmount: true, status: true, createdAt: true, vendorId: true,
        package: { select: { packageNo: true, name: true } },
        vendor: { select: { companyName: true } },
      },
    })
    const recentBids2 = await db.tenderBid.findMany({
      where: { status: 'submitted' },
      orderBy: { submittedAt: 'desc' },
      take: 3,
      select: { id: true, totalAmount: true, submittedAt: true,
        vendor: { select: { companyName: true } },
        package: { select: { packageNo: true, name: true } },
      },
    })
    const recentPublished = await db.tenderBidPackage.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, packageNo: true, name: true, createdAt: true,
        project: { select: { name: true } },
        _count: { select: { invitations: true } },
      },
    })

    // Merge into a unified activity feed
    const activities: { id: string; text: string; time: string; color: string }[] = []
    for (const a of recentAwards) {
      activities.push({
        id: a.id,
        text: `Award recommended to ${a.vendor.companyName} — ${a.package.name}`,
        time: a.createdAt.toISOString(),
        color: '#1D9E75',
      })
    }
    for (const b of recentBids2) {
      activities.push({
        id: b.id,
        text: `Bid submitted by ${b.vendor.companyName} — ${b.package.name}`,
        time: (b.submittedAt || b.id).toString().length > 10 ? b.submittedAt!.toISOString() : new Date().toISOString(),
        color: '#378ADD',
      })
    }
    for (const p of recentPublished) {
      activities.push({
        id: p.id,
        text: `Tender published — ${p.packageNo}: ${p.name} (${p._count.invitations} vendors invited)`,
        time: p.createdAt.toISOString(),
        color: '#BA7517',
      })
    }
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // ── Category breakdown (work categories) ──
    const categoryBreakdown = await db.tenderCategory.findMany({
      where: { isActive: true },
      select: {
        name: true,
        _count: { select: { bidPackages: true } },
      },
      orderBy: { sortOrder: 'asc' },
    })
    const totalPackages = categoryBreakdown.reduce((s, c) => s + c._count.bidPackages, 0) || 1

    const data = {
      // KPIs
      activeTenders,
      totalTenderValue: totalTenderValue._sum.estimatedBudget || 0,
      bidSavings,
      openInvitations,
      submittedBids,
      pendingApprovals,
      awardedBids,
      // Trends (percentage changes — since no historical data, return 0)
      activeTendersChange: 0,
      totalTenderValueChange: 0,
      bidSavingsChange: 0,
      openInvitationsChange: 0,
      submittedBidsChange: 0,
      pendingApprovalsChange: 0,
      awardedBidsChange: 0,
      // Derived
      vendorParticipationRate,
      vendorParticipationChange: 0,
      // Pipeline
      pipeline,
      // Lists
      upcomingDeadlines: upcomingDeadlines.map((p) => ({
        ...p,
        daysRemaining: Math.max(0, Math.ceil((new Date(p.tenderClosingDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
      })),
      recentTenders: recentTenders.map((t) => ({
        ...t,
        submittedCount: t._count.bids,
        invitedCount: t._count.invitations,
      })),
      recentActivity: activities.slice(0, 6),
      // Category breakdown
      categoryBreakdown: categoryBreakdown.map((c) => ({
        name: c.name,
        count: c._count.bidPackages,
        percentage: Math.round((c._count.bidPackages / totalPackages) * 100),
      })),
      // Summary counts
      totalVendors,
      totalInvitations,
      expiredBids,
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(data)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load tender dashboard'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
