import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!requireRole(user, ['admin', 'supervisor', 'hr_manager', 'accountant', 'store_manager'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    // সকল কোয়েরি সমান্তরালে চালানো হচ্ছে
    const [
      activeProjects,
      paymentsThisMonth,
      outstandingInvoices,
      labourOnSiteToday,
      pendingPurchaseRequests,
      pendingApprovals,
      recentPayments,
      recentActivities,
      upcomingTasks,
      stockAlerts,
    ] = await Promise.all([
      // ১. সক্রিয় প্রকল্পের সংখ্যা
      db.project.count({ where: { status: 'active' } }),

      // ২. এই মাসের আয়
      db.payment.aggregate({
        where: {
          date: { gte: monthStart },
          status: 'completed',
        },
        _sum: { amount: true },
      }),

      // ৩. অপরিশোধিত চালান (প্রেরিত/আংশিক/মেয়াদোত্তীর্ণ - মোট বিয়োগ পরিশোধিত)
      db.invoice.findMany({
        where: { status: { in: ['sent', 'partial', 'overdue'] } },
        select: { total: true, paidAmount: true },
      }),

      // ৪. আজকে কর্মস্থলে উপস্থিত শ্রমিক
      db.attendance.count({
        where: {
          date: todayStart,
          status: { in: ['present', 'half_day', 'overtime'] },
        },
      }),

      // ৫. অমীমাংসিত ক্রয় অনুরোধ
      db.purchaseRequest.count({
        where: { status: { in: ['submitted', 'review'] } },
      }),

      // ৬. অমীমাংসিত অনুমোদন (ক্রয় অনুরোধ + ব্যয়)
      Promise.all([
        db.purchaseRequest.count({ where: { status: { in: ['submitted', 'review'] } } }),
        db.expense.count({ where: { status: 'pending' } }),
      ]).then(([pr, exp]) => pr + exp),

      // ৭. সাম্প্রতিক পেমেন্ট (সর্বশেষ ১০টি)
      db.payment.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          paymentNo: true,
          amount: true,
          method: true,
          status: true,
          date: true,
          receivedBy: true,
          project: { select: { name: true, code: true } },
        },
      }),

      // ৮. সাম্প্রতিক কার্যক্রম (সর্বশেষ ২০টি অডিট লগ)
      db.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          entity: true,
          createdAt: true,
          user: { select: { name: true, avatar: true } },
        },
      }),

      // ৯. আসন্ন কাজ (এই সপ্তাহে সময়সীমা)
      db.projectTask.findMany({
        where: {
          status: { in: ['todo', 'in_progress'] },
          endDate: { gte: todayStart, lte: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
        take: 10,
        orderBy: { endDate: 'asc' },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          endDate: true,
          progress: true,
          project: { select: { name: true, code: true } },
        },
      }),

      // ১০. স্টক সতর্কতা (সর্বনিম্ন স্টকের নিচে থাকা উপকরণ)
      db.material.findMany({
        where: { currentStock: { lte: db.material.fields.minStock } },
        select: {
          id: true,
          name: true,
          code: true,
          currentStock: true,
          minStock: true,
          unit: true,
        },
      }),
    ])

    // অপরিশোধিত পরিমাণ হিসাব করা হচ্ছে
    const outstandingTotal = outstandingInvoices.reduce(
      (sum, inv) => sum + (inv.total - inv.paidAmount),
      0
    )

    // গত ৬ মাসের আয়/ব্যয় ডেটা (চার্ট ডেটা)
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [paymentsByMonth, expensesByMonth] = await Promise.all([
      // মাস অনুযায়ী আয় (পেমেন্ট)
      db.$queryRawUnsafe<Array<{ month: string; total: number }>>(`
        SELECT
          strftime('%Y-%m', date) as month,
          SUM(amount) as total
        FROM Payment
        WHERE date >= ? AND status = 'completed'
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
      `, sixMonthsAgo.toISOString()),

      // মাস অনুযায়ী ব্যয়
      db.$queryRawUnsafe<Array<{ month: string; total: number }>>(`
        SELECT
          strftime('%Y-%m', date) as month,
          SUM(amount) as total
        FROM Expense
        WHERE date >= ? AND status = 'approved'
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
      `, sixMonthsAgo.toISOString()),
    ])

    // গত ৬ মাসের জন্য মাসের লেবেল তৈরি করা হচ্ছে
    const monthLabels: string[] = []
    const revenueData: number[] = []
    const expenseData: number[] = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthLabels.push(label)

      const paymentMonth = paymentsByMonth.find((p) => p.month === monthKey)
      const expenseMonth = expensesByMonth.find((e) => e.month === monthKey)

      revenueData.push(paymentMonth?.total || 0)
      expenseData.push(expenseMonth?.total || 0)
    }

    // প্রকল্পের অগ্রগতি ডেটা
    const projectProgress = await db.project.findMany({
      where: { status: { in: ['active', 'on_hold'] } },
      select: {
        id: true,
        name: true,
        code: true,
        progress: true,
        budget: true,
        startDate: true,
        endDate: true,
        _count: {
          select: { tasks: { where: { status: 'completed' } } },
        },
        tasks: {
          select: { status: true },
        },
      },
    })

    const projectProgressData = projectProgress.map((p) => {
      const totalTasks = p.tasks.length
      const completedTasks = p.tasks.filter((t) => t.status === 'completed').length
      return {
        id: p.id,
        name: p.name,
        code: p.code,
        progress: p.progress,
        budget: p.budget,
        totalTasks,
        completedTasks,
        taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      }
    })

    // এই মাসের মোট ব্যয়
    const expensesThisMonth = await db.expense.aggregate({
      where: {
        date: { gte: monthStart },
        status: 'approved',
      },
      _sum: { amount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        activeProjects,
        revenueThisMonth: paymentsThisMonth._sum.amount || 0,
        expensesThisMonth: expensesThisMonth._sum.amount || 0,
        outstandingInvoices: outstandingTotal,
        labourOnSiteToday,
        pendingPurchaseRequests,
        pendingApprovals,
        recentPayments,
        recentActivities: recentActivities.map((a) => ({
          ...a,
          userName: a.user?.name || 'System',
        })),
        upcomingTasks,
        stockAlerts,
        chartData: {
          months: monthLabels,
          revenue: revenueData,
          expenses: expenseData,
        },
        projectProgress: projectProgressData,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}