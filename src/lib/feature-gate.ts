import { getTenantFeatures } from './tenant'
import { NextResponse } from 'next/server'

/** Map of route patterns to feature keys.
 * When a request matches a pattern, the corresponding feature must be enabled.
 * Routes NOT in this map are not gated (public or role-gated only).
 */
export const ROUTE_FEATURE_MAP: Record<string, string> = {
  // Projects & Delivery
  '/api/projects': 'projects',
  '/api/portfolio': 'projects',
  '/api/programs': 'projects',
  '/api/activities': 'projects',
  '/api/wbs': 'projects',
  '/api/gantt': 'projects',
  '/api/baselines': 'projects',
  '/api/milestones': 'projects',
  '/api/lookahead': 'lookahead',
  '/api/site-progress': 'site-progress',
  '/api/submittals': 'submittals',
  '/api/closeout': 'closeout',
  '/api/commissioning': 'commissioning',

  // Tender
  '/api/tender': 'tender',

  // Maintenance
  '/api/maintenance': 'maintenance',
  '/api/complaints': 'complaints',
  '/api/work-orders': 'work-orders',
  '/api/workflow': 'workflow-engine',

  // Resources & HR
  '/api/resources': 'resources',
  '/api/hr': 'hr',
  '/api/employees': 'hr',
  '/api/workforce': 'hr',
  '/api/equipment': 'equipment',
  '/api/vehicles': 'fleet',
  '/api/assets': 'inventory',
  '/api/inventory': 'inventory',
  '/api/stock': 'inventory',
  '/api/warehouses': 'inventory',

  // Procurement
  '/api/procurement': 'procurement',
  '/api/purchase': 'procurement',
  '/api/suppliers': 'procurement',
  '/api/goods-receipt': 'procurement',

  // Finance
  '/api/costs': 'costs',
  '/api/evm': 'evm',
  '/api/cashflow': 'cashflow',
  '/api/changes': 'changes',
  '/api/claims': 'changes',
  '/api/invoices': 'accounts',
  '/api/payments': 'accounts',

  // Reports
  '/api/reports': 'reports',
  '/api/exec-reports': 'exec-reports',
  '/api/daily-reports': 'reports',
  '/api/export': 'reports',

  // AI
  '/api/ai-planner': 'ai-planner',
  '/api/ai': 'ai-planner',
}

/** Find the feature key for a given pathname. Returns null if not gated. */
export function getRequiredFeature(pathname: string): string | null {
  for (const [pattern, feature] of Object.entries(ROUTE_FEATURE_MAP)) {
    if (pathname.startsWith(pattern)) return feature
  }
  return null
}

/** Check if a feature is enabled for a tenant.
 * Returns true if enabled or if no gating applies.
 * Returns a 403 response if disabled.
 */
export async function checkFeatureGate(
  tenantId: string | null | undefined,
  pathname: string
): Promise<NextResponse | null> {
  // Super Admin bypasses all feature gates
  if (!tenantId) return null

  const feature = getRequiredFeature(pathname)
  if (!feature) return null

  const features = await getTenantFeatures(tenantId)
  if (features.get(feature)) return null

  return NextResponse.json(
    {
      error: `${feature} module is disabled for your company.`,
      feature,
      message: 'Contact your administrator or upgrade your plan to access this feature.',
    },
    { status: 403 }
  )
}
