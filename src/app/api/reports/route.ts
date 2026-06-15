import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    if (!requireRole(user, ['admin', 'supervisor', 'accountant', 'hr_manager', 'auditor'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endDate = end ? new Date(end) : new Date()

    let data: unknown = []

    switch (type) {
      case 'project-pl': {
        // Project P&L
        const projects = await db.project.findMany({
          where: { status: { in: ['active', 'completed'] } },
          include: {
            _sum: {
              payments: { select: { amount: true } },
              expenses: { select: { amount: true } },
            },
          },
        })
        data = projects.map((p) => {
          const income = (p._sum as any).payments?.amount || 0
          const expense = (p._sum as any).expenses?.amount || 0
          return {
            project: p.name,
            code: p.code,
            status: p.status,
            income,
            expense,
            profit: income - expense,
            margin: income > 0 ? ((income - expense) / income) * 100 : 0,
          }
        })
        break
      }

      case 'income-expense': {
        // Income & Expense summary
        const payments = await db.payment.findMany({
          where: { date: { gte: startDate, lte: endDate }, status: 'completed' },
        })
        const expenses = await db.expense.findMany({
          where: { date: { gte: startDate, lte: endDate } },
        })
        const daybookExpenses = await db.dayBookEntry.findMany({
          where: { date: { gte: startDate, lte: endDate }, type: 'expense' },
        })

        const totalIncome = payments.reduce((s, p) => s + p.amount, 0)
        const projectExpenses = expenses.reduce((s, e) => s + e.amount, 0)
        const daybookExpenseTotal = daybookExpenses.reduce((s, e) => s + e.amount, 0)
        const totalExpense = projectExpenses + daybookExpenseTotal

        data = {
          period: { start: startDate.toISOString(), end: endDate.toISOString() },
          income: { total: totalIncome, transactions: payments.length },
          expense: { projectExpense, daybookExpense: daybookExpenseTotal, total: totalExpense, transactions: expenses.length + daybookExpenses.length },
          net: totalIncome - totalExpense,
        }
        break
      }

      case 'labour': {
        // Labour Report
        const groups = await db.labourGroup.findMany({
          where: { isActive: true },
          include: {
            labours: {
              where: { isActive: true },
              include: {
                _count: { select: { attendance: true, payrolls: true } },
                _sum: {
                  payrolls: { select: { netPay: true, basicPay: true, overtimePay: true, deductions: true } },
                },
              },
            },
          },
        })
        data = groups.map((g) => ({
          group: g.name,
          rate: g.rate,
          labourCount: g.labours.length,
          labours: g.labours.map((l) => ({
            name: l.name,
            dailyRate: l.dailyRate,
            attendanceDays: (l._count as any).attendance,
            totalPay: (l._sum as any).payrolls?.netPay || 0,
            basicPay: (l._sum as any).payrolls?.basicPay || 0,
            overtimePay: (l._sum as any).payrolls?.overtimePay || 0,
            deductions: (l._sum as any).payrolls?.deductions || 0,
          })),
        }))
        break
      }

      case 'attendance': {
        // Attendance Report
        const attendance = await db.attendance.findMany({
          where: { date: { gte: startDate, lte: endDate } },
          include: {
            labour: { select: { name: true, group: { select: { name: true } } } },
          },
          orderBy: [{ date: 'desc' }, { labourId: 'asc' }],
        })
        data = attendance.map((a) => ({
          date: a.date.toISOString().split('T')[0],
          labour: a.labour.name,
          group: a.labour.group?.name || '',
          status: a.status,
          hoursWorked: a.hoursWorked,
          overtime: a.overtime,
        }))
        break
      }

      case 'material': {
        // Material Report
        const materials = await db.material.findMany({
          include: {
            stockMovements: {
              where: { date: { gte: startDate, lte: endDate } },
            },
          },
        })
        data = materials.map((m) => {
          const movements = m.stockMovements
          const totalIn = movements.filter((s) => s.type === 'in').reduce((s, mv) => s + mv.quantity, 0)
          const totalOut = movements.filter((s) => s.type === 'out').reduce((s, mv) => s + mv.quantity, 0)
          return {
            name: m.name,
            code: m.code,
            unit: m.unit,
            currentStock: m.currentStock,
            minStock: m.minStock,
            unitPrice: m.unitPrice,
            stockValue: m.currentStock * m.unitPrice,
            received: totalIn,
            issued: totalOut,
            netMovement: totalIn - totalOut,
          }
        })
        break
      }

      case 'supplier': {
        // Supplier Report
        const suppliers = await db.supplier.findMany({
          include: {
            _count: { select: { purchaseOrders: true } },
            purchaseOrders: {
              where: { orderDate: { gte: startDate, lte: endDate } },
              select: { total: true, status: true },
            },
          },
        })
        data = suppliers.map((s) => {
          const orders = s.purchaseOrders
          const totalOrdered = orders.reduce((sum, o) => sum + o.total, 0)
          return {
            name: s.name,
            code: s.code,
            balance: s.balance,
            isActive: s.isActive,
            totalOrders: orders.length,
            totalOrdered,
            avgOrder: orders.length > 0 ? totalOrdered / orders.length : 0,
          }
        })
        break
      }

      case 'asset': {
        // Asset Report
        const assets = await db.asset.findMany({
          include: {
            _count: { select: { issues: true, maintenance: true } },
          },
        })
        const typeSummary: Record<string, { count: number; totalValue: number; available: number; issued: number; maintenance: number; disposed: number }> = {}
        for (const a of assets) {
          if (!typeSummary[a.type]) typeSummary[a.type] = { count: 0, totalValue: 0, available: 0, issued: 0, maintenance: 0, disposed: 0 }
          const t = typeSummary[a.type]
          t.count++
          t.totalValue += a.currentValue
          if (a.status === 'available') t.available++
          else if (a.status === 'issued') t.issued++
          else if (a.status === 'maintenance') t.maintenance++
          else if (a.status === 'disposed') t.disposed++
        }
        data = {
          summary: Object.entries(typeSummary).map(([type, s]) => ({ type, ...s })),
          assets: assets.map((a) => ({
            name: a.name,
            code: a.code,
            type: a.type,
            category: a.category,
            purchasePrice: a.purchasePrice,
            currentValue: a.currentValue,
            status: a.status,
            location: a.location,
            issueCount: (a._count as any).issues,
            maintenanceCount: (a._count as any).maintenance,
          })),
        }
        break
      }

      default:
        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}