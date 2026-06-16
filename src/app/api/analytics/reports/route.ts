import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined

    const dateFilter: Record<string, unknown> = {}
    if (startDate) dateFilter.gte = startDate
    if (endDate) dateFilter.lte = endDate

    if (type === 'project-pl') {
      return generateProjectPL(projectId, dateFilter)
    }
    if (type === 'labour-summary') {
      return generateLabourSummary(projectId, dateFilter)
    }
    if (type === 'cost-variance') {
      return generateCostVariance(projectId)
    }
    if (type === 'resource-utilization') {
      return generateResourceUtilization(projectId)
    }
    if (type === 'financial-health') {
      return generateFinancialHealth(projectId, dateFilter)
    }

    return NextResponse.json({ success: false, error: 'Invalid report type. Use: project-pl, labour-summary, cost-variance, resource-utilization, financial-health' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

async function generateProjectPL(projectId: string | null, dateFilter: Record<string, unknown>) {
  const projectWhere: Record<string, unknown> = {}
  if (projectId) projectWhere.id = projectId
  else projectWhere.status = { in: ['active', 'completed'] }

  const invoiceWhere: Record<string, unknown> = { type: 'sales', project: projectWhere }
  if (Object.keys(dateFilter).length > 0) invoiceWhere.issueDate = dateFilter

  const projects = await db.project.findMany({
    where: projectWhere,
    select: { id: true, name: true, code: true, status: true },
  })

  const result = []
  for (const p of projects) {
    const pw = { projectId: p.id }
    const iWhere: Record<string, unknown> = { ...pw, type: 'sales' }
    if (Object.keys(dateFilter).length > 0) iWhere.issueDate = dateFilter

    const [invoices, expenses, purchaseOrders] = await Promise.all([
      db.invoice.findMany({ where: iWhere, select: { id: true, invoiceNo: true, total: true, paidAmount: true, tax: true, discount: true, status: true, issueDate: true } }),
      db.expense.findMany({ where: pw, select: { id: true, amount: true, category: true, date: true, description: true } }),
      db.purchaseOrder.findMany({ where: pw, select: { id: true, orderNo: true, total: true, status: true, orderDate: true } }),
    ])

    const revenue = invoices.reduce((s, i) => s + i.total, 0)
    const collected = invoices.reduce((s, i) => s + i.paidAmount, 0)
    const directCosts = expenses.reduce((s, e) => s + e.amount, 0)
    const poCosts = purchaseOrders.reduce((s, po) => s + po.total, 0)
    const totalCosts = directCosts + poCosts

    // খরচ বিশ্লেষণ
    const costByCategory: Record<string, number> = {}
    for (const e of expenses) {
      costByCategory[e.category || 'Other'] = (costByCategory[e.category || 'Other'] || 0) + e.amount
    }

    result.push({
      projectId: p.id,
      projectName: p.name,
      projectCode: p.code,
      status: p.status,
      revenue: Math.round(revenue),
      collected: Math.round(collected),
      directCosts: Math.round(directCosts),
      purchaseOrderCosts: Math.round(poCosts),
      totalCosts: Math.round(totalCosts),
      grossProfit: Math.round(revenue - totalCosts),
      netProfit: Math.round(collected - totalCosts),
      margin: revenue > 0 ? Math.round(((revenue - totalCosts) / revenue) * 100) : 0,
      costBreakdown: Object.entries(costByCategory).map(([cat, amt]) => ({ category: cat, amount: Math.round(amt) })),
      invoiceCount: invoices.length,
      expenseCount: expenses.length,
      invoiceBreakdown: invoices.map(i => ({
        invoiceNo: i.invoiceNo,
        total: Math.round(i.total),
        paid: Math.round(i.paidAmount),
        status: i.status,
        date: i.issueDate,
      })),
    })
  }

  const totals = {
    revenue: Math.round(result.reduce((s, r) => s + r.revenue, 0)),
    collected: Math.round(result.reduce((s, r) => s + r.collected, 0)),
    totalCosts: Math.round(result.reduce((s, r) => s + r.totalCosts, 0)),
    grossProfit: Math.round(result.reduce((s, r) => s + r.grossProfit, 0)),
    netProfit: Math.round(result.reduce((s, r) => s + r.netProfit, 0)),
  }
  totals.margin = totals.revenue > 0 ? Math.round(((totals.revenue - totals.totalCosts) / totals.revenue) * 100) : 0

  return NextResponse.json({ success: true, data: { reportType: 'project-pl', generatedAt: new Date().toISOString(), projects: result, totals } })
}

async function generateLabourSummary(projectId: string | null, dateFilter: Record<string, unknown>) {
  const attendanceWhere: Record<string, unknown> = { status: 'present' }
  if (projectId) attendanceWhere.projectId = projectId
  if (Object.keys(dateFilter).length > 0) attendanceWhere.date = dateFilter

  const [attendance, payrollData] = await Promise.all([
    db.attendance.findMany({
      where: attendanceWhere,
      include: {
        labour: { select: { id: true, name: true, group: { select: { name: true, rate: true } } } },
        project: { select: { id: true, name: true, code: true } },
      },
    }),
    db.payroll.findMany({
      where: projectId ? { projectId } : {},
      include: {
        labour: { select: { name: true, group: { select: { name: true } } } },
        project: { select: { id: true, name: true, code: true } },
      },
    }),
  ])

  // প্রকল্প অনুযায়ী (উপস্থিতি)
  const byProject: Record<string, { projectId: string; projectName: string; projectCode: string; totalDays: number; totalHours: number; totalOvertime: number; totalCost: number; uniqueWorkers: number }> = {}
  for (const att of attendance) {
    const key = att.project.id
    if (!byProject[key]) {
      byProject[key] = { projectId: att.project.id, projectName: att.project.name, projectCode: att.project.code, totalDays: 0, totalHours: 0, totalOvertime: 0, totalCost: 0, uniqueWorkers: new Set().size }
    }
    byProject[key].totalDays += 1
    byProject[key].totalHours += att.hoursWorked || 0
    byProject[key].totalOvertime += att.overtime || 0
    byProject[key].totalCost += (att.hoursWorked || 0) * (att.labour.group?.rate || 0)
  }

  // প্রতিটি প্রকল্পে অনন্য শ্রমিক গণনা করা হচ্ছে
  const workerSets: Record<string, Set<string>> = {}
  for (const att of attendance) {
    if (!workerSets[att.project.id]) workerSets[att.project.id] = new Set()
    workerSets[att.project.id].add(att.labourId)
  }
  for (const key of Object.keys(byProject)) {
    byProject[key].uniqueWorkers = workerSets[key]?.size || 0
  }

  // বেতন সারসংক্ষেপ
  const payrollByProject: Record<string, { projectId: string; projectName: string; totalPaid: number; totalDeductions: number; totalNet: number; payslipCount: number }> = {}
  for (const p of payrollData) {
    const key = p.project.id
    if (!payrollByProject[key]) {
      payrollByProject[key] = { projectId: p.project.id, projectName: p.project.name, totalPaid: 0, totalDeductions: 0, totalNet: 0, payslipCount: 0 }
    }
    payrollByProject[key].totalPaid += p.grossPay || 0
    payrollByProject[key].totalDeductions += p.deductions || 0
    payrollByProject[key].totalNet += p.netPay || 0
    payrollByProject[key].payslipCount += 1
  }

  return NextResponse.json({
    success: true,
    data: {
      reportType: 'labour-summary',
      generatedAt: new Date().toISOString(),
      attendanceByProject: Object.values(byProject),
      payrollByProject: Object.values(payrollByProject),
      totalAttendance: attendance.length,
      totalHours: Math.round(attendance.reduce((s, a) => s + (a.hoursWorked || 0), 0)),
      totalOvertime: Math.round(attendance.reduce((s, a) => s + (a.overtime || 0), 0)),
      totalLabourCost: Math.round(Object.values(byProject).reduce((s, b) => s + b.totalCost, 0)),
    },
  })
}

async function generateCostVariance(projectId: string | null) {
  const budgetWhere: Record<string, unknown> = { status: 'approved' }
  if (projectId) budgetWhere.projectId = projectId

  const budgets = await db.budget.findMany({
    where: budgetWhere,
    include: {
      project: { select: { id: true, name: true, code: true } },
      budgetLineItem: {
        select: { originalBudget: true, revisedBudget: true, actualCost: true, committedCost: true, costCode: { select: { id: true, name: true, code: true, parentId: true } } },
      },
    },
  })

  const result = budgets.map(b => {
    const items = b.budgetLineItem
    const totalOriginal = items.reduce((s, li) => s + li.originalBudget, 0)
    const totalRevised = items.reduce((s, li) => s + li.revisedBudget, 0)
    const totalActual = items.reduce((s, li) => s + li.actualCost, 0)
    const totalCommitted = items.reduce((s, li) => s + li.committedCost, 0)

    const byCode = items.map(li => ({
      costCode: li.costCode?.name || 'Uncategorized',
      costCodeId: li.costCode?.id,
      originalBudget: li.originalBudget,
      revisedBudget: li.revisedBudget,
      actualCost: li.actualCost,
      committedCost: li.committedCost,
      variance: li.originalBudget - li.actualCost,
      variancePercent: li.originalBudget > 0 ? Math.round(((li.originalBudget - li.actualCost) / li.originalBudget) * 100) : 0,
    })).sort((a, b) => b.originalBudget - a.originalBudget)

    return {
      projectId: b.project.id,
      projectName: b.project.name,
      projectCode: b.project.code,
      totalOriginal: Math.round(totalOriginal || b.originalValue),
      totalRevised: Math.round(totalRevised),
      totalActual: Math.round(totalActual),
      totalCommitted: Math.round(totalCommitted),
      totalVariance: Math.round((totalOriginal || b.originalValue) - totalActual),
      variancePercent: (totalOriginal || b.originalValue) > 0 ? Math.round((((totalOriginal || b.originalValue) - totalActual) / (totalOriginal || b.originalValue)) * 100) : 0,
      isOverBudget: totalActual > (totalOriginal || b.originalValue),
      lineItems: byCode,
    }
  })

  return NextResponse.json({
    success: true,
    data: { reportType: 'cost-variance', generatedAt: new Date().toISOString(), projects: result },
  })
}

async function generateResourceUtilization(projectId: string | null) {
  const assignmentWhere: Record<string, unknown> = {}
  if (projectId) assignmentWhere.projectId = projectId

  const assignments = await db.resourceAssignment.findMany({
    where: assignmentWhere,
    include: {
      project: { select: { id: true, name: true, code: true, status: true } },
      crew: { select: { id: true, name: true, crew_members: { include: { labour: { select: { name: true, isActive: true } } } } } },
    },
  })

  const crews = await db.crew.findMany({
    include: { crew_members: { include: { labour: { select: { name: true, isActive: true } } } } },
  })

  // প্রকল্প অনুযায়ী (সম্পদ)
  const byProject: Record<string, { projectId: string; projectName: string; projectCode: string; projectStatus: string; totalAssignments: number; activeAssignments: number; uniqueCrews: number; utilizationRate: number }> = {}
  for (const a of assignments) {
    const key = a.project.id
    if (!byProject[key]) {
      byProject[key] = { projectId: a.project.id, projectName: a.project.name, projectCode: a.project.code, projectStatus: a.project.status, totalAssignments: 0, activeAssignments: 0, uniqueCrews: new Set().size, utilizationRate: 0 }
    }
    byProject[key].totalAssignments += 1
    if (a.status === 'active') byProject[key].activeAssignments += 1
  }

  const crewSets: Record<string, Set<string>> = {}
  for (const a of assignments) {
    if (!crewSets[a.project.id]) crewSets[a.project.id] = new Set()
    if (a.crewId) crewSets[a.project.id].add(a.crewId)
  }
  for (const key of Object.keys(byProject)) {
    byProject[key].uniqueCrews = crewSets[key]?.size || 0
    byProject[key].utilizationRate = byProject[key].totalAssignments > 0
      ? Math.round((byProject[key].activeAssignments / byProject[key].totalAssignments) * 100)
      : 0
  }

  // ক্রু অনুযায়ী
  const byCrew = crews.map(c => {
    const crewAssignments = assignments.filter(a => a.crewId === c.id)
    return {
      crewId: c.id,
      crewName: c.name,
      memberCount: c.members.length,
      activeMembers: c.members.filter(m => m.labour.isActive).length,
      totalAssignments: crewAssignments.length,
      activeAssignments: crewAssignments.filter(a => a.status === 'active').length,
      assignedProjects: [...new Set(crewAssignments.map(a => a.project.name))],
      utilizationRate: crewAssignments.length > 0 ? Math.round((crewAssignments.filter(a => a.status === 'active').length / crewAssignments.length) * 100) : 0,
    }
  }).sort((a, b) => b.utilizationRate - a.utilizationRate)

  return NextResponse.json({
    success: true,
    data: {
      reportType: 'resource-utilization',
      generatedAt: new Date().toISOString(),
      byProject: Object.values(byProject),
      byCrew,
      totalAssignments: assignments.length,
      activeAssignments: assignments.filter(a => a.status === 'active').length,
      overallUtilization: assignments.length > 0 ? Math.round((assignments.filter(a => a.status === 'active').length / assignments.length) * 100) : 0,
    },
  })
}

async function generateFinancialHealth(projectId: string | null, dateFilter: Record<string, unknown>) {
  const projectWhere: Record<string, unknown> = {}
  if (projectId) projectWhere.id = projectId
  else projectWhere.status = { in: ['active', 'completed'] }

  const projects = await db.project.findMany({
    where: projectWhere,
    select: { id: true, name: true, code: true, status: true },
  })

  const cashflowData: { projectId: string; projectName: string; inflow: number; outflow: number; net: number; receivables: number; payables: number }[] = []

  for (const p of projects) {
    const pw = { projectId: p.id }
    const iWhere: Record<string, unknown> = { ...pw, type: 'sales' }
    if (Object.keys(dateFilter).length > 0) iWhere.issueDate = dateFilter
    const eWhere: Record<string, unknown> = { ...pw }
    if (Object.keys(dateFilter).length > 0) eWhere.date = dateFilter

    const [invoices, expenses, payments] = await Promise.all([
      db.invoice.findMany({ where: iWhere, select: { total: true, paidAmount: true, status: true } }),
      db.expense.findMany({ where: eWhere, select: { amount: true } }),
      db.payment.findMany({ where: { projectId: p.id, status: 'completed' }, select: { amount: true } }),
    ])

    const inflow = payments.reduce((s, p) => s + p.amount, 0)
    const outflow = expenses.reduce((s, e) => s + e.amount, 0)
    const receivables = invoices.reduce((s, i) => s + (i.total - i.paidAmount), 0)
    const payables = outflow - inflow

    cashflowData.push({
      projectId: p.id,
      projectName: p.name,
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      net: Math.round(inflow - outflow),
      receivables: Math.round(Math.max(0, receivables)),
      payables: Math.round(Math.max(0, payables)),
    })
  }

  const totals = {
    inflow: Math.round(cashflowData.reduce((s, c) => s + c.inflow, 0)),
    outflow: Math.round(cashflowData.reduce((s, c) => s + c.outflow, 0)),
    net: Math.round(cashflowData.reduce((s, c) => s + c.net, 0)),
    receivables: Math.round(cashflowData.reduce((s, c) => s + c.receivables, 0)),
    payables: Math.round(cashflowData.reduce((s, c) => s + c.payables, 0)),
  }

  return NextResponse.json({
    success: true,
    data: { reportType: 'financial-health', generatedAt: new Date().toISOString(), projects: cashflowData, totals },
  })
}