import { NextResponse } from 'next/server'
import { getSessionPayload } from '@/lib/auth-server'
import { getTenantFeatures, getSubscriptionLimits, getTenantUserCount, getTenantProjectCount } from '@/lib/tenant'

export async function GET() {
  try {
    const session = await getSessionPayload()

    // Super Admin has no tenant — all features enabled implicitly
    if (!session?.tenantId) {
      return NextResponse.json({
        features: {},
        limits: null,
        isSuperAdmin: true,
      })
    }

    const tenantId = session.tenantId

    // Fetch features and subscription limits in parallel
    const [featureMap, limits, currentUsers, currentProjects] = await Promise.all([
      getTenantFeatures(tenantId),
      getSubscriptionLimits(tenantId),
      getTenantUserCount(tenantId),
      getTenantProjectCount(tenantId),
    ])

    // Convert Map to plain Record
    const features: Record<string, boolean> = {}
    for (const [key, value] of featureMap) {
      features[key] = value
    }

    return NextResponse.json({
      features,
      limits: {
        maxUsers: limits.maxUsers,
        maxProjects: limits.maxProjects,
        currentUsers,
        currentProjects,
        plan: limits.planFeatures, // Array of feature strings from plan
      },
      isSuperAdmin: false,
    })
  } catch (error) {
    console.error('[/api/features] Error:', error)
    return NextResponse.json(
      { features: {}, limits: null, isSuperAdmin: false, error: 'Failed to load features' },
      { status: 500 }
    )
  }
}
