// Shared EPPM client-side types (mirror API shapes loosely)
export type View =
  | 'dashboard' | 'portfolios' | 'programs' | 'projects' | 'compare' | 'whatif'
  | 'wbs' | 'activities' | 'gantt' | 'critical-path' | 'milestones'
  | 'resources' | 'equipment' | 'workforce' | 'costs' | 'evm' | 'baselines' | 'cashflow'
  | 'risks' | 'changes' | 'claims' | 'lookahead' | 'procurement' | 'quality' | 'hse'
  | 'documents' | 'submittals' | 'site-progress' | 'commissioning' | 'closeout' | 'reports' | 'integrations' | 'ai-planner' | 'admin'
  | 'maintenance' | 'complaints' | 'service-requests' | 'work-orders'
  | 'preventive' | 'corrective' | 'predictive' | 'dispatch' | 'technicians' | 'amc'
  | 'notifications'
  | 'tender-packages' | 'bid-comparison' | 'award-management' | 'vendor-prequal'
  | 'employees' | 'vehicles' | 'assets' | 'stock' | 'warehouses' | 'stock-movements'
  | 'purchase-requests' | 'purchase-orders' | 'suppliers' | 'goods-receipt'
  | 'invoices' | 'payments' | 'exec-reports' | 'financial-reports'
  | 'sso' | 'audit' | 'docs' | 'tickets' | 'customer-portal' | 'technician-portal'
  | 'workflow-engine'

/** Maps each View to its canonical feature key for subscription gating. */
export const VIEW_FEATURE_MAP: Record<string, string> = {
  // Dashboard
  dashboard: 'dashboard',

  // Projects & Scheduling (core project delivery)
  portfolios: 'projects',
  programs: 'projects',
  projects: 'projects',
  compare: 'projects',
  whatif: 'projects',
  wbs: 'projects',
  activities: 'projects',
  gantt: 'projects',
  'critical-path': 'projects',
  milestones: 'projects',
  documents: 'projects',
  risks: 'risks',

  // Project-specific features
  'site-progress': 'site-progress',
  submittals: 'submittals',
  closeout: 'closeout',
  lookahead: 'lookahead',
  baselines: 'baselines',

  // Tender & Bid
  'tender-packages': 'tender',
  'bid-comparison': 'tender',
  'award-management': 'tender',
  'vendor-prequal': 'tender',

  // Quality & HSE
  quality: 'quality',
  hse: 'hse',
  commissioning: 'commissioning',

  // Maintenance
  maintenance: 'maintenance',
  complaints: 'complaints',
  'service-requests': 'complaints',
  'work-orders': 'work-orders',
  preventive: 'maintenance',
  corrective: 'maintenance',
  predictive: 'maintenance',
  dispatch: 'maintenance',
  technicians: 'maintenance',
  amc: 'maintenance',
  'workflow-engine': 'workflow-engine',

  // Resources
  resources: 'resources',
  workforce: 'hr',
  employees: 'hr',
  equipment: 'equipment',
  vehicles: 'fleet',
  assets: 'inventory',

  // Inventory
  stock: 'inventory',
  warehouses: 'inventory',
  'stock-movements': 'inventory',

  // Procurement
  procurement: 'procurement',
  'purchase-requests': 'procurement',
  'purchase-orders': 'procurement',
  suppliers: 'procurement',
  'goods-receipt': 'procurement',

  // Finance
  costs: 'costs',
  evm: 'costs',
  cashflow: 'costs',
  'financial-reports': 'costs',
  changes: 'changes',
  claims: 'changes',
  invoices: 'accounts',
  payments: 'accounts',

  // Reports & Intelligence
  reports: 'reports',
  'exec-reports': 'exec-reports',
  'ai-planner': 'ai-planner',

  // Administration
  integrations: 'integrations',
  sso: 'security',
  audit: 'security',
  // admin: no feature (gated by tier)

  // Support & Portals
  docs: 'support',
  tickets: 'support',
  'customer-portal': 'portals',
  'technician-portal': 'portals',

  // Other
  notifications: 'notifications',
}

export interface Kpis {
  portfolios: number; programs: number; projects: number; activities: number
  resources: number; risks: number; openRisks: number; highRisks: number
  totalBudget: number; totalActual: number; totalForecast: number; totalRevenue: number
  totalCommitted: number; grossProfit: number; avgProgress: number
  delayedActivities: number; criticalActivities: number; avgFloat: number; pendingChanges: number
}

export interface ProjectLite {
  id: string; code: string; name: string; status: string; health: string
  category?: string | null; priority: string; budget: number; actualCost: number
  committedCost: number; forecastCost: number; revenue: number; progress: number
  startDate?: string | null; finishDate?: string | null; baselineStart?: string | null
  baselineFinish?: string | null; portfolioId?: string | null; programId?: string | null
  managerId?: string | null; client?: string | null; location?: string | null
}

export interface RiskLite {
  id: string; code: string; title: string; projectId: string
  project: { code: string; name: string }
  category: string; probability: number; impact: number; score: number
  status: string; strategy?: string | null; mitigation?: string | null; owner?: string | null
  responseCost: number; raisedDate: string; dueDate?: string | null
}

export interface ActivityLite {
  id: string; activityId: string; name: string; projectId: string
  project?: { code: string; name: string }
  wbsId?: string | null; type: string; status: string
  duration: number; remainingDur: number; progress: number
  startDate?: string | null; finishDate?: string | null
  baselineStart?: string | null; baselineFinish?: string | null
  totalFloat: number; freeFloat: number; isCritical: boolean
  responsible?: string | null; cost: number; actualCost: number
}

export interface ChangeLite {
  id: string; code: string; title: string; type: string; status: string
  costImpact: number; timeImpact: number; raisedDate: string
  project: { code: string; name: string }
}

export const fmtMoney = (n: number, compact = true) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    notation: compact ? 'compact' : 'standard', maximumFractionDigits: 1,
  }).format(n || 0)

export const fmtNum = (n: number, d = 0) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(n || 0)

export const fmtDate = (s?: string | null) => {
  if (!s) return '—'
  const d = new Date(s)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export const fmtPct = (n: number) => `${(n || 0).toFixed(1)}%`

export const healthColor = (h: string) =>
  h === 'Green' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : h === 'Yellow' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  : 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'

export const statusColor = (s: string) =>
  s === 'Completed' || s === 'Approved' || s === 'Closed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-900'
  : s === 'In Progress' || s === 'Under Review' || s === 'Mitigated' ? 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/50 dark:border-sky-900'
  : s === 'Active' || s === 'Open' || s === 'Submitted' ? 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-900'
  : s === 'On Hold' || s === 'Rejected' || s === 'Realized' ? 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/50 dark:border-rose-900'
  : 'text-muted-foreground bg-muted border-border'

// Trigger a CSV export download from the /api/export endpoint
export function exportCsv(type: 'projects' | 'activities' | 'risks' | 'resources' | 'changes' | 'claims', projectId?: string) {
  const params = new URLSearchParams({ type })
  if (projectId) params.set('projectId', projectId)
  const a = document.createElement('a')
  a.href = `/api/export?${params}`
  a.download = ''
  document.body.appendChild(a)
  a.click()
  a.remove()
}
