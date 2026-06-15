import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()

    // অ্যাসাইন করা হয়নি এমন টিকেট
    const unassignedTickets = await db.maintenanceTicket.findMany({
      where: {
        assignedTechnicianId: null,
        status: { in: ['new', 'under_review'] },
      },
      include: {
        customer: { select: { id: true, name: true } },
        site: { select: { id: true, name: true, address: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
      take: 50,
    })

    // জরুরি টিকেট
    const emergencyTickets = await db.maintenanceTicket.findMany({
      where: {
        priority: 'emergency',
        status: { notIn: ['closed', 'completed', 'customer_verification'] },
      },
      include: {
        customer: { select: { id: true, name: true } },
        site: { select: { id: true, name: true, address: true } },
        assignedTechnician: { select: { id: true, user: { select: { name: true, phone: true } }, availabilityStatus: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // অতিরিক্ত সময় অতিক্রান্ত টিকেট
    const overdueTickets = await db.maintenanceTicket.findMany({
      where: {
        status: { not: 'closed' },
        OR: [
          { resolutionDeadline: { lt: now } },
          { AND: [{ responseDeadline: { lt: now } }, { actualResponseMinutes: 0 }] },
        ],
      },
      include: {
        customer: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
        assignedTechnician: { select: { id: true, user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // অবস্থান সহ উপলব্ধ টেকনিশিয়ান
    const technicians = await db.technicianProfile.findMany({
      where: { availabilityStatus: 'available' },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        _count: {
          select: {
            tickets: {
              where: { status: { notIn: ['closed', 'completed', 'customer_verification'] } },
            },
          },
        },
      },
    })

    const techniciansWithWorkload = technicians.map((t) => ({
      ...JSON.parse(JSON.stringify(t)),
      currentJobs: t._count.tickets,
      availableCapacity: t.maxJobsPerDay - t._count.tickets,
    }))

    const data = {
      unassignedTickets: JSON.parse(JSON.stringify(unassignedTickets)),
      emergencyTickets: JSON.parse(JSON.stringify(emergencyTickets)),
      overdueTickets: JSON.parse(JSON.stringify(overdueTickets)),
      availableTechnicians: techniciansWithWorkload,
      summary: {
        unassignedCount: unassignedTickets.length,
        emergencyCount: emergencyTickets.length,
        overdueCount: overdueTickets.length,
        availableTechnicianCount: technicians.length,
      },
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load dispatch data'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}