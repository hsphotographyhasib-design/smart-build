import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const project = await db.project.findUnique({
      where: { id },
      select: { id: true, budget: true, name: true, code: true },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const [invoices, payments, expenses] = await Promise.all([
      db.invoice.findMany({
        where: { projectId: id },
        orderBy: { issueDate: 'desc' },
        take: 50,
        select: {
          id: true,
          invoiceNo: true,
          type: true,
          status: true,
          issueDate: true,
          dueDate: true,
          subtotal: true,
          tax: true,
          total: true,
          paidAmount: true,
        },
      }),
      db.payment.findMany({
        where: { projectId: id },
        orderBy: { date: 'desc' },
        take: 50,
        select: {
          id: true,
          paymentNo: true,
          amount: true,
          method: true,
          status: true,
          date: true,
          receivedBy: true,
          reference: true,
        },
      }),
      db.expense.findMany({
        where: { projectId: id },
        orderBy: { date: 'desc' },
        take: 50,
        select: {
          id: true,
          category: true,
          description: true,
          amount: true,
          date: true,
          status: true,
        },
      }),
    ])

    // সমষ্টিগত হিসাব
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPaidOnInvoices = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
    const totalPayments = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
    const totalExpenses = expenses
      .filter((e) => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0)
    const pendingExpenses = expenses
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0)

    const data = {
      summary: {
        totalInvoiced,
        totalPaidOnInvoices,
        totalPayments,
        totalExpenses,
        pendingExpenses,
        budget: project.budget,
        budgetUtilization: project.budget > 0 ? Math.round((totalExpenses / project.budget) * 100) : 0,
        budgetRemaining: project.budget - totalExpenses,
        outstandingInvoices: totalInvoiced - totalPaidOnInvoices,
      },
      invoices: invoices.map((inv) => ({
        ...inv,
        issueDate: inv.issueDate.toISOString(),
        dueDate: inv.dueDate?.toISOString() ?? null,
        balance: inv.total - inv.paidAmount,
      })),
      payments: payments.map((p) => ({
        ...p,
        date: p.date.toISOString(),
      })),
      expenses: expenses.map((e) => ({
        ...e,
        date: e.date.toISOString(),
      })),
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Project finance error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}