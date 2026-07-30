import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/tenant'

// ---------- Types ----------
interface FeatureRow {
  module: string
  enabled: boolean
  config: string | null
}

interface TenantFeatureResponse {
 id: string
  slug: string
  name: string
  email: string
  status: string
  tier: string
  maxUsers: number
  maxProjects: number
  maxStorage: number
  currentUsers: number
  currentProjects: number
  currentStorage: number
  subscription: {
    planId: string
    planName: string
    status: string
  } | null
  features: Record<string, boolean>
}

// ---------- GET: List all tenants with their features ----------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (tenantId) {
      // Single tenant lookup
      const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
        include: {
          subscription: { include: { plan: true } },
          features: true,
          _count: { select: { users: true, branches: true } },
        },
      })

      if (!tenant) {
        return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
      }

      const featureMap: Record<string, boolean> = {}
      for (const f of tenant.features) {
        featureMap[f.module] = f.enabled
      }

      return NextResponse.json({
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          email: tenant.email,
          status: tenant.status,
          tier: tenant.tier,
          maxUsers: tenant.maxUsers,
          maxProjects: tenant.maxProjects,
          maxStorage: tenant.maxStorage,
          currentUsers: tenant.currentUsers,
          currentProjects: tenant.currentProjects,
          currentStorage: tenant.currentStorage,
          subscription: tenant.subscription
            ? {
                planId: tenant.subscription.planId,
                planName: tenant.subscription.plan.name,
                status: tenant.subscription.status,
              }
            : null,
          userCount: tenant._count.users,
          branchCount: tenant._count.branches,
        },
        features: featureMap,
      })
    }

    // All tenants with features
    const tenants = await db.tenant.findMany({
      include: {
        subscription: { include: { plan: true } },
        features: true,
        _count: { select: { users: true, branches: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result: TenantFeatureResponse[] = tenants.map((t) => {
      const featureMap: Record<string, boolean> = {}
      for (const f of t.features) {
        featureMap[f.module] = f.enabled
      }
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        email: t.email,
        status: t.status,
        tier: t.tier,
        maxUsers: t.maxUsers,
        maxProjects: t.maxProjects,
        maxStorage: t.maxStorage,
        currentUsers: t.currentUsers,
        currentProjects: t.currentProjects,
        currentStorage: t.currentStorage,
        subscription: t.subscription
          ? {
              planId: t.subscription.planId,
              planName: t.subscription.plan.name,
              status: t.subscription.status,
            }
          : null,
        features: featureMap,
      }
    })

    return NextResponse.json({ tenants: result })
  } catch (error) {
    console.error('[GET /api/platform/features]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---------- PATCH: Bulk update features for a tenant ----------
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, features, updatedBy } = body as {
      tenantId: string
      features: Record<string, boolean>
      updatedBy?: string
    }

    if (!tenantId || !features || typeof features !== 'object') {
      return NextResponse.json(
        { error: 'tenantId and features (Record<string, boolean>) are required' },
        { status: 400 }
      )
    }

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      include: { features: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Build a map of existing features for comparison
    const existingMap: Record<string, boolean> = {}
    for (const f of tenant.features) {
      existingMap[f.module] = f.enabled
    }

    // Process each feature change
    const updates: Promise<unknown>[] = []
    const auditLogs: Promise<unknown>[] = []

    for (const [module, enabled] of Object.entries(features)) {
      const oldValue = existingMap[module] ?? false
      const newValue = Boolean(enabled)

      if (oldValue === newValue) continue // No change

      // Upsert the feature
      updates.push(
        db.tenantFeature.upsert({
          where: { tenantId_module: { tenantId, module } },
          update: { enabled: newValue },
          create: { tenantId, module, enabled: newValue },
        })
      )

      // Create audit log
      auditLogs.push(
        createAuditLog({
          tenantId,
          userId: updatedBy || undefined,
          userName: updatedBy || 'Super Admin',
          action: newValue ? 'feature.enabled' : 'feature.disabled',
          resource: 'feature',
          resourceId: module,
          details: JSON.stringify({
            oldValue,
            newValue,
            module,
          }),
          level: 'info',
        })
      )
    }

    if (updates.length === 0) {
      return NextResponse.json({
        message: 'No changes applied',
        changedCount: 0,
      })
    }

    await Promise.all([...updates, ...auditLogs])

    return NextResponse.json({
      message: `${updates.length} feature(s) updated for tenant`,
      changedCount: updates.length,
    })
  } catch (error) {
    console.error('[PATCH /api/platform/features]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
