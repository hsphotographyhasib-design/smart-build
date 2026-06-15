import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAuth, requireRole } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!requireRole(user, ['admin','supervisor','hr_manager','accountant','store_manager','auditor','client'])) {
      return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions.' }, { status: 403 })
    }

    const { id } = await params

    const project = await db.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatar: true, role: true } },
          },
        },
        milestones: { orderBy: { dueDate: 'asc' } },
        tasks: { select: { id: true, status: true, priority: true } },
      },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // কর্মক্ষমতা সূচক (KPI) গণনা করা হচ্ছে
    const totalTasks = project.tasks.length
    const todoTasks = project.tasks.filter((t) => t.status === 'todo').length
    const inProgressTasks = project.tasks.filter((t) => t.status === 'in_progress').length
    const completedTasks = project.tasks.filter((t) => t.status === 'completed').length
    const cancelledTasks = project.tasks.filter((t) => t.status === 'cancelled').length
    const highPriorityTasks = project.tasks.filter((t) => t.priority === 'high' || t.priority === 'critical').length

    // আর্থিক কর্মক্ষমতা সূচক (KPI)
    const [invoiceAgg, paymentAgg, expenseAgg] = await Promise.all([
      db.invoice.aggregate({
        where: { projectId: id },
        _sum: { total: true, paidAmount: true },
      }),
      db.payment.aggregate({
        where: { projectId: id, status: 'completed' },
        _sum: { amount: true },
      }),
      db.expense.aggregate({
        where: { projectId: id, status: 'approved' },
        _sum: { amount: true },
      }),
    ])

    const totalInvoiced = invoiceAgg._sum.total || 0
    const totalPaid = paymentAgg._sum.amount || 0
    const totalExpenses = expenseAgg._sum.amount || 0
    const budgetUtilization = project.budget > 0 ? Math.round((totalExpenses / project.budget) * 100) : 0
    const pendingInvoices = totalInvoiced - (invoiceAgg._sum.paidAmount || 0)

    // নির্ধারিত তারিখ অতিক্রান্ত অপেক্ষমান কাজসমূহ
    const overdueTasks = await db.projectTask.count({
      where: {
        projectId: id,
        status: { in: ['todo', 'in_progress'] },
        endDate: { lt: new Date() },
      },
    })

    const data = {
      id: project.id,
      name: project.name,
      code: project.code,
      description: project.description,
      status: project.status,
      progress: project.progress,
      budget: project.budget,
      startDate: project.startDate?.toISOString() ?? null,
      endDate: project.endDate?.toISOString() ?? null,
      address: project.address,
      clientId: project.clientId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      members: project.members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: m.user,
      })),
      milestones: project.milestones.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        dueDate: m.dueDate?.toISOString() ?? null,
        status: m.status,
      })),
      kpis: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
        highPriorityTasks,
        overdueTasks,
        taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        totalInvoiced,
        totalPaid,
        totalExpenses,
        pendingInvoices,
        budgetUtilization,
        budgetRemaining: project.budget - totalExpenses,
      },
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Project detail error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}