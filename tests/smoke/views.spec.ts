import { test, expect } from '@playwright/test'
import { gotoView, trackBadResponses, trackConsoleErrors } from '../helpers'

// Every client-side view reachable from the /app shell (src/lib/eppm.ts View union).
export const ALL_VIEWS = [
  'dashboard', 'portfolios', 'programs', 'projects', 'compare', 'whatif',
  'wbs', 'activities', 'gantt', 'critical-path', 'milestones',
  'resources', 'equipment', 'workforce', 'costs', 'evm', 'baselines', 'cashflow',
  'risks', 'changes', 'claims', 'lookahead', 'procurement', 'quality', 'hse',
  'documents', 'submittals', 'site-progress', 'commissioning', 'closeout',
  'reports', 'integrations', 'ai-planner', 'admin',
  'maintenance', 'complaints', 'service-requests', 'work-orders',
  'preventive', 'corrective', 'predictive', 'dispatch', 'technicians', 'amc',
  'notifications',
  'tender-packages', 'bid-comparison', 'award-management', 'vendor-prequal',
  'employees', 'vehicles', 'assets', 'stock', 'warehouses', 'stock-movements',
  'purchase-requests', 'purchase-orders', 'suppliers', 'goods-receipt',
  'invoices', 'payments', 'exec-reports', 'financial-reports',
  'sso', 'audit', 'docs', 'tickets', 'customer-portal', 'technician-portal',
  'workflow-engine',
] as const

// Representative subset re-checked on tablet & mobile to keep runtime sane;
// the full sweep runs on desktop.
const CORE_VIEWS = new Set([
  'dashboard', 'projects', 'gantt', 'work-orders', 'complaints', 'notifications',
])

for (const view of ALL_VIEWS) {
  test(`view "${view}" renders clean`, async ({ page }, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop' && !CORE_VIEWS.has(view),
      'full sweep runs on desktop only')

    const errors = trackConsoleErrors(page)
    const bad = trackBadResponses(page)
    await gotoView(page, view)

    await expect(page.locator('main')).toBeVisible()
    // The view must actually render content, not a blank shell.
    const text = (await page.locator('main').innerText()).trim()
    expect(text.length, 'main region should not be empty').toBeGreaterThan(0)

    expect(errors, 'console errors').toEqual([])
    expect(bad, 'HTTP >=400 responses').toEqual([])
  })
}
