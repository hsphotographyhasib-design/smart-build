import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    // 1. Invoice volume by month
    const invoicesByMonth = await db.invoice.findMany({
      where: { createdAt: { gte: twelveMonthsAgo }, status: { not: 'cancelled' } },
      select: { createdAt: true, total: true, type: true },
    })
    const volumeByMonth: Record<string, { count: number; total: number; byType: Record<string, number> }> = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      volumeByMonth[key] = { count: 0, total: 0, byType: {} }
    }
    for (const inv of invoicesByMonth) {
      const key = `${inv.createdAt.getFullYear()}-${String(inv.createdAt.getMonth() + 1).padStart(2, '0')}`
      if (volumeByMonth[key]) {
        volumeByMonth[key].count++
        volumeByMonth[key].total += inv.total
        volumeByMonth[key].byType[inv.type] = (volumeByMonth[key].byType[inv.type] || 0) + inv.total
      }
    }

    // 2. Average approval time by type
    const approvedInvoices = await db.invoice.findMany({
      where: {
        status: 'approved',
        submittedAt: { not: null },
        approvedAt: { not: null },
      },
      select: { type: true, submittedAt: true, approvedAt: true },
    })
    const approvalTimeByType: Record<string, number> = {}
    const approvalCountByType: Record<string, number> = {}
    for (const inv of approvedInvoices) {
      const days = (inv.approvedAt!.getTime() - inv.submittedAt!.getTime()) / (1000 * 60 * 60 * 24)
      approvalTimeByType[inv.type] = (approvalTimeByType[inv.type] || 0) + days
      approvalCountByType[inv.type] = (approvalCountByType[inv.type] || 0) + 1
    }
    const avgApprovalTimeByType: Record<string, number> = {}
    for (const [type, totalDays] of Object.entries(approvalTimeByType)) {
      avgApprovalTimeByType[type] = Math.round((totalDays / approvalCountByType[type]) * 100) / 100
    }

    // 3. Approval bottlenecks (steps with longest avg time)
    const actions = await db.invoiceApprovalAction.findMany({
      where: { action: { in: ['approved', 'escalated'] } },
      include: { step: { select: { id: true, label: true } } },
      orderBy: { createdAt: 'asc' },
    })
    const instanceIds = [...new Set(actions.map(a => a.instanceId))]
    const instances = instanceIds.length > 0
      ? await db.invoiceWorkflowInstance.findMany({
          where: { id: { in: instanceIds } },
          select: { id: true, startedAt: true },
        })
      : []
    const instanceMap = new Map(instances.map(i => [i.id, i]))

    const stepTimes: Record<string, { total: number; count: number; label: string }> = {}
    for (const action of actions) {
      const instance = instanceMap.get(action.instanceId)
      if (instance) {
        const days = (action.createdAt.getTime() - instance.startedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (!stepTimes[action.stepId]) {
          stepTimes[action.stepId] = { total: 0, count: 0, label: action.step.label }
        }
        stepTimes[action.stepId].total += days
        stepTimes[action.stepId].count++
      }
    }
    const bottlenecks = Object.entries(stepTimes)
      .map(([stepId, data]) => ({
        stepId,
        label: data.label,
        avgDays: Math.round((data.total / data.count) * 100) / 100,
        actionCount: data.count,
      }))
      .sort((a, b) => b.avgDays - a.avgDays)
      .slice(0, 5)

    // 4. Outstanding payments summary
    const outstandingByProject = await db.invoice.groupBy({
      by: ['projectId'],
      where: { outstandingAmount: { gt: 0 }, status: { not: 'cancelled' } },
      _sum: { outstandingAmount: true, total: true, paidAmount: true },
      _count: true,
    })
    const projIds = outstandingByProject.map(p => p.projectId)
    const projList = projIds.length > 0
      ? await db.project.findMany({
          where: { id: { in: projIds } },
          select: { id: true, name: true, code: true },
        })
      : []
    const projMap = new Map(projList.map(p => [p.id, p]))

    // 5. Invoice aging distribution
    const unpaidInvoices = await db.invoice.findMany({
      where: {
        paymentStatus: { in: ['unpaid', 'partial', 'overdue'] },
        status: { not: 'cancelled' },
        dueDate: { not: null },
      },
      select: { dueDate: true, outstandingAmount: true },
    })
    const aging: Record<string, Record<string, number>> = {
      amounts: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 },
      counts: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 },
    }
    for (const inv of unpaidInvoices) {
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - inv.dueDate!.getTime()) / (1000 * 60 * 60 * 24)))
      let bucket: string
      if (daysOverdue <= 30) bucket = '0-30'
      else if (daysOverdue <= 60) bucket = '31-60'
      else if (daysOverdue <= 90) bucket = '61-90'
      else bucket = '90+'
      aging.amounts[bucket] += inv.outstandingAmount
      aging.counts[bucket]++
    }

    // 6. Cashflow impact (invoices approved minus payments received) by month
    const approvedMonthly = await db.invoice.findMany({
      where: { status: 'approved', approvedAt: { gte: twelveMonthsAgo } },
      select: { approvedAt: true, total: true },
    })
    const paymentsMonthly = await db.payment.findMany({
      where: { date: { gte: twelveMonthsAgo }, status: 'completed' },
      select: { date: true, amount: true },
    })
    const cashflowByMonth: Record<string, { invoiced: number; received: number; net: number }> = {}
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      cashflowByMonth[key] = { invoiced: 0, received: 0, net: 0 }
    }
    for (const inv of approvedMonthly) {
      const key = `${inv.approvedAt!.getFullYear()}-${String(inv.approvedAt!.getMonth() + 1).padStart(2, '0')}`
      if (cashflowByMonth[key]) cashflowByMonth[key].invoiced += inv.total
    }
    for (const pay of paymentsMonthly) {
      const key = `${pay.date.getFullYear()}-${String(pay.date.getMonth() + 1).padStart(2, '0')}`
      if (cashflowByMonth[key]) cashflowByMonth[key].received += pay.amount
    }
    for (const key of Object.keys(cashflowByMonth)) {
      cashflowByMonth[key].net = cashflowByMonth[key].invoiced - cashflowByMonth[key].received
    }

    return NextResponse.json({
      success: true,
      data: {
        volumeByMonth,
        avgApprovalTimeByType,
        bottlenecks,
        outstandingPayments: {
          byProject: outstandingByProject.map(p => ({
            projectId: p.projectId,
            project: projMap.get(p.projectId) || { id: p.projectId, name: 'Unknown', code: '' },
            outstandingAmount: p._sum.outstandingAmount || 0,
            totalInvoiced: p._sum.total || 0,
            totalPaid: p._sum.paidAmount || 0,
            invoiceCount: p._count,
          })),
        },
        invoiceAging: aging,
        cashflowByMonth,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}