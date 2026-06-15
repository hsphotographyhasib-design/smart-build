import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole, createAuditLog } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin', 'hr_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const body = await request.json()
    const { projectId, month, year, deductions } = body

    if (!projectId || !month || !year) {
      return NextResponse.json({ success: false, error: 'projectId, month, and year are required' }, { status: 400 })
    }

    const m = parseInt(month, 10)
    const y = parseInt(year, 10)
    const periodStart = new Date(y, m - 1, 1)
    const periodEnd = new Date(y, m, 0, 23, 59, 59, 999)

    // সব সক্রিয় শ্রমিক পাওয়া হচ্ছে
    const labourList = await db.labour.findMany({
      where: { isActive: true },
    })

    if (labourList.length === 0) {
      return NextResponse.json({ success: false, error: 'No active labour found' }, { status: 400 })
    }

    // সময়কালের জন্য উপস্থিতি পাওয়া হচ্ছে
    const attendanceRecords = await db.attendance.findMany({
      where: {
        projectId,
        labourId: { in: labourList.map((l) => l.id) },
        date: { gte: periodStart, lte: periodEnd },
      },
    })

    // অগ্রিম কর্তন পাওয়া হচ্ছে (মুলত্বী/অনুমোদিত অগ্রিম)
    const advances = await db.advancePayment.findMany({
      where: {
        labourId: { in: labourList.map((l) => l.id) },
        status: { in: ['approved', 'paid'] },
      },
      select: { labourId: true, amount: true },
    })

    // অগ্রিম ম্যাপ তৈরি করা হচ্ছে
    const advanceMap = new Map<string, number>()
    for (const adv of advances) {
      advanceMap.set(adv.labourId, (advanceMap.get(adv.labourId) || 0) + adv.amount)
    }

    // উপস্থিতি ম্যাপ তৈরি করা হচ্ছে
    const attMap = new Map<string, { daysWorked: number; otHours: number }>()
    for (const att of attendanceRecords) {
      const existing = attMap.get(att.labourId) || { daysWorked: 0, otHours: 0 }
      if (att.status === 'present') {
        existing.daysWorked += 1
      } else if (att.status === 'half_day') {
        existing.daysWorked += 0.5
      } else if (att.status === 'overtime') {
        existing.daysWorked += 1
        existing.otHours += att.overtime || 2
      }
      attMap.set(att.labourId, existing)
    }

    // একই সময়কাল/প্রজেক্টের জন্য বিদ্যমান পেরোল মুছে ফেলা হচ্ছে
    await db.payroll.deleteMany({
      where: {
        projectId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    })

    const deductionsMap = new Map<string, number>()
    if (deductions && typeof deductions === 'object') {
      for (const [labourId, amount] of Object.entries(deductions)) {
        deductionsMap.set(labourId, parseFloat(amount as string) || 0)
      }
    }

    // পেরোল তৈরি করা হচ্ছে for each labour
    const created: unknown[] = []
    for (const labour of labourList) {
      const att = attMap.get(labour.id) || { daysWorked: 0, otHours: 0 }
      const otRate = (labour.dailyRate / 8) * 1.5 // 1.5x hourly
      const basicPay = att.daysWorked * labour.dailyRate
      const overtimePay = att.otHours * otRate
      const labourDeductions = deductionsMap.get(labour.id) || 0
      const advanceDed = advanceMap.get(labour.id) || 0
      const netPay = Math.max(0, basicPay + overtimePay - labourDeductions - advanceDed)

      const payroll = await db.payroll.create({
        data: {
          projectId,
          labourId: labour.id,
          periodStart,
          periodEnd,
          daysWorked: att.daysWorked,
          overtimeHours: att.otHours,
          basicPay,
          overtimePay,
          deductions: labourDeductions,
          advanceDeductions: advanceDed,
          netPay,
          status: 'pending',
        },
      })
      created.push(payroll)
    }

    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Payroll',
      newValues: { projectId, month, year, count: created.length },
    })

    return NextResponse.json({ success: true, data: { created: created.length, records: created } }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate payroll'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}