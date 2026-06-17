import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'complaints'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const customerId = searchParams.get('customerId')

    const dateFilter: Record<string, unknown> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const ticketWhere: Record<string, unknown> = {}
    if (Object.keys(dateFilter).length > 0) ticketWhere.createdAt = dateFilter
    if (customerId) ticketWhere.customerId = customerId

    let data: unknown = {}

    switch (type) {
      case 'complaints': {
        const [byCategory, byPriority, byStatus, byType, monthlyTrend] = await Promise.all([
          db.maintenanceTicket.groupBy({
            by: ['category'],
            where: ticketWhere,
            _count: { id: true },
          }),
          db.maintenanceTicket.groupBy({
            by: ['priority'],
            where: ticketWhere,
            _count: { id: true },
          }),
          db.maintenanceTicket.groupBy({
            by: ['status'],
            where: ticketWhere,
            _count: { id: true },
          }),
          db.maintenanceTicket.groupBy({
            by: ['type'],
            where: ticketWhere,
            _count: { id: true },
          }),
          // মাসিক ট্রেন্ড - সব টিকেট নেওয়া হচ্ছে এবং JS-এ গ্রুপ করা হচ্ছে
          db.maintenanceTicket.findMany({
            where: ticketWhere,
            select: { createdAt: true, id: true },
          }),
        ])

        // মাসিকভাবে গ্রুপ করা হচ্ছে
        const monthlyMap = new Map<string, number>()
        monthlyTrend.forEach((t) => {
          const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1)
        })
        const monthly = Array.from(monthlyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }))

        data = {
          byCategory: byCategory.map((g) => ({ category: g.category, count: g._count.id })),
          byPriority: byPriority.map((g) => ({ priority: g.priority, count: g._count.id })),
          byStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
          byType: byType.map((g) => ({ type: g.type, count: g._count.id })),
          monthlyTrend: monthly,
        }
        break
      }

      case 'response_time': {
        const tickets = await db.maintenanceTicket.findMany({
          where: { ...ticketWhere, actualResponseMinutes: { gt: 0 } },
          select: { id: true, ticketNo: true, priority: true, category: true, actualResponseMinutes: true, createdAt: true },
          orderBy: { actualResponseMinutes: 'desc' },
          take: 100,
        })

        const byPriority = await db.maintenanceTicket.groupBy({
          by: ['priority'],
          where: { ...ticketWhere, actualResponseMinutes: { gt: 0 } },
          _avg: { actualResponseMinutes: true },
          _count: { id: true },
        })

        data = {
          tickets: JSON.parse(JSON.stringify(tickets)),
          avgByPriority: byPriority.map((g) => ({
            priority: g.priority,
            avgMinutes: Math.round(g._avg.actualResponseMinutes || 0),
            count: g._count.id,
          })),
        }
        break
      }

      case 'resolution_time': {
        const tickets = await db.maintenanceTicket.findMany({
          where: { ...ticketWhere, actualResolutionMinutes: { gt: 0 } },
          select: { id: true, ticketNo: true, priority: true, category: true, actualResolutionMinutes: true, createdAt: true },
          orderBy: { actualResolutionMinutes: 'desc' },
          take: 100,
        })

        const byPriority = await db.maintenanceTicket.groupBy({
          by: ['priority'],
          where: { ...ticketWhere, actualResolutionMinutes: { gt: 0 } },
          _avg: { actualResolutionMinutes: true },
          _count: { id: true },
        })

        data = {
          tickets: JSON.parse(JSON.stringify(tickets)),
          avgByPriority: byPriority.map((g) => ({
            priority: g.priority,
            avgMinutes: Math.round(g._avg.actualResolutionMinutes || 0),
            count: g._count.id,
          })),
        }
        break
      }

      case 'technician_performance': {
        const technicians = await db.technicianProfile.findMany({
          include: {
            user: { select: { name: true, avatar: true } },
            tickets: {
              where: ticketWhere,
              select: { id: true, status: true, priority: true, actualResponseMinutes: true, actualResolutionMinutes: true, createdAt: true, closedAt: true },
            },
            serviceRatings: true,
          },
        })

        const performance = technicians.map((t) => {
          const completedTickets = t.tickets.filter((tk) => tk.status === 'closed')
          const avgResponse = completedTickets.length > 0
            ? completedTickets.reduce((sum, tk) => sum + (tk.actualResponseMinutes ?? 0), 0) / completedTickets.length
            : 0
          const avgResolution = completedTickets.length > 0
            ? completedTickets.reduce((sum, tk) => sum + (tk.actualResolutionMinutes ?? 0), 0) / completedTickets.length
            : 0
          const avgRating = t.serviceRatings.length > 0
            ? t.serviceRatings.reduce((sum, r) => sum + r.rating, 0) / t.serviceRatings.length
            : 0

          return {
            id: t.id,
            name: t.user.name,
            avatar: t.user.avatar,
            totalJobs: t.tickets.length,
            completedJobs: completedTickets.length,
            activeJobs: t.tickets.filter((tk) => !['closed', 'completed', 'customer_verification'].includes(tk.status)).length,
            avgResponseMinutes: Math.round(avgResponse),
            avgResolutionMinutes: Math.round(avgResolution),
            avgRating: Math.round(avgRating * 10) / 10,
            profileRating: t.rating,
          }
        }).sort((a, b) => b.completedJobs - a.completedJobs)

        data = { technicians: performance }
        break
      }

      case 'customer_satisfaction': {
        const ratings = await (db as any).serviceRating.findMany({
          where: {
            ...(ticketWhere.customerId ? { customerId: ticketWhere.customerId } : {}),
          },
          include: {
            ticket: { select: { ticketNo: true, category: true, priority: true, createdAt: true } },
            customer: { select: { name: true } },
            technician: { select: { user: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        })

        const summary = await (db as any).serviceRating.aggregate({
          _avg: { rating: true, punctuality: true, quality: true, professionalism: true, overallScore: true },
          _count: { id: true },
        })

        const byCategory = await (db as any).serviceRating.groupBy({
          by: ['ticketId'],
          where: ticketWhere.customerId ? { customerId: ticketWhere.customerId } : {},
          _avg: { rating: true },
        })

        data = {
          ratings: JSON.parse(JSON.stringify(ratings)),
          summary: {
            avgRating: Math.round((summary._avg.rating || 0) * 10) / 10,
            avgPunctuality: Math.round((summary._avg.punctuality || 0) * 10) / 10,
            avgQuality: Math.round((summary._avg.quality || 0) * 10) / 10,
            avgProfessionalism: Math.round((summary._avg.professionalism || 0) * 10) / 10,
            avgOverall: Math.round((summary._avg.overallScore || 0) * 10) / 10,
            totalRatings: summary._count.id,
          },
        }
        break
      }

      case 'amc': {
        const [totalContracts, activeContracts, expiredContracts, totalValue, usedVisits] = await Promise.all([
          db.aMCContract.count({ where: ticketWhere }),
          db.aMCContract.count({ where: { ...ticketWhere, status: 'active' } }),
          db.aMCContract.count({ where: { ...ticketWhere, status: 'expired' } }),
          db.aMCContract.aggregate({
            where: ticketWhere,
            _sum: { annualValue: true },
          }),
          db.aMCContract.aggregate({
            where: { ...ticketWhere, status: 'active' },
            _sum: { usedVisits: true, totalVisits: true },
          }),
        ])

        const byFrequency = await db.aMCContract.groupBy({
          by: ['visitFrequency'],
          where: ticketWhere,
          _count: { id: true },
          _sum: { annualValue: true },
        })

        data = {
          totalContracts,
          activeContracts,
          expiredContracts,
          totalAnnualValue: totalValue._sum.annualValue || 0,
          totalUsedVisits: usedVisits._sum.usedVisits || 0,
          totalPlannedVisits: usedVisits._sum.totalVisits || 0,
          utilizationRate: usedVisits._sum.totalVisits
            ? Math.round(((usedVisits._sum.usedVisits || 0) / usedVisits._sum.totalVisits) * 100)
            : 0,
          byFrequency: byFrequency.map((g) => ({
            frequency: g.visitFrequency,
            count: g._count.id,
            totalValue: g._sum.annualValue || 0,
          })),
        }
        break
      }

      case 'pm_compliance': {
        const schedules = await (db as any).pMSchedule.findMany({
          where: { ...ticketWhere, isActive: true },
          select: { id: true, scheduleNo: true, scheduleType: true, visitCount: true, totalVisits: true, nextVisitDate: true, lastVisitDate: true },
        })

        const now = new Date()
        const overdue = schedules.filter((s) => s.nextVisitDate && new Date(s.nextVisitDate) < now)
        const upcoming = schedules.filter((s) => s.nextVisitDate && new Date(s.nextVisitDate) >= now && new Date(s.nextVisitDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))

        const byType = await (db as any).pMSchedule.groupBy({
          by: ['scheduleType'],
          where: { ...ticketWhere, isActive: true },
          _count: { id: true },
          _avg: { visitCount: true, totalVisits: true },
        })

        data = {
          totalActiveSchedules: schedules.length,
          overdueCount: overdue.length,
          upcomingCount: upcoming.length,
          overdueSchedules: overdue.map((s) => ({ id: s.id, scheduleNo: s.scheduleNo, nextVisitDate: s.nextVisitDate })),
          byType: byType.map((g) => ({
            type: g.scheduleType,
            count: g._count.id,
            avgVisitsCompleted: Math.round(g._avg.visitCount || 0),
            avgTotalVisits: Math.round(g._avg.totalVisits || 0),
          })),
        }
        break
      }

      case 'sla': {
        const [totalTickets, breachedTickets, onTimeTickets] = await Promise.all([
          db.maintenanceTicket.count({ where: ticketWhere }),
          db.maintenanceTicket.count({ where: { ...ticketWhere, slaBreached: true } }),
          db.maintenanceTicket.count({ where: { ...ticketWhere, slaBreached: false, status: 'closed' } }),
        ])

        const breachByPriority = await db.maintenanceTicket.groupBy({
          by: ['priority'],
          where: { ...ticketWhere, slaBreached: true },
          _count: { id: true },
        })

        const complianceRate = totalTickets > 0
          ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100)
          : 100

        data = {
          totalTickets,
          breachedTickets,
          onTimeTickets,
          complianceRate,
          breachByPriority: breachByPriority.map((g) => ({ priority: g.priority, count: g._count.id })),
        }
        break
      }

      case 'revenue': {
        const [invoiceSummary, paidSummary, pendingSummary] = await Promise.all([
          (db as any).maintenanceInvoice.aggregate({
            where: ticketWhere,
            _sum: { total: true, labourCost: true, materialCost: true, serviceCharges: true, transportCost: true, tax: true, discount: true },
            _count: { id: true },
          }),
          (db as any).maintenanceInvoice.aggregate({
            where: { ...ticketWhere, status: 'paid' },
            _sum: { total: true, paidAmount: true },
            _count: { id: true },
          }),
          (db as any).maintenanceInvoice.aggregate({
            where: { ...ticketWhere, status: { in: ['draft', 'sent'] } },
            _sum: { total: true },
            _count: { id: true },
          }),
        ])

        const byStatus = await (db as any).maintenanceInvoice.groupBy({
          by: ['status'],
          where: ticketWhere,
          _sum: { total: true },
          _count: { id: true },
        })

        const byMonth = await (db as any).maintenanceInvoice.findMany({
          where: ticketWhere,
          select: { createdAt: true, total: true, status: true },
        })

        const monthlyMap = new Map<string, { total: number; paid: number; count: number }>()
        byMonth.forEach((inv) => {
          const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`
          const existing = monthlyMap.get(key) || { total: 0, paid: 0, count: 0 }
          existing.total += inv.total
          if (inv.status === 'paid') existing.paid += inv.total
          existing.count += 1
          monthlyMap.set(key, existing)
        })
        const monthly = Array.from(monthlyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, val]) => ({ month, ...val }))

        data = {
          totalRevenue: invoiceSummary._sum.total || 0,
          totalInvoices: invoiceSummary._count.id,
          totalPaid: paidSummary._sum.total || 0,
          totalCollected: paidSummary._sum.paidAmount || 0,
          totalPending: pendingSummary._sum.total || 0,
          paidCount: paidSummary._count.id,
          pendingCount: pendingSummary._count.id,
          costBreakdown: {
            labour: invoiceSummary._sum.labourCost || 0,
            material: invoiceSummary._sum.materialCost || 0,
            service: invoiceSummary._sum.serviceCharges || 0,
            transport: invoiceSummary._sum.transportCost || 0,
            tax: invoiceSummary._sum.tax || 0,
            discount: invoiceSummary._sum.discount || 0,
          },
          byStatus: byStatus.map((g) => ({ status: g.status, total: g._sum.total || 0, count: g._count.id })),
          monthly,
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