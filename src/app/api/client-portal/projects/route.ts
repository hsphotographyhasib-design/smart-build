import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const where: any = {}
    if (clientId) where.clientId = clientId
    if (status) where.status = status

    const projects = await db.project.findMany({
      where,
      include: {
        _count: {
          select: {
            tasks: true,
            documents: true,
            dailyNotes: true,
            invoices: true,
            clientComplaints: true,
            milestones: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Enrich with computed stats
    const enriched = await Promise.all(
      projects.map(async (project) => {
        const completedTasks = await db.projectTask.count({
          where: { projectId: project.id, status: 'completed' },
        })
        const overdueTasks = await db.projectTask.count({
          where: {
            projectId: project.id,
            status: { not: 'completed' },
            endDate: { lt: new Date() },
          },
        })
        const totalInvoiceAmount = await db.invoice.aggregate({
          where: { projectId: project.id, status: { not: 'cancelled' } },
          _sum: { total: true, paidAmount: true },
        })

        return {
          ...JSON.parse(JSON.stringify(project)),
          completedTasks,
          overdueTasks,
          totalInvoiced: totalInvoiceAmount._sum.total || 0,
          totalPaid: totalInvoiceAmount._sum.paidAmount || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enriched,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}
