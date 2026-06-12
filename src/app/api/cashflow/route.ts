import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // Income from payments
    const payments = await db.payment.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        status: 'completed',
      },
      select: { amount: true, date: true, method: true },
    })

    // Expenses from daybook
    const expenses = await db.dayBookEntry.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        type: 'expense',
      },
      select: { amount: true, date: true, category: true },
    })

    const incomeByDay: Record<string, number> = {}
    const expenseByDay: Record<string, number> = {}

    for (const p of payments) {
      const day = p.date.toISOString().split('T')[0]
      incomeByDay[day] = (incomeByDay[day] || 0) + p.amount
    }

    for (const e of expenses) {
      const day = e.date.toISOString().split('T')[0]
      expenseByDay[day] = (expenseByDay[day] || 0) + e.amount
    }

    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Build daily flow
    const days: { date: string; income: number; expense: number; net: number }[] = []
    const current = new Date(startDate)
    while (current <= endDate) {
      const key = current.toISOString().split('T')[0]
      const income = incomeByDay[key] || 0
      const expense = expenseByDay[key] || 0
      days.push({ date: key, income, expense, net: income - expense })
      current.setDate(current.getDate() + 1)
    }

    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        totalIncome,
        totalExpense,
        netCashflow: totalIncome - totalExpense,
        days,
        incomeCount: payments.length,
        expenseCount: expenses.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}