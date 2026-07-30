// =============================================================
// SmartBuild Feature Groups, Descriptions & Constants
// =============================================================

/** All 40 default feature module keys */
export const ALL_FEATURES = [
  'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
  'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints',
  'procurement', 'inventory', 'hr', 'equipment', 'fleet', 'work-orders',
  'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes',
  'ai-planner', 'integrations', 'workflow-engine', 'accounts', 'tender',
  'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead',
  'exec-reports', 'security', 'support', 'portals', 'notifications',
] as const

export type FeatureKey = (typeof ALL_FEATURES)[number]

/** Human-readable labels for each feature key */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  portfolios: 'Portfolios',
  programs: 'Programs',
  activities: 'Activities',
  gantt: 'Gantt Charts',
  resources: 'Resource Management',
  risks: 'Risk Register',
  documents: 'Document Management',
  reports: 'Reports',
  maintenance: 'Maintenance',
  complaints: 'Complaints',
  procurement: 'Procurement',
  inventory: 'Inventory',
  hr: 'Human Resources',
  equipment: 'Equipment',
  fleet: 'Fleet Management',
  'work-orders': 'Work Orders',
  hse: 'HSE',
  quality: 'Quality',
  costs: 'Cost Management',
  evm: 'Earned Value',
  cashflow: 'Cashflow',
  baselines: 'Baselines',
  changes: 'Change Orders',
  'ai-planner': 'AI Planner',
  integrations: 'Integrations',
  'workflow-engine': 'Workflow Engine',
  accounts: 'Accounts',
  tender: 'Tender',
  submittals: 'Submittals',
  closeout: 'Closeout',
  commissioning: 'Commissioning',
  'site-progress': 'Site Progress',
  lookahead: 'Lookahead',
  'exec-reports': 'Executive Reports',
  security: 'Security',
  support: 'Support',
  portals: 'Portals',
  notifications: 'Notifications',
}

/** Short description for each feature */
export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  dashboard: 'Centralized analytics and KPI dashboard',
  projects: 'Full project lifecycle management',
  portfolios: 'Portfolio-level oversight and grouping',
  programs: 'Program management across projects',
  activities: 'Task and activity scheduling',
  gantt: 'Interactive Gantt chart visualization',
  resources: 'Workforce and resource allocation',
  risks: 'Risk identification, assessment and mitigation',
  documents: 'Document control and version management',
  reports: 'Standard operational reports',
  maintenance: 'Preventive and corrective maintenance',
  complaints: 'Customer complaint tracking and resolution',
  procurement: 'Purchase orders and vendor management',
  inventory: 'Warehouse and stock management',
  hr: 'Employee records, leave and attendance',
  equipment: 'Equipment tracking and maintenance schedules',
  fleet: 'Vehicle fleet management',
  'work-orders': 'Work order creation and tracking',
  hse: 'Health, Safety & Environment compliance',
  quality: 'Quality inspection and control',
  costs: 'Budget tracking and cost control',
  evm: 'Earned Value Management analysis',
  cashflow: 'Cash flow forecasting and tracking',
  baselines: 'Schedule and cost baseline management',
  changes: 'Variation and change order management',
  'ai-planner': 'AI-powered scheduling and optimization',
  integrations: 'Third-party system integrations',
  'workflow-engine': 'Custom workflow automation',
  accounts: 'Financial accounts and billing',
  tender: 'Tender and bid management',
  submittals: 'Submittal review and approval',
  closeout: 'Project closeout procedures',
  commissioning: 'Commissioning and handover management',
  'site-progress': 'Site progress photo and report tracking',
  lookahead: 'Short-term lookahead planning',
  'exec-reports': 'Executive-level summary reports',
  security: 'Security policies and access control',
  support: 'Help desk and support ticketing',
  portals: 'Client and vendor portal access',
  notifications: 'Email and in-app notification system',
}

/** Feature groups for organized display */
export const FEATURE_GROUPS = [
  {
    id: 'delivery',
    label: 'Project Delivery',
    icon: 'folder-kanban' as const,
    features: [
      'projects', 'portfolios', 'programs', 'activities', 'gantt',
      'resources', 'risks', 'documents', 'site-progress', 'lookahead',
      'baselines', 'submittals', 'closeout', 'commissioning',
    ] as FeatureKey[],
  },
  {
    id: 'tender',
    label: 'Tender & Bid',
    icon: 'gavel' as const,
    features: ['tender'] as FeatureKey[],
  },
  {
    id: 'maintenance',
    label: 'Maintenance & Service',
    icon: 'wrench' as const,
    features: ['maintenance', 'complaints', 'work-orders', 'workflow-engine'] as FeatureKey[],
  },
  {
    id: 'resources',
    label: 'Human Resources',
    icon: 'users' as const,
    features: ['hr'] as FeatureKey[],
  },
  {
    id: 'assets',
    label: 'Assets & Equipment',
    icon: 'hard-hat' as const,
    features: ['equipment', 'fleet'] as FeatureKey[],
  },
  {
    id: 'inventory',
    label: 'Inventory & Warehouse',
    icon: 'warehouse' as const,
    features: ['inventory'] as FeatureKey[],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: 'shopping-cart' as const,
    features: ['procurement'] as FeatureKey[],
  },
  {
    id: 'finance',
    label: 'Finance & Commercial',
    icon: 'dollar-sign' as const,
    features: ['costs', 'evm', 'cashflow', 'changes', 'accounts'] as FeatureKey[],
  },
  {
    id: 'reports',
    label: 'Reporting',
    icon: 'bar-chart-3' as const,
    features: ['reports', 'exec-reports'] as FeatureKey[],
  },
  {
    id: 'ai',
    label: 'AI & Intelligence',
    icon: 'brain' as const,
    features: ['ai-planner'] as FeatureKey[],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: 'settings' as const,
    features: ['integrations', 'security'] as FeatureKey[],
  },
  {
    id: 'support',
    label: 'Support & Portals',
    icon: 'headphones' as const,
    features: ['support', 'portals', 'notifications'] as FeatureKey[],
  },
] as const

/** Plan-to-feature mapping */
export const PLAN_FEATURE_MAP: Record<string, FeatureKey[]> = {
  'Free Trial': ['dashboard', 'projects', 'maintenance', 'complaints'],
  Starter: [
    'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
    'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints', 'work-orders',
  ],
  Professional: [
    'dashboard', 'projects', 'portfolios', 'programs', 'activities', 'gantt',
    'resources', 'risks', 'documents', 'reports', 'maintenance', 'complaints',
    'work-orders', 'procurement', 'inventory', 'hr', 'equipment', 'fleet',
    'hse', 'quality', 'costs', 'evm', 'cashflow', 'baselines', 'changes',
    'submittals', 'closeout', 'commissioning', 'site-progress', 'lookahead',
    'accounts', 'tender', 'exec-reports', 'notifications',
  ],
  Enterprise: [...ALL_FEATURES] as unknown as FeatureKey[],
  Custom: [...ALL_FEATURES] as unknown as FeatureKey[],
}

/** Matrix columns: condensed feature keys shown in the feature matrix table */
export const MATRIX_COLUMNS: { key: FeatureKey; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'activities', label: 'Scheduling' },
  { key: 'tender', label: 'Tender' },
  { key: 'documents', label: 'Documents' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'equipment', label: 'Assets' },
  { key: 'fleet', label: 'Fleet' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'costs', label: 'Finance' },
  { key: 'hr', label: 'HR' },
  { key: 'reports', label: 'Reports' },
  { key: 'ai-planner', label: 'AI' },
  { key: 'integrations', label: 'Admin' },
  { key: 'portals', label: 'Portals' },
  { key: 'notifications', label: 'Notifs' },
]

/** Plan badge color classes */
export const PLAN_BADGE_COLORS: Record<string, string> = {
  'Free Trial': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  'Starter': 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900 dark:text-sky-300',
  'Professional': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
  'Enterprise': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300',
  'Custom': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900 dark:text-rose-300',
}
