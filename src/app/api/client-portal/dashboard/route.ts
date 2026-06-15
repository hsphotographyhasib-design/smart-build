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

    // টেন্যান্ট আইসোলেশন সহ where ক্লজ তৈরি করা হচ্ছে
    const projectWhere: any = {
      status: { in: ['planning', 'active', 'on_hold'] },
    }
    if (user.role === 'client') {
      projectWhere.clientId = user.id
    }

    // প্রজেক্ট পাওয়া হচ্ছে (ক্লায়েন্ট ভূমিকার জন্য clientId দিয়ে ফিল্টার করা হচ্ছে)
    const projects = await db.project.findMany({
      where: projectWhere,
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        progress: true,
        budget: true,
        startDate: true,
        endDate: true,
        clientId: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // সক্রিয় প্রজেক্ট গণনা
    const activeProjects = projects.filter((p) => p.status === 'active').length

    // সক্রিয় প্রজেক্টে গড় অগ্রগতি
    const avgProgress = activeProjects > 0
      ? Math.round(projects.filter((p) => p.status === 'active').reduce((sum, p) => sum + p.progress, 0) / activeProjects)
      : 0

    // বিলম্বিত ইনভয়েস (পাঠানো, আংশিক, বিলম্বিত)
    const projectIds = projects.map((p) => p.id)
    const pendingInvoices = await db.invoice.findMany({
      where: {
        projectId: { in: projectIds },
        status: { in: ['sent', 'partial', 'overdue'] },
      },
    })
    const pendingInvoiceCount = pendingInvoices.length
    const pendingInvoiceTotal = pendingInvoices.reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0)

    // খোলা অভিযোগ
    const openComplaints = await db.clientComplaint.count({
      where: {
        projectId: { in: projectIds },
        status: { in: ['open', 'acknowledged', 'investigating', 'resolving'] },
      },
    })

    // সন্তুষ্টি মেট্রিকের জন্য সমাধান করা অভিযোগ
    const resolvedComplaints = await db.clientComplaint.count({
      where: {
        projectId: { in: projectIds },
        status: { in: ['resolved', 'closed'] },
      },
    })
    const totalComplaints = openComplaints + resolvedComplaints
    const satisfactionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100

    // সাম্প্রতিক ডকুমেন্ট
    const recentDocuments = await db.projectDocument.findMany({
      where: { projectId: { in: projectIds } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } } },
    })

    // সাম্প্রতিক দৈনিক নোট
    const recentNotes = await db.dailyNote.findMany({
      where: { projectId: { in: projectIds } },
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        supervisor: { select: { id: true, name: true } },
      },
    })

    // সাম্প্রতিক অভিযোগ
    const recentComplaints = await db.clientComplaint.findMany({
      where: { projectId: { in: projectIds } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } } },
    })

    // কার্যকলাপ ফিড তৈরি করা হচ্ছে
    const activityFeed = [
      ...recentDocuments.map((d) => ({
        type: 'document' as const,
        title: d.name,
        detail: d.project.name,
        timestamp: d.createdAt.toISOString(),
      })),
      ...recentNotes.map((n) => ({
        type: 'daily_note' as const,
        title: `Site update for ${n.project.name}`,
        detail: `by ${n.supervisor.name}`,
        timestamp: n.createdAt.toISOString(),
      })),
      ...recentComplaints.map((c) => ({
        type: 'complaint' as const,
        title: c.subject,
        detail: c.project.name,
        timestamp: c.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          activeProjects,
          pendingInvoiceCount,
          pendingInvoiceTotal,
          openComplaints,
          avgProgress,
          satisfactionRate,
        },
        projects: JSON.parse(JSON.stringify(projects)),
        recentActivity: activityFeed,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed' }, { status: 500 })
  }
}
