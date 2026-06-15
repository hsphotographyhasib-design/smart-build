import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, createAuditLog } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const employeeId = searchParams.get('employeeId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type
    if (employeeId) where.employeeId = employeeId

    const leaveRequests = await db.leaveRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, empCode: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: leaveRequests })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch leave requests'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, type, startDate, endDate, days, reason } = body

    if (!employeeId || !type || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'employeeId, type, startDate, and endDate are required' }, { status: 400 })
    }

    const employee = await db.employee.findUnique({ where: { id: employeeId } })
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 })
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        employeeId,
        userId: user.id,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: parseFloat(days) || 1,
        reason: reason?.trim() || null,
        status: 'pending',
      },
    })

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'LeaveRequest',
      entityId: leaveRequest.id,
      newValues: leaveRequest,
    })

    return NextResponse.json({ success: true, data: leaveRequest }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create leave request'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}