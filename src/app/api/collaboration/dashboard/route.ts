import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const now = new Date()

    // গণনা
    const [openRfis, pendingSubmittals, activeDiscussions, openItems, pendingChangeEvents] = await Promise.all([
      db.rFI.count({ where: { status: { in: ['submitted', 'under_review'] } } }),
      db.submittal.count({ where: { status: { in: ['submitted', 'under_review'] } } }),
      db.discussion.count({ where: { status: { in: ['open', 'in_progress'] } } }),
      db.openItem.count({ where: { status: { in: ['open', 'pending', 'in_review'] } } }),
      db.changeEvent.count({ where: { status: { in: ['open', 'review'] } } }),
    ])

    // অতিক্রান্ত আইটেম: যেসব RFI, সাবমিটাল, উন্মুক্ত আইটেমের নির্ধারিত তারিখ < বর্তমান এবং সমাধান হয়নি
    const overdueRfis = await db.rFI.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['answered', 'closed'] },
      },
    })
    const overdueSubmittals = await db.submittal.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['approved', 'rejected', 'for_info'] },
      },
    })
    const overdueOpenItems = await db.openItem.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['resolved', 'closed'] },
      },
    })
    const overdueDiscussions = await db.discussion.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['resolved', 'closed'] },
      },
    })
    const totalOverdue = overdueRfis + overdueSubmittals + overdueOpenItems + overdueDiscussions

    // বিভাগ অনুযায়ী বিভাজন
    const rfiCategories = await db.rFI.groupBy({ by: ['category'], _count: true })
    const discussionCategories = await db.discussion.groupBy({ by: ['category'], _count: true })
    const openItemCategories = await db.openItem.groupBy({ by: ['category'], _count: true })
    const submittalCategories = await db.submittal.groupBy({ by: ['category'], _count: true })

    const categoryBreakdown: Record<string, number> = {}
    for (const item of rfiCategories) categoryBreakdown[`RFI: ${item.category}`] = item._count
    for (const item of discussionCategories) categoryBreakdown[`Discussion: ${item.category}`] = item._count
    for (const item of openItemCategories) categoryBreakdown[`Open Item: ${item.category}`] = item._count
    for (const item of submittalCategories) categoryBreakdown[`Submittal: ${item.category}`] = item._count

    // সাম্প্রতিক কার্যকলাপ - একাধিক টেবিল থেকে সংগ্রহ করা হচ্ছে
    const [recentRfis, recentDiscussions, recentSubmittals, recentChangeEvents] = await Promise.all([
      db.rFI.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { project: { select: { id: true, name: true } } },
      }),
      db.discussion.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { project: { select: { id: true, name: true } } },
      }),
      db.submittal.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { project: { select: { id: true, name: true } } },
      }),
      db.changeEvent.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { project: { select: { id: true, name: true } } },
      }),
    ])

    const recentActivity = [
      ...recentRfis.map((r) => ({ type: 'rfi' as const, title: r.title, projectName: r.project.name, status: r.status, updatedAt: r.updatedAt.toISOString() })),
      ...recentDiscussions.map((d) => ({ type: 'discussion' as const, title: d.title, projectName: d.project.name, status: d.status, updatedAt: d.updatedAt.toISOString() })),
      ...recentSubmittals.map((s) => ({ type: 'submittal' as const, title: s.title, projectName: s.project.name, status: s.status, updatedAt: s.updatedAt.toISOString() })),
      ...recentChangeEvents.map((c) => ({ type: 'change_event' as const, title: c.title, projectName: c.project.name, status: c.status, updatedAt: c.updatedAt.toISOString() })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 15)

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          openRfis,
          pendingSubmittals,
          activeDiscussions,
          openItems,
          pendingChangeEvents,
          totalOverdue,
        },
        overdue: {
          rfis: overdueRfis,
          submittals: overdueSubmittals,
          openItems: overdueOpenItems,
          discussions: overdueDiscussions,
        },
        categoryBreakdown,
        recentActivity,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}