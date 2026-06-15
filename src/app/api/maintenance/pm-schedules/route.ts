import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const scheduleType = searchParams.get('scheduleType')
    const isActive = searchParams.get('isActive')
    const assignedTechnicianId = searchParams.get('assignedTechnicianId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: Record<string, unknown> = {}
    if (customerId) where.customerId = customerId
    if (scheduleType) where.scheduleType = scheduleType
    if (assignedTechnicianId) where.assignedTechnicianId = assignedTechnicianId
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    const [schedules, total] = await Promise.all([
      db.pMSchedule.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          site: { select: { id: true, name: true, code: true } },
          assignedTechnician: { select: { id: true, user: { select: { name: true, phone: true } } } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { nextVisitDate: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.pMSchedule.count({ where }),
    ])

    const data = schedules.map((s) => JSON.parse(JSON.stringify(s)))

    return NextResponse.json({ success: true, data, total, page, limit })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch PM schedules'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      customerId, siteId, equipmentId, assetId,
      scheduleType, frequencyMonths,
      assignedTechnicianId, description,
      lastVisitDate, nextVisitDate,
      totalVisits, autoGenerateWorkOrder,
    } = body

    if (!scheduleType) {
      return NextResponse.json({ success: false, error: 'Schedule type is required' }, { status: 400 })
    }

    const validTypes = ['monthly', 'quarterly', 'semi_annual', 'annual']
    if (!validTypes.includes(scheduleType)) {
      return NextResponse.json({ success: false, error: `Schedule type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    // Auto-generate schedule number
    const year = new Date().getFullYear()
    const prefix = 'PM'
    const count = await db.pMSchedule.count({
      where: { scheduleNo: { startsWith: `${prefix}-${year}` } },
    })
    const scheduleNo = `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`

    // Set default frequency based on type
    const defaultFrequency: Record<string, number> = {
      monthly: 1,
      quarterly: 3,
      semi_annual: 6,
      annual: 12,
    }

    const schedule = await db.pMSchedule.create({
      data: {
        scheduleNo,
        customerId: customerId || null,
        siteId: siteId || null,
        equipmentId: equipmentId || null,
        assetId: assetId || null,
        scheduleType,
        frequencyMonths: frequencyMonths || defaultFrequency[scheduleType] || 1,
        assignedTechnicianId: assignedTechnicianId || null,
        description: description || null,
        lastVisitDate: lastVisitDate ? new Date(lastVisitDate) : null,
        nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
        totalVisits: totalVisits || 12,
        autoGenerateWorkOrder: autoGenerateWorkOrder !== undefined ? autoGenerateWorkOrder : true,
        createdById: authUser.id,
      },
      include: {
        customer: { select: { name: true } },
        site: { select: { name: true } },
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'PMSchedule',
      entityId: schedule.id,
      newValues: { scheduleNo, scheduleType },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(schedule)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create PM schedule'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}