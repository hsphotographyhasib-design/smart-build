import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const customerId = searchParams.get('customerId')
    const siteId = searchParams.get('siteId')
    const assignedTechnicianId = searchParams.get('assignedTechnicianId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (type) where.type = type
    if (customerId) where.customerId = customerId
    if (siteId) where.siteId = siteId
    if (assignedTechnicianId) where.assignedTechnicianId = assignedTechnicianId
    if (search) {
      where.OR = [
        { ticketNo: { contains: search } },
        { subject: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [tickets, total] = await Promise.all([
      db.maintenanceTicket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          site: { select: { id: true, name: true, code: true } },
          assignedTechnician: { select: { id: true, userId: true, availabilityStatus: true, rating: true, user: { select: { name: true, phone: true } } } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { timeline: true, materialRequests: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.maintenanceTicket.count({ where }),
    ])

    const data = tickets.map((t) => JSON.parse(JSON.stringify(t)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tickets'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      type, category, priority, subject, description,
      customerId, siteId, building, floor, room, equipmentId, projectId,
      contactPerson, contactPhone, location,
      preferredVisitDate, preferredVisitTime,
      photos, videos, documents,
    } = body

    if (!category || !subject || !description) {
      return NextResponse.json({ success: false, error: 'Category, subject and description are required' }, { status: 400 })
    }

    // স্বয়ংক্রিয়ভাবে টিকেট নম্বর তৈরি করা হচ্ছে
    const year = new Date().getFullYear()
    const prefix = 'CMP'
    const count = await db.maintenanceTicket.count({
      where: { ticketNo: { startsWith: `${prefix}-${year}` } },
    })
    const ticketNo = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`

    // অগ্রাধিকার অনুযায়ী SLA টেমপ্লেট নেওয়া হচ্ছে
    const sla = await db.sLATemplate.findUnique({
      where: { priority: priority || 'medium' },
    })

    const now = new Date()
    const ticketData: Record<string, unknown> = {
      ticketNo,
      type: type || 'complaint',
      category,
      priority: priority || 'medium',
      subject,
      description,
      customerId: customerId || null,
      siteId: siteId || null,
      building: building || null,
      floor: floor || null,
      room: room || null,
      equipmentId: equipmentId || null,
      projectId: projectId || null,
      contactPerson: contactPerson || null,
      contactPhone: contactPhone || null,
      location: location || null,
      preferredVisitDate: preferredVisitDate ? new Date(preferredVisitDate) : null,
      preferredVisitTime: preferredVisitTime || null,
      photos: JSON.stringify(photos || []),
      videos: JSON.stringify(videos || []),
      documents: JSON.stringify(documents || []),
      createdById: authUser.id,
    }

    if (sla) {
      ticketData.responseDeadline = new Date(now.getTime() + sla.responseTimeMinutes * 60000)
      ticketData.resolutionDeadline = new Date(now.getTime() + sla.resolutionTimeMinutes * 60000)
    }

    const ticket = await db.maintenanceTicket.create({ data: ticketData as any })

    // প্রাথমিক টাইমলাইন এন্ট্রি তৈরি করা হচ্ছে
    await db.maintenanceTimeline.create({
      data: {
        ticketId: ticket.id,
        action: 'new',
        description: 'Ticket created',
        performedById: authUser.id,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'MaintenanceTicket',
      entityId: ticket.id,
      newValues: { ticketNo, subject },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(ticket)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create ticket'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}