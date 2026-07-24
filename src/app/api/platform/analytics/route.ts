import { NextResponse } from 'next/server'
import { getSuperAdminUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  const admin = await getSuperAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [totalTenants, activeTenants, trialTenants, suspendedTenants, expiredTenants,
         totalUsers, activeUsers, totalProjects, totalBranches, recentLogs] =
    await Promise.all([
      db.tenant.count(),
      db.tenant.count({ where: { status: 'Active' } }),
      db.tenant.count({ where: { status: 'Trial' } }),
      db.tenant.count({ where: { status: 'Suspended' } }),
      db.tenant.count({ where: { status: 'Expired' } }),
      db.appUser.count({ where: { active: true, tenantId: { not: null } } }),
      db.appUser.count({ where: { active: true } }),
      db.project.count(),
      db.branch.count(),
      db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ])

  // Revenue estimation
  const subscriptions = await db.tenantSubscription.findMany({
    where: { status: 'Active' },
    include: { plan: true, tenant: true },
  })
  const monthlyRevenue = subscriptions.reduce((sum, s) => sum + (s.plan.priceMonthly || 0), 0)
  const annualRevenue = monthlyRevenue * 12

  // Tenant tier distribution
  const tierDist = await db.tenant.groupBy({ by: ['tier'], _count: true })

  return NextResponse.json({
    totalTenants, activeTenants, trialTenants, suspendedTenants, expiredTenants,
    totalUsers, activeUsers, totalProjects, totalBranches,
    monthlyRevenue, annualRevenue,
    tierDistribution: tierDist.map(t => ({ tier: t.tier, count: t._count })),
    recentAuditLogs: recentLogs,
  })
}