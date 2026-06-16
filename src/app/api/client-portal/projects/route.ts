import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // ক্লায়েন্ট পোর্টাল অ্যাক্সেস নিয়ন্ত্রণ
    if (!['client', 'super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied. Client portal only.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const where: any = {}
    if (user.role === 'client') {
      // ক্লায়েন্ট ভূমিকা: সবসময় তাদের নিজের ID দিয়ে ফিল্টার করুন, কুয়েরি প্যারামিটার উপেক্ষা করুন
      where.clientId = user.id
    } else {
      // অ্যাডমিন/super_admin: সাপোর্টের জন্য clientId কুয়েরি প্যারামিটার অনুমোদন করুন
      if (clientId) where.clientId = clientId
    }
    if (status) where.status = status

    const projects = await db.project.findMany({
      where,
      include: {
        _count: {
          select: {
            projectTask: true,
            projectDocument: true,
            dailyNote: true,
            invoice: true,
            clientComplaint: true,
            projectMilestone: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // গণনা করা পরিসংখ্যান সহ সমৃদ্ধ করা হচ্ছে
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
