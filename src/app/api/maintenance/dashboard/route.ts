import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()

    const [
      totalTickets,
      openTickets,
      completedTickets,
      emergencyTickets,
      slaBreachedTickets,
      technicianStats,
      ticketsByCategory,
      ticketsByPriority,
      ticketsByStatus,
      overdueTickets,
    ] = await Promise.all([
      db.maintenanceTicket.count(),
      db.maintenanceTicket.count({
        where: { status: { in: ['new', 'under_review', 'assigned', 'accepted', 'in_progress', 'pending_parts', 'pending_customer'] } },
      }),
      db.maintenanceTicket.count({
        where: { status: { in: ['completed', 'customer_verification', 'closed'] } },
      }),
      db.maintenanceTicket.count({
        where: { priority: 'emergency', status: { not: 'closed' } },
      }),
      db.maintenanceTicket.count({
        where: { slaBreached: true },
      }),
      db.technicianProfile.aggregate({
        _count: { id: true },
        _avg: { rating: true },
        where: { availabilityStatus: 'available' },
      }),
      db.maintenanceTicket.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      db.maintenanceTicket.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      db.maintenanceTicket.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      db.maintenanceTicket.count({
        where: {
          status: { not: 'closed' },
          resolutionDeadline: { lt: now },
        },
      }),
    ])

    // Average response time
    const avgResponse = await db.maintenanceTicket.aggregate({
      _avg: { actualResponseMinutes: true },
      where: { actualResponseMinutes: { gt: 0 } },
    })

    // Today's tickets
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayTickets = await db.maintenanceTicket.count({
      where: { createdAt: { gte: todayStart } },
    })

    const data = {
      totalTickets,
      openTickets,
      completedTickets,
      emergencyTickets,
      slaBreachedTickets,
      overdueTickets,
      todayTickets,
      avgResponseTime: Math.round(avgResponse._avg.actualResponseMinutes || 0),
      availableTechnicians: technicianStats._count.id,
      avgTechnicianRating: Math.round((technicianStats._avg.rating || 0) * 10) / 10,
      ticketsByCategory: ticketsByCategory.map((t) => ({ category: t.category, count: t._count.id })),
      ticketsByPriority: ticketsByPriority.map((t) => ({ priority: t.priority, count: t._count.id })),
      ticketsByStatus: ticketsByStatus.map((t) => ({ status: t.status, count: t._count.id })),
    }

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(data)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}