import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { isSuperAdminRole } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Super Admin sees platform analytics
  if (isSuperAdminRole(user.role)) {
    const [totalTenants, totalUsers, totalProjects] = await Promise.all([
      db.tenant.count({ where: { status: 'Active' } }),
      db.appUser.count({ where: { active: true, tenantId: { not: null } } }),
      db.project.count(),
    ])
    return NextResponse.json({
      mode: 'platform',
      kpis: {
        totalTenants, totalUsers, totalProjects,
        monthlyRevenue: 0, // calculated from subscriptions
        activeUsers: totalUsers,
        storageUsed: 0,
      },
    })
  }

  // Tenant user sees their tenant's data
  const tenantId = user.tenantId
  if (!tenantId) return NextResponse.json({ error: 'No tenant context' }, { status: 403 })

  const [portfolioCount, projectCount, projectData, resourceCount, riskCount, activeUsers, activityCount] = await Promise.all([
    db.portfolio.count({ where: { tenantId } }),
    db.project.count({ where: { tenantId } }),
    db.project.findMany({ where: { tenantId }, select: { status: true, health: true, budget: true, actualCost: true, progress: true } }),
    db.resource.count({ where: { tenantId } }),
    db.risk.count({ where: { tenantId, status: 'Open' } }),
    db.appUser.count({ where: { tenantId, active: true } }),
    db.activity.count({ where: { tenantId } }),
  ])

  const totalBudget = projectData.reduce((s, p) => s + (p.budget || 0), 0)
  const totalActual = projectData.reduce((s, p) => s + (p.actualCost || 0), 0)
  const avgProgress = projectData.length ? projectData.reduce((s, p) => s + (p.progress || 0), 0) / projectData.length : 0
  const healthDist: Record<string, number> = { Green: 0, Yellow: 0, Red: 0 }
  const statusDist: Record<string, number> = { Active: 0, 'On Hold': 0, Completed: 0, Cancelled: 0 }
  for (const p of projectData) {
    healthDist[p.health] = (healthDist[p.health] || 0) + 1
    statusDist[p.status] = (statusDist[p.status] || 0) + 1
  }

  return NextResponse.json({
    mode: 'tenant',
    tenant: { id: tenantId, name: user.tenant?.name || '', slug: user.tenant?.slug || '' },
    kpis: {
      portfolioCount, projectCount, resourceCount, riskCount, activeUsers, activityCount,
      totalBudget, totalActual, avgProgress: Math.round(avgProgress),
    },
    projectHealth: healthDist,
    projectStatus: statusDist,
  })
}