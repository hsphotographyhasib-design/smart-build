// ─────────────────────────────────────────────────────────────────────────────
// HJSB EPPM — Centralized Enterprise Navigation Configuration
//
// Single source of truth for the floating mega-menu navigation. Never hardcode
// menus in components — everything (labels, icons, routes, RBAC, badges,
// descriptions, keywords) lives here so the nav scales to hundreds of items.
//
// Hierarchy:  Category  →  Column (section)  →  Leaf (feature page)
// "Route" maps to the app's state-based `View`. Every leaf has a live view;
// the optional `soon` flag renders an item disabled if a future module needs it.
// ─────────────────────────────────────────────────────────────────────────────
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, FolderKanban, Network, Briefcase, Scale, SlidersHorizontal,
  ListTree, ListChecks, CalendarRange, GitBranch, Milestone, Telescope, Layers,
  Users, Wrench, HardHat, Truck, DollarSign, TrendingUp, Wallet, GitCompareArrows,
  AlertTriangle, FileEdit, FileText, FileSignature, ShieldCheck, HeartPulse,
  ClipboardCheck, BookOpenCheck, Plug, Settings, Gavel, BarChart3, Sparkles,
  Construction, PackageCheck, ClipboardList, Boxes, Package, Warehouse, ReceiptText,
  CreditCard, Handshake, LifeBuoy, Hammer, Radar, CalendarClock, ShoppingCart,
  FileCheck2, UserCog, ScrollText, Contact, MessageSquareWarning, Workflow,
} from 'lucide-react'
import type { View } from '@/lib/eppm'

export type NavTier = 'public' | 'staff' | 'admin'
/** Dynamic badge sources, resolved at runtime from live data. */
export type BadgeKey = 'risks' | 'changes' | 'delays' | 'workOrders' | 'approvals'

export interface NavLeaf {
  id: string
  label: string
  icon: LucideIcon
  view?: View
  description?: string
  soon?: boolean
  badgeKey?: BadgeKey
  shortcut?: string
  tier?: NavTier
  roles?: string[]
  keywords?: string[]
  /** Canonical feature key from DEFAULT_FEATURES. Used for subscription gating. */
  feature?: string
}

export interface NavColumn {
  id: string
  title: string
  items: NavLeaf[]
}

export interface NavCategory {
  id: string
  label: string
  icon: LucideIcon
  /** Direct-link categories (e.g. Dashboard) render as a button, not a mega menu. */
  view?: View
  description?: string
  tier?: NavTier
  columns?: NavColumn[]
  /** Canonical feature key from DEFAULT_FEATURES. Used for subscription gating. */
  feature?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// The menu tree
// ─────────────────────────────────────────────────────────────────────────────
export const NAV: NavCategory[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    view: 'dashboard',
    tier: 'public',
    feature: 'dashboard',
    description: 'Executive KPIs & portfolio health',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    tier: 'staff',
    feature: 'projects',
    description: 'Delivery, scheduling, tender & quality',
    columns: [
      {
        id: 'proj-mgmt',
        title: 'Project Management',
        items: [
          { id: 'projects', label: 'Projects', icon: Briefcase, view: 'projects', feature: 'projects', description: 'Enterprise project register', keywords: ['project', 'register'] },
          { id: 'site-progress', label: 'Site Progress', icon: Construction, view: 'site-progress', feature: 'site-progress', description: 'Daily site reporting & photos', keywords: ['daily', 'site', 'report'] },
          { id: 'documents', label: 'Documents', icon: FileText, view: 'documents', description: 'Drawings, RFIs & files', keywords: ['drawings', 'rfi', 'files'] },
          { id: 'submittals', label: 'Submittals', icon: FileSignature, view: 'submittals', feature: 'submittals', description: 'Approval workflows & transmittals' },
          { id: 'closeout', label: 'Closeout', icon: PackageCheck, view: 'closeout', feature: 'closeout', description: 'Handover, retention & lessons' },
        ],
      },
      {
        id: 'scheduling',
        title: 'Scheduling & Gantt',
        items: [
          { id: 'portfolios', label: 'Portfolios', icon: Layers, view: 'portfolios', description: 'Strategic investment groups' },
          { id: 'programs', label: 'Programs', icon: Network, view: 'programs', description: 'Grouped project delivery' },
          { id: 'wbs', label: 'WBS', icon: ListTree, view: 'wbs', description: 'Work breakdown structure' },
          { id: 'activities', label: 'Activities', icon: ListChecks, view: 'activities', description: 'Work-package activities' },
          { id: 'gantt', label: 'Gantt Schedule', icon: CalendarRange, view: 'gantt', description: 'Interactive project schedule', shortcut: 'G' },
          { id: 'critical-path', label: 'Critical Path', icon: GitBranch, view: 'critical-path', description: 'CPM float analysis' },
          { id: 'milestones', label: 'Milestones', icon: Milestone, view: 'milestones', description: 'Programme milestone timeline' },
          { id: 'lookahead', label: 'Lookahead', icon: Telescope, view: 'lookahead', feature: 'lookahead', description: 'Short-interval planning', badgeKey: 'delays' },
          { id: 'baselines', label: 'Baselines', icon: GitCompareArrows, view: 'baselines', feature: 'baselines', description: 'Original target snapshots' },
          { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle, view: 'risks', description: 'Risk register & heat map', badgeKey: 'risks' },
          { id: 'compare', label: 'Compare Projects', icon: Scale, view: 'compare', description: 'Benchmark project health' },
          { id: 'whatif', label: 'What-If Modelling', icon: SlidersHorizontal, view: 'whatif', description: 'Scenario & forecast testing' },
        ],
      },
      {
        id: 'tender',
        title: 'Tender & Bid',
        items: [
          { id: 'tender-packages', label: 'Tender Packages', icon: ClipboardList, view: 'tender-packages', feature: 'tender', description: 'Scope & tender documents', keywords: ['tender', 'package', 'rfq'] },
          { id: 'bid-comparison', label: 'Bid Comparison', icon: Scale, view: 'bid-comparison', feature: 'tender', description: 'Technical & commercial evaluation', keywords: ['bid', 'evaluation', 'scoring'] },
          { id: 'award-management', label: 'Award Management', icon: Gavel, view: 'award-management', feature: 'tender', description: 'Recommendation & award', keywords: ['award', 'loa'] },
          { id: 'vendor-prequal', label: 'Vendor Prequalification', icon: Handshake, view: 'vendor-prequal', feature: 'tender', description: 'Contractor prequalification', keywords: ['vendor', 'prequalification'] },
        ],
      },
      {
        id: 'quality-hse',
        title: 'Quality & HSE',
        items: [
          { id: 'quality', label: 'Quality Management', icon: ShieldCheck, view: 'quality', feature: 'quality', description: 'Inspections, NCRs & punch list' },
          { id: 'hse', label: 'HSE Dashboard', icon: HeartPulse, view: 'hse', feature: 'hse', description: 'Safety, incidents & toolbox talks' },
          { id: 'commissioning', label: 'Commissioning', icon: ClipboardCheck, view: 'commissioning', feature: 'commissioning', description: 'System testing & handover' },
        ],
      },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    tier: 'staff',
    feature: 'maintenance',
    description: 'Work orders, PPM & field service',
    columns: [
      {
        id: 'requests',
        title: 'Requests',
        items: [
          { id: 'workflow-engine', label: 'Workflow Engine', icon: Workflow, view: 'workflow-engine', feature: 'workflow-engine', description: 'Complaint → payment automation', keywords: ['workflow', 'sla', 'escalation', 'automation', 'state machine'] },
          { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning, view: 'complaints', feature: 'complaints', description: 'Customer complaint intake', keywords: ['complaint', 'customer', 'intake'] },
          { id: 'service-requests', label: 'Service Requests', icon: ClipboardList, view: 'service-requests', feature: 'complaints', description: 'Logged service demands', keywords: ['service', 'request', 'sr'] },
        ],
      },
      {
        id: 'work',
        title: 'Work Orders',
        items: [
          { id: 'work-orders', label: 'Work Orders', icon: Hammer, view: 'work-orders', feature: 'work-orders', description: 'Corrective & reactive jobs', badgeKey: 'workOrders', keywords: ['wo', 'work order', 'job'] },
          { id: 'preventive', label: 'Preventive Maintenance', icon: CalendarClock, view: 'preventive', feature: 'maintenance', description: 'Planned PPM schedules', keywords: ['ppm', 'planned', 'schedule'] },
          { id: 'corrective', label: 'Corrective Maintenance', icon: Wrench, view: 'corrective', feature: 'maintenance', description: 'Breakdown repairs', keywords: ['breakdown', 'repair'] },
          { id: 'predictive', label: 'Predictive Maintenance', icon: Radar, view: 'predictive', feature: 'maintenance', description: 'Condition-based monitoring', keywords: ['condition', 'monitoring', 'sensor'] },
        ],
      },
      {
        id: 'field',
        title: 'Field Service',
        items: [
          { id: 'dispatch', label: 'Dispatch Center', icon: Truck, view: 'dispatch', feature: 'maintenance', description: 'Crew dispatch & routing', keywords: ['dispatch', 'crew', 'assign'] },
          { id: 'technicians', label: 'Technicians', icon: HardHat, view: 'technicians', feature: 'maintenance', description: 'Technician roster & skills', keywords: ['technician', 'roster', 'skills'] },
          { id: 'amc', label: 'AMC Contracts', icon: FileCheck2, view: 'amc', feature: 'maintenance', description: 'Annual maintenance contracts', keywords: ['amc', 'contract', 'annual'] },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: Users,
    tier: 'staff',
    feature: 'resources',
    description: 'People, equipment & inventory',
    columns: [
      {
        id: 'workforce',
        title: 'Workforce',
        items: [
          { id: 'resources', label: 'Resources', icon: Users, view: 'resources', feature: 'resources', description: 'Enterprise resource pool' },
          { id: 'workforce', label: 'Workforce Planning', icon: HardHat, view: 'workforce', feature: 'hr', description: 'Crews, shifts & competency' },
          { id: 'employees', label: 'Employees', icon: Contact, view: 'employees', feature: 'hr', description: 'HR master records', keywords: ['hr', 'staff', 'attendance', 'leave'] },
        ],
      },
      {
        id: 'equipment',
        title: 'Equipment & Assets',
        items: [
          { id: 'equipment', label: 'Equipment', icon: Wrench, view: 'equipment', feature: 'equipment', description: 'Fleet allocation & maintenance' },
          { id: 'vehicles', label: 'Vehicles', icon: Truck, view: 'vehicles', feature: 'fleet', description: 'Vehicle fleet & fuel', keywords: ['fleet', 'roadtax', 'fuel'] },
          { id: 'assets', label: 'Assets', icon: Boxes, view: 'assets', feature: 'inventory', description: 'Asset register & tracking', keywords: ['asset', 'qr', 'register'] },
        ],
      },
      {
        id: 'inventory',
        title: 'Inventory',
        items: [
          { id: 'stock', label: 'Stock', icon: Package, view: 'stock', feature: 'inventory', description: 'Materials & stock levels', keywords: ['stock', 'materials', 'reorder'] },
          { id: 'warehouses', label: 'Warehouses', icon: Warehouse, view: 'warehouses', feature: 'inventory', description: 'Stores & locations', keywords: ['warehouse', 'store', 'yard'] },
          { id: 'stock-movements', label: 'Stock Movements', icon: PackageCheck, view: 'stock-movements', feature: 'inventory', description: 'Issues, returns & transfers', keywords: ['issue', 'transfer', 'grn'] },
        ],
      },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: ShoppingCart,
    tier: 'staff',
    feature: 'procurement',
    description: 'Sourcing, orders & suppliers',
    columns: [
      {
        id: 'sourcing',
        title: 'Sourcing',
        items: [
          { id: 'procurement', label: 'Procurement Planning', icon: Truck, view: 'procurement', feature: 'procurement', description: 'Material planning & tracking' },
          { id: 'purchase-requests', label: 'Purchase Requests', icon: ClipboardList, view: 'purchase-requests', feature: 'procurement', description: 'Requisitions & approvals', badgeKey: 'approvals', keywords: ['pr', 'requisition', 'approval'] },
          { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart, view: 'purchase-orders', feature: 'procurement', description: 'PO issue & tracking', keywords: ['po', 'order'] },
        ],
      },
      {
        id: 'suppliers',
        title: 'Suppliers',
        items: [
          { id: 'suppliers', label: 'Suppliers', icon: Handshake, view: 'suppliers', feature: 'procurement', description: 'Vendor master & ratings', keywords: ['supplier', 'vendor', 'rating'] },
          { id: 'goods-receipt', label: 'Goods Receipt', icon: PackageCheck, view: 'goods-receipt', feature: 'procurement', description: 'Delivery & GRN', keywords: ['grn', 'delivery', 'receipt'] },
        ],
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    tier: 'staff',
    feature: 'costs',
    description: 'Cost control, commercial & accounts',
    columns: [
      {
        id: 'cost-control',
        title: 'Cost Control',
        items: [
          { id: 'costs', label: 'Cost Management', icon: DollarSign, view: 'costs', feature: 'costs', description: 'Budget, actuals & forecast' },
          { id: 'evm', label: 'Earned Value (EVM)', icon: TrendingUp, view: 'evm', feature: 'costs', description: 'SPI / CPI performance' },
          { id: 'cashflow', label: 'Cash Flow', icon: Wallet, view: 'cashflow', feature: 'costs', description: 'Inflow, outflow & funding' },
        ],
      },
      {
        id: 'commercial',
        title: 'Commercial',
        items: [
          { id: 'changes', label: 'Change Management', icon: FileEdit, view: 'changes', feature: 'changes', description: 'Variations & approvals', badgeKey: 'changes' },
          { id: 'claims', label: 'Claims & Disputes', icon: Gavel, view: 'claims', feature: 'changes', description: 'EOT, claims & DRB' },
        ],
      },
      {
        id: 'accounts',
        title: 'Accounts',
        items: [
          { id: 'invoices', label: 'Invoices', icon: ReceiptText, view: 'invoices', feature: 'accounts', description: 'AR / AP invoicing', keywords: ['invoice', 'ar', 'ap', 'claim'] },
          { id: 'payments', label: 'Payments', icon: CreditCard, view: 'payments', feature: 'accounts', description: 'Certificates & payments', keywords: ['payment', 'certificate', 'receipt'] },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    tier: 'staff',
    feature: 'reports',
    description: 'Analytics & AI intelligence',
    columns: [
      {
        id: 'analytics',
        title: 'Analytics',
        items: [
          { id: 'reports', label: 'Report Center', icon: BarChart3, view: 'reports', feature: 'reports', description: '12 templates & analytics' },
          { id: 'exec-reports', label: 'Executive Reports', icon: ScrollText, view: 'exec-reports', feature: 'exec-reports', description: 'Board & sponsor packs', keywords: ['board', 'executive', 'pack'] },
          { id: 'financial-reports', label: 'Financial Reports', icon: ReceiptText, view: 'financial-reports', feature: 'costs', description: 'Cost & cashflow reporting', keywords: ['p&l', 'financial', 'statement'] },
        ],
      },
      {
        id: 'intelligence',
        title: 'Intelligence',
        items: [
          { id: 'ai-planner', label: 'AI Project Planner', icon: Sparkles, view: 'ai-planner', feature: 'ai-planner', description: 'AI planning with live context' },
        ],
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    tier: 'admin',
    description: 'System, access & integrations',
    columns: [
      {
        id: 'system',
        title: 'System',
        items: [
          { id: 'admin', label: 'Administration', icon: UserCog, view: 'admin', description: 'Users, roles, audit & config' },
          { id: 'integrations', label: 'Integration Hub', icon: Plug, view: 'integrations', feature: 'integrations', description: 'ERP & external connectors' },
        ],
      },
      {
        id: 'access',
        title: 'Access & Security',
        items: [
          { id: 'sso', label: 'SSO & Security', icon: ShieldCheck, view: 'sso', feature: 'security', description: 'Identity & policies', keywords: ['sso', 'oauth', 'mfa', 'security'] },
          { id: 'audit', label: 'Audit Log', icon: ScrollText, view: 'audit', feature: 'security', description: 'System activity trail', keywords: ['audit', 'log', 'trail'] },
        ],
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: LifeBuoy,
    tier: 'public',
    feature: 'support',
    description: 'Help, portals & tickets',
    columns: [
      {
        id: 'help',
        title: 'Help',
        items: [
          { id: 'docs', label: 'Documentation', icon: BookOpenCheck, view: 'docs', feature: 'support', description: 'Guides & knowledge base', keywords: ['help', 'guide', 'kb'] },
          { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy, view: 'tickets', feature: 'support', description: 'Raise & track tickets', keywords: ['ticket', 'helpdesk', 'issue'] },
        ],
      },
      {
        id: 'portals',
        title: 'Portals',
        items: [
          { id: 'customer-portal', label: 'Customer Portal', icon: Contact, view: 'customer-portal', tier: 'public', feature: 'portals', description: 'Client project access', keywords: ['client', 'portal'] },
          { id: 'technician-portal', label: 'Technician Portal', icon: HardHat, view: 'technician-portal', feature: 'portals', description: 'Field technician app', keywords: ['technician', 'field', 'jobs'] },
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// RBAC helpers
// ─────────────────────────────────────────────────────────────────────────────
function roleRank(role: string | undefined | null): number {
  switch (role) {
    case 'Super Admin': return 3
    case 'Admin': return 2
    case 'Customer': return 0
    default: return 1 // staff / team roles
  }
}
function tierRank(tier: NavTier | undefined, fallback: NavTier = 'staff'): number {
  switch (tier ?? fallback) {
    case 'admin': return 2
    case 'staff': return 1
    case 'public': return 0
  }
}

function leafVisible(leaf: NavLeaf, categoryTier: NavTier | undefined, role: string | undefined | null, enabledFeatures?: Set<string>): boolean {
  if (role === 'Super Admin') return true
  // Feature-gate check
  if (leaf.feature && enabledFeatures && !enabledFeatures.has(leaf.feature)) return false
  if (leaf.roles && leaf.roles.length > 0) return leaf.roles.includes(role ?? '')
  return roleRank(role) >= tierRank(leaf.tier ?? categoryTier)
}

function categoryVisible(cat: NavCategory, role: string | undefined | null, enabledFeatures?: Set<string>): boolean {
  if (role === 'Super Admin') return true
  // Feature-gate check for categories
  if (cat.feature && enabledFeatures && !enabledFeatures.has(cat.feature)) return false
  return roleRank(role) >= tierRank(cat.tier)
}

/** Returns a role- and feature-filtered copy of the nav tree (empty columns/categories dropped). */
export function filterNav(role: string | undefined | null, enabledFeatures?: Set<string>): NavCategory[] {
  return NAV.filter((cat) => categoryVisible(cat, role, enabledFeatures))
    .map((cat) => {
      if (!cat.columns) return cat
      const columns = cat.columns
        .map((col) => ({ ...col, items: col.items.filter((it) => leafVisible(it, cat.tier, role, enabledFeatures)) }))
        .filter((col) => col.items.length > 0)
      return { ...cat, columns }
    })
    .filter((cat) => cat.view || (cat.columns && cat.columns.length > 0))
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────────────
export interface NavTrail {
  category: NavCategory
  column?: NavColumn
  leaf?: NavLeaf
}

/** All navigable leaves (with a real view) — used for search & validation. */
export function flattenLeaves(role?: string | null, enabledFeatures?: Set<string>): (NavLeaf & { categoryLabel: string; columnTitle?: string })[] {
  const source = role !== undefined ? filterNav(role, enabledFeatures) : NAV
  const out: (NavLeaf & { categoryLabel: string; columnTitle?: string })[] = []
  for (const cat of source) {
    if (cat.view) out.push({ id: cat.id, label: cat.label, icon: cat.icon, view: cat.view, description: cat.description, categoryLabel: cat.label, feature: cat.feature })
    for (const col of cat.columns ?? []) {
      for (const leaf of col.items) out.push({ ...leaf, categoryLabel: cat.label, columnTitle: col.title })
    }
  }
  return out
}

/** Breadcrumb / active-state trail for the current view. */
export function trailForView(view: View | null): NavTrail | null {
  if (!view) return null
  for (const category of NAV) {
    if (category.view === view) return { category }
    for (const column of category.columns ?? []) {
      const leaf = column.items.find((it) => it.view === view)
      if (leaf) return { category, column, leaf }
    }
  }
  return null
}

/** Category id that owns the given view (for active highlighting). */
export function categoryForView(view: View | null): string | null {
  return trailForView(view)?.category.id ?? null
}
