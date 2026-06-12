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
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (projectId) where.projectId = projectId
    if (status && status !== 'all') where.status = status

    if (month && year) {
      const m = parseInt(month, 10)
      const y = parseInt(year, 10)
      const periodStart = new Date(y, m - 1, 1)
      const periodEnd = new Date(y, m, 0, 23, 59, 59, 999)
      where.periodStart = { gte: periodStart, lte: periodEnd }
    }

    const payrolls = await db.payroll.findMany({
      where,
      include: {
        labour: {
          include: { group: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const summary = payrolls.reduce(
      (acc, p) => {
        acc.totalBasic += p.basicPay
        acc.totalOT += p.overtimePay
        acc.totalDeductions += p.deductions + p.advanceDeductions
        acc.totalNetPay += p.netPay
        return acc
      },
      { totalBasic: 0, totalOT: 0, totalDeductions: 0, totalNetPay: 0 }
    )

    return NextResponse.json({ success: true, data: { records: payrolls, summary } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch payroll'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}