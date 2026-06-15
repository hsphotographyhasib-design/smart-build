import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const calendars = await db.scheduleCalendar.findMany({
      where: { scheduleId: id },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(calendars)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch calendars'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request)
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const schedule = await db.schedule.findUnique({ where: { id } })
    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, calendarType, startDate, endDate, workingDays, shiftStart, shiftEnd, hoursPerDay, isDefault, description } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Calendar name is required' }, { status: 400 })
    }

    // If setting as default, unset others
    if (isDefault) {
      await db.scheduleCalendar.updateMany({
        where: { scheduleId: id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const calendar = await db.scheduleCalendar.create({
      data: {
        scheduleId: id,
        name,
        calendarType: calendarType || 'standard',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        workingDays: JSON.stringify(workingDays || [1, 2, 3, 4, 5]),
        shiftStart: shiftStart || null,
        shiftEnd: shiftEnd || null,
        hoursPerDay: hoursPerDay || 8,
        isDefault: isDefault || false,
        description: description || null,
      },
    })

    await createAuditLog({
      userId: authUser.id,
      action: 'CREATE',
      entity: 'ScheduleCalendar',
      entityId: calendar.id,
      newValues: { name, calendarType: calendarType || 'standard', scheduleId: id },
    })

    return NextResponse.json({ success: true, data: JSON.parse(JSON.stringify(calendar)) }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create calendar'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}