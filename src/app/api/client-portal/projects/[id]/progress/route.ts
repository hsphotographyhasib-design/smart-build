import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // ক্লায়েন্ট পোর্টাল অ্যাক্সেস নিয়ন্ত্রণ
    if (!['client', 'super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Access denied. Client portal only.' }, { status: 403 })
    }

    const { id } = await params

    // ক্লায়েন্ট ভূমিকার জন্য, প্রজেক্টটি তাদের নিজের কিনা যাচাই করা হচ্ছে
    if (user.role === 'client') {
      const ownershipCheck = await db.project.findUnique({
        where: { id },
        select: { clientId: true },
      })
      if (!ownershipCheck || ownershipCheck.clientId !== user.id) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
      }
    }

    const project = await db.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        status: true,
        progress: true,
        budget: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    })

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    // কাজের পরিসংখ্যান
    const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      db.projectTask.count({ where: { projectId: id } }),
      db.projectTask.count({ where: { projectId: id, status: 'completed' } }),
      db.projectTask.count({ where: { projectId: id, status: 'in_progress' } }),
      db.projectTask.count({
        where: { projectId: id, status: { not: 'completed' }, endDate: { lt: new Date() } },
      }),
    ])

    // মাইলস্টোন
    const milestones = await db.projectMilestone.findMany({
      where: { projectId: id },
      orderBy: { dueDate: 'asc' },
    })

    // সাম্প্রতিক দৈনিক নোট (শেষ ১০টি)
    const recentNotes = await db.dailyNote.findMany({
      where: { projectId: id },
      take: 10,
      orderBy: { date: 'desc' },
      include: {
        supervisor: { select: { name: true } },
      },
    })

    // ফটো ডকুমেন্ট
    const photos = await db.projectDocument.findMany({
      where: { projectId: id, type: 'photo' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // অগ্রগতি টাইমলাইন: দৈনিক নোট এবং কাজ থেকে মাসিক অগ্রগতি হিসাব করা হচ্ছে
    const tasksByStatus = await db.projectTask.groupBy({
      by: ['status'],
      where: { projectId: id },
      _count: true,
    })
    const statusBreakdown = tasksByStatus.map((t) => ({
      status: t.status,
      count: t._count,
    }))

    return NextResponse.json({
      success: true,
      data: {
        project: JSON.parse(JSON.stringify(project)),
        taskStats: { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, overdue: overdueTasks },
        milestones: JSON.parse(JSON.stringify(milestones)),
        recentNotes: JSON.parse(JSON.stringify(recentNotes)),
        photos: JSON.parse(JSON.stringify(photos)),
        statusBreakdown,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}
