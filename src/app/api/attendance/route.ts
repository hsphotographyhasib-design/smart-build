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
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const groupId = searchParams.get('groupId')

    const where: Record<string, unknown> = {}

    if (projectId) where.projectId = projectId
    if (status && status !== 'all') where.status = status

    if (date) {
      const d = new Date(date)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      where.date = { gte: d, lt: next }
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const attendance = await db.attendance.findMany({
      where,
      include: {
        labour: {
          include: { group: true },
        },
      },
      orderBy: [{ date: 'desc' }, { labour: { name: 'asc' } }],
    })

    // If groupId filter, filter in memory (cross-relation)
    const filtered = groupId
      ? attendance.filter((a) => a.labour.groupId === groupId)
      : attendance

    // সারসংক্ষেপ
    const summary = {
      present: filtered.filter((a) => a.status === 'present').length,
      absent: filtered.filter((a) => a.status === 'absent').length,
      half_day: filtered.filter((a) => a.status === 'half_day').length,
      overtime: filtered.filter((a) => a.status === 'overtime').length,
      total: filtered.length,
    }

    return NextResponse.json({ success: true, data: { records: filtered, summary } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch attendance'
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
    const { projectId, date, records } = body

    if (!projectId || !date || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'projectId, date, and records are required' }, { status: 400 })
    }

    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)

    const created: unknown[] = []

    for (const record of records) {
      if (!record.labourId || !record.status) continue

      // আপসার্ট: বিদ্যমান থাকলে মুছে ফেলুন, তারপর তৈরি করুন
      await db.attendance.deleteMany({
        where: {
          projectId,
          labourId: record.labourId,
          date: dateObj,
        },
      })

      const attendance = await db.attendance.create({
        data: {
          projectId,
          labourId: record.labourId,
          date: dateObj,
          status: record.status,
          hoursWorked: record.hoursWorked ?? (record.status === 'half_day' ? 4 : record.status === 'overtime' ? 10 : 8),
          overtime: record.overtime ?? (record.status === 'overtime' ? 2 : 0),
          verifiedBy: user.id,
        },
      })
      created.push(attendance)
    }

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Attendance',
      newValues: { projectId, date, count: created.length },
    })

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark attendance'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}