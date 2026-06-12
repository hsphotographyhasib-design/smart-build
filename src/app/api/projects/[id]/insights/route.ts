import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    // Budget
    const project = await db.project.findUnique({ where: { id: projectId }, select: { budget: true } })
    const budgetTotal = project?.budget ?? 0

    const [expenseAgg, commitmentAgg, openItems, rfis, directCosts, changeEvents, teamCount] = await Promise.all([
      db.expense.aggregate({ where: { projectId, status: 'approved' }, _sum: { amount: true } }),
      db.projectCommitment.aggregate({ where: { projectId, status: 'active' }, _sum: { committedCost: true } }),
      db.openItem.findMany({ where: { projectId }, select: { status: true } }),
      db.rFI.findMany({ where: { projectId }, select: { status: true } }),
      db.directCost.findMany({ where: { projectId }, select: { category: true, amount: true } }),
      db.changeEvent.findMany({ where: { projectId }, select: { status: true } }),
      db.projectTeamMember.count({ where: { projectId, isActive: true } }),
    ])

    const budgetUsed = expenseAgg._sum.amount ?? 0
    const totalCommitments = commitmentAgg._sum.committedCost ?? 0

    // Open items summary
    const openItemsSummary: Record<string, number> = {}
    openItems.forEach(oi => { openItemsSummary[oi.status] = (openItemsSummary[oi.status] || 0) + 1 })

    // RFI breakdown
    const rfiBreakdown: Record<string, number> = {}
    rfis.forEach(r => { rfiBreakdown[r.status] = (rfiBreakdown[r.status] || 0) + 1 })

    // Direct costs by category
    const categoryMap: Record<string, number> = {}
    directCosts.forEach(c => { categoryMap[c.category] = (categoryMap[c.category] || 0) + c.amount })
    const costsByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
    }))

    // Change events summary
    const ceSummary: Record<string, number> = { total: changeEvents.length }
    changeEvents.forEach(ce => { ceSummary[ce.status] = (ceSummary[ce.status] || 0) + 1 })

    return NextResponse.json({
      success: true,
      data: {
        budgetUsed,
        totalCommitments,
        openItemsCount: (openItemsSummary.open ?? 0) + (openItemsSummary.pending ?? 0) + (openItemsSummary.in_review ?? 0),
        pendingRfisCount: (rfiBreakdown.draft ?? 0) + (rfiBreakdown.submitted ?? 0) + (rfiBreakdown.under_review ?? 0),
        teamSize: teamCount,
        openItemsSummary,
        rfiBreakdown,
        costsByCategory,
        changeEventsSummary: ceSummary,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}