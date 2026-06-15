import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'tender_summary'
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const dateFilter: Record<string, unknown> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const projectFilter: Record<string, unknown> = {}
    if (projectId) projectFilter.projectId = projectId

    let data: unknown = null

    switch (type) {
      case 'tender_summary': {
        const [totalPackages, byStatus, byMonth] = await Promise.all([
          db.tenderBidPackage.count({
            where: { ...projectFilter, ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}) },
          }),
          db.tenderBidPackage.groupBy({
            by: ['status'],
            _count: { id: true },
            ...(Object.keys(projectFilter).length > 0 ? { where: projectFilter } : {}),
          }),
          db.tenderBidPackage.groupBy({
            by: ['status'],
            _sum: { estimatedBudget: true },
            ...(Object.keys(projectFilter).length > 0 ? { where: projectFilter } : {}),
          }),
        ])

        const bidsCount = await db.tenderBid.count()
        const awardsCount = await db.tenderAward.count({
          where: { status: { in: ['approved', 'issued', 'accepted'] } },
        })
        const totalAwardedAmount = await db.tenderAward.aggregate({
          _sum: { awardAmount: true },
          where: { status: { in: ['approved', 'issued', 'accepted'] } },
        })

        data = {
          totalPackages,
          totalBids: bidsCount,
          totalAwards: awardsCount,
          totalAwardedAmount: totalAwardedAmount._sum.awardAmount || 0,
          packagesByStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
          budgetByStatus: byMonth.map((s) => ({ status: s.status, budget: s._sum.estimatedBudget || 0 })),
        }
        break
      }

      case 'bid_comparison': {
        const packageId = searchParams.get('packageId')
        if (!packageId) {
          return NextResponse.json({ success: false, error: 'packageId is required for bid_comparison report' }, { status: 400 })
        }

        const bids = await db.tenderBid.findMany({
          where: { packageId, status: 'submitted' },
          include: {
            vendor: { select: { id: true, companyName: true } },
            itemPrices: { include: { item: true } },
            evaluation: true,
          },
          orderBy: { totalAmount: 'asc' },
        })

        const pkg = await db.tenderBidPackage.findUnique({
          where: { id: packageId },
          select: { estimatedBudget: true, currency: true, name: true, packageNo: true },
        })

        const lowestBid = bids.length > 0 ? bids[0].totalAmount : 0
        const highestBid = bids.length > 0 ? bids[bids.length - 1].totalAmount : 0
        const avgBid = bids.length > 0
          ? Math.round(bids.reduce((sum, b) => sum + b.totalAmount, 0) / bids.length)
          : 0

        data = {
          package: pkg,
          bidCount: bids.length,
          lowestBid,
          highestBid,
          averageBid: avgBid,
          budgetপার্থক্য: pkg ? (pkg.estimatedBudget - avgBid) : 0,
          bids: bids.map((b) => ({
            id: b.id,
            vendorName: b.vendor.companyName,
            totalAmount: b.totalAmount,
            deviationFromAvg: avgBid > 0 ? Math.round(((b.totalAmount - avgBid) / avgBid) * 100) : 0,
            evaluation: b.evaluation
              ? { technicalScore: b.evaluation.technicalScore, commercialScore: b.evaluation.commercialScore, combinedScore: b.evaluation.combinedScore, ranking: b.evaluation.ranking }
              : null,
          })),
        }
        break
      }

      case 'vendor_participation': {
        const vendors = await db.tenderVendor.findMany({
          where: { isActive: true },
          select: {
            id: true, companyName: true, isApproved: true, totalBids: true, totalAwarded: true, successRate: true, rating: true,
            _count: { select: { invitations: true, bids: true, awards: true } },
          },
          orderBy: { totalBids: 'desc' },
          take: 50,
        })

        const totalInvitations = await db.tenderInvitation.count()
        const acceptedInvitations = await db.tenderInvitation.count({ where: { status: 'accepted' } })
        const declinedInvitations = await db.tenderInvitation.count({ where: { status: 'declined' } })

        data = {
          totalVendors: vendors.length,
          totalInvitations,
          acceptedInvitations,
          declinedInvitations,
          acceptanceRate: totalInvitations > 0 ? Math.round((acceptedInvitations / totalInvitations) * 100) : 0,
          vendors,
        }
        break
      }

      case 'award_report': {
        const awards = await db.tenderAward.findMany({
          include: {
            package: {
              include: {
                project: { select: { id: true, name: true, code: true } },
              },
            },
            bid: { include: { vendor: { select: { id: true, companyName: true } } } },
            vendor: { select: { id: true, companyName: true } },
            approvedBy: { select: { id: true, name: true } },
          },
          orderBy: { awardDate: 'desc' },
          ...(Object.keys(dateFilter).length > 0 ? {
            where: { awardDate: dateFilter },
          } : {}),
        })

        const totalAwardValue = awards.reduce((sum, a) => sum + a.awardAmount, 0)
        const approvedAwards = awards.filter((a) => a.status === 'approved')

        data = {
          totalAwards: awards.length,
          approvedAwards: approvedAwards.length,
          totalAwardValue,
          averageAwardValue: awards.length > 0 ? Math.round(totalAwardValue / awards.length) : 0,
          awards,
        }
        break
      }

      case 'cost_saving': {
        const awardsWithBudget = await db.tenderAward.findMany({
          where: { status: { in: ['approved', 'issued', 'accepted'] } },
          include: {
            package: { select: { estimatedBudget: true, name: true, packageNo: true } },
            bid: { select: { totalAmount: true } },
            vendor: { select: { companyName: true } },
          },
        })

        let totalBudget = 0
        let totalSpent = 0
        const savings = awardsWithBudget.map((a) => {
          const budget = a.package.estimatedBudget
          const spent = a.awardAmount
          totalBudget += budget
          totalSpent += spent
          return {
            packageNo: a.package.packageNo,
            packageName: a.package.name,
            vendorName: a.vendor.companyName,
            estimatedBudget: budget,
            awardAmount: spent,
            savings: budget - spent,
            savingsPercent: budget > 0 ? Math.round(((budget - spent) / budget) * 100) : 0,
          }
        })

        data = {
          totalBudget,
          totalSpent,
          totalSavings: totalBudget - totalSpent,
          savingsPercent: totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0,
          details: savings,
        }
        break
      }

      case 'pipeline': {
        const [draft, published, underEvaluation, awarded, cancelled] = await Promise.all([
          db.tenderBidPackage.count({ where: { status: 'draft', ...projectFilter } }),
          db.tenderBidPackage.count({ where: { status: 'published', ...projectFilter } }),
          db.tenderBidPackage.count({ where: { status: 'under_evaluation', ...projectFilter } }),
          db.tenderBidPackage.count({ where: { status: 'awarded', ...projectFilter } }),
          db.tenderBidPackage.count({ where: { status: 'cancelled', ...projectFilter } }),
        ])

        const totalBudgetPipeline = await db.tenderBidPackage.aggregate({
          _sum: { estimatedBudget: true },
          where: { status: { in: ['published', 'under_evaluation'] }, ...projectFilter },
        })

        const upcomingClosing = await db.tenderBidPackage.findMany({
          where: {
            status: 'published',
            tenderClosingDate: { gte: new Date() },
            ...projectFilter,
          },
          select: { id: true, packageNo: true, name: true, tenderClosingDate: true, estimatedBudget: true },
          orderBy: { tenderClosingDate: 'asc' },
          take: 10,
        })

        data = {
          pipeline: { draft, published, underEvaluation, awarded, cancelled, total: draft + published + underEvaluation + awarded + cancelled },
          activeBudgetPipeline: totalBudgetPipeline._sum.estimatedBudget || 0,
          upcomingClosing,
        }
        break
      }

      case 'vendor_performance': {
        const vendorsWithBids = await db.tenderVendor.findMany({
          where: { isActive: true, totalBids: { gt: 0 } },
          select: {
            id: true, companyName: true, rating: true, totalBids: true, totalAwarded: true, successRate: true,
            awards: {
              include: {
                package: { select: { name: true, packageNo: true, estimatedBudget: true } },
              },
            },
          },
          orderBy: { successRate: 'desc' },
          take: 30,
        })

        data = {
          vendors: vendorsWithBids.map((v) => ({
            id: v.id,
            companyName: v.companyName,
            rating: v.rating,
            totalBids: v.totalBids,
            totalAwarded: v.totalAwarded,
            successRate: v.successRate,
            recentAwards: v.awards.slice(0, 5).map((a) => ({
              packageNo: a.package.packageNo,
              packageName: a.package.name,
              awardAmount: a.awardAmount,
              budget: a.package.estimatedBudget,
            })),
          })),
        }
        break
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown report type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(data)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate report'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}