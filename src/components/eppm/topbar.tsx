'use client'

import { useState, useEffect } from 'react'
import { Search, Menu, Moon, Sun, Plus, HelpCircle, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NotificationsBell } from './notifications-bell'
import { GlobalSearch } from './global-search'
import type { View } from '@/lib/eppm'

const titles: Record<View, { title: string; sub: string }> = {
  dashboard: { title: 'Executive Dashboard', sub: 'Real-time portfolio command center' },
  portfolios: { title: 'Portfolio Management', sub: 'Strategic investment portfolios' },
  programs: { title: 'Program Management', sub: 'Grouped project delivery' },
  projects: { title: 'Project Register', sub: 'Enterprise project lifecycle' },
  compare: { title: 'Project Comparison', sub: 'Side-by-side portfolio benchmarking' },
  whatif: { title: 'What-If Scenario Modelling', sub: 'Interactive portfolio forecasting' },
  wbs: { title: 'Work Breakdown Structure', sub: 'Hierarchical scope decomposition' },
  activities: { title: 'Activity Management', sub: 'Schedule activity register' },
  gantt: { title: 'Gantt Schedule', sub: 'Interactive programme timeline' },
  'critical-path': { title: 'Critical Path Analysis', sub: 'CPM network & float analysis' },
  milestones: { title: 'Milestone Timeline', sub: 'Programme-level milestone schedule' },
  resources: { title: 'Resource Management', sub: 'Labour, equipment & materials' },
  equipment: { title: 'Equipment Planning', sub: 'Fleet allocation & maintenance schedule' },
  workforce: { title: 'Workforce Planning', sub: 'Crew allocation & competency matrix' },
  costs: { title: 'Cost Management', sub: 'Budget vs actual & forecast' },
  evm: { title: 'Earned Value Management', sub: 'PV · EV · AC · SPI · CPI' },
  cashflow: { title: 'Cash Flow Forecast', sub: 'Monthly inflow, outflow & cumulative position' },
  baselines: { title: 'Baseline Management', sub: 'Schedule & cost snapshots' },
  risks: { title: 'Risk Register', sub: 'Probability × impact analysis' },
  changes: { title: 'Change Management', sub: 'Variations, EOT & claims' },
  lookahead: { title: 'Lookahead Planning', sub: 'Short-interval work window' },
  procurement: { title: 'Procurement Planning', sub: 'Materials, suppliers & lead times' },
  documents: { title: 'Document Management', sub: 'Drawings, RFIs & submittals' },
  submittals: { title: 'Submittal & Approval Workflow', sub: 'Shop drawings, material submittals & approval chains' },
  quality: { title: 'Quality Management', sub: 'Inspections, NCRs & punch lists' },
  hse: { title: 'HSE Dashboard', sub: 'Health, safety & environment incidents' },
  commissioning: { title: 'Commissioning & Handover', sub: 'System testing & handover certificates' },
  'site-progress': { title: 'Site Progress', sub: 'Daily reports & progress curves' },
  closeout: { title: 'Project Closeout & Lessons Learned', sub: 'Closeout checklists, retention & knowledge base' },
  reports: { title: 'Reporting & Analytics', sub: 'Export-ready enterprise reports' },
  'ai-planner': { title: 'AI Project Planner', sub: 'Schedule optimisation & delay prediction' },
  integrations: { title: 'Integration Hub', sub: 'ERP & external system connectors' },
  admin: { title: 'System Administration', sub: 'RBAC · audit · configuration' },
  claims: { title: 'Claims & Disputes', sub: 'EOT, claims & dispute resolution' },
  maintenance: { title: 'Maintenance Management', sub: 'Requests, work orders & field service' },
  complaints: { title: 'Complaints', sub: 'Customer complaint intake & triage' },
  'service-requests': { title: 'Service Requests', sub: 'Logged service demands & triage' },
  'work-orders': { title: 'Work Orders', sub: 'Corrective, preventive & predictive jobs' },
  preventive: { title: 'Preventive Maintenance', sub: 'Planned PPM schedules & compliance' },
  corrective: { title: 'Corrective Maintenance', sub: 'Breakdown & reactive repairs' },
  predictive: { title: 'Predictive Maintenance', sub: 'Condition-based monitoring' },
  dispatch: { title: 'Dispatch Center', sub: 'Crew dispatch & workload routing' },
  technicians: { title: 'Technician Roster', sub: 'Skills, certifications & availability' },
  amc: { title: 'AMC Contracts', sub: 'Annual maintenance contracts & SLAs' },
  'tender-packages': { title: 'Tender Packages', sub: 'Scope packages & tender documents' },
  'bid-comparison': { title: 'Bid Comparison', sub: 'Technical & commercial evaluation' },
  'award-management': { title: 'Award Management', sub: 'Recommendations & letters of award' },
  'vendor-prequal': { title: 'Vendor Prequalification', sub: 'Contractor registration & grading' },
  employees: { title: 'Human Resources', sub: 'Employees, attendance & leave' },
  vehicles: { title: 'Vehicle Fleet', sub: 'Road tax, insurance & fuel tracking' },
  assets: { title: 'Asset Register', sub: 'QR-coded assets & service tracking' },
  stock: { title: 'Stock Control', sub: 'Materials, levels & reorder points' },
  warehouses: { title: 'Warehouses', sub: 'Stores, yards & bin utilisation' },
  'stock-movements': { title: 'Stock Movements', sub: 'Issues, receipts, transfers & returns' },
  'purchase-requests': { title: 'Purchase Requests', sub: 'Requisitions & approval workflow' },
  'purchase-orders': { title: 'Purchase Orders', sub: 'PO issue, acknowledgement & delivery' },
  suppliers: { title: 'Supplier Master', sub: 'Ratings, performance & spend' },
  'goods-receipt': { title: 'Goods Receipt', sub: 'Deliveries, inspection & GRN' },
  invoices: { title: 'Invoices', sub: 'AR / AP invoicing & approvals' },
  payments: { title: 'Payments', sub: 'Certificates, receipts & disbursements' },
  'exec-reports': { title: 'Executive Reports', sub: 'Board & sponsor report packs' },
  'financial-reports': { title: 'Financial Reports', sub: 'P&L, cashflow & aging' },
  sso: { title: 'SSO & Security', sub: 'Identity providers & access policies' },
  audit: { title: 'Audit Log', sub: 'Immutable system activity trail' },
  docs: { title: 'Documentation', sub: 'Guides & knowledge base' },
  tickets: { title: 'Support Tickets', sub: 'Raise & track platform issues' },
  'customer-portal': { title: 'Customer Portal', sub: 'Client-scoped project access' },
  'technician-portal': { title: 'Technician Portal', sub: 'Field technician job list' },
  'workflow-engine': { title: 'Workflow Engine', sub: 'Complaint → payment automation with SLA & audit' },
  notifications: { title: 'Notifications', sub: 'Realtime alerts, approvals & mentions' },
}

export function TopBar({ view, onToggleSidebar, onNavigate, onOpenProject }: { view: View; onToggleSidebar: () => void; onNavigate: (v: View) => void; onOpenProject: (id: string) => void }) {
  const { theme, setTheme } = useTheme()
  const t = titles[view] ?? titles.dashboard
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} onNavigate={onNavigate} onOpenProject={onOpenProject} />
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>HJSB</span><ChevronRight className="h-3 w-3" /><span className="text-foreground font-medium">{t.title}</span>
        </div>
        <h1 className="truncate text-base font-bold tracking-tight leading-tight">{t.title}</h1>
      </div>

      <button onClick={() => setSearchOpen(true)} className="hidden md:flex relative w-72 items-center gap-2 rounded-lg border bg-muted/50 px-3 h-9 text-muted-foreground hover:bg-muted transition-colors">
        <Search className="h-4 w-4 shrink-0" />
        <span className="text-xs flex-1 text-left">Search projects, activities, risks…</span>
        <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-background px-1 font-mono text-[9px]">⌘K</kbd>
      </button>

      <Button variant="outline" size="sm" className="hidden lg:flex h-9 gap-1.5">
        <Plus className="h-4 w-4" /> New Project
      </Button>

      <NotificationsBell onNavigate={onNavigate} />

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Button variant="ghost" size="icon" className="hidden sm:flex">
        <HelpCircle className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8 border"><AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">DO</AvatarFallback></Avatar>
            <div className="hidden lg:block text-left leading-tight">
              <div className="text-xs font-semibold">Daniel Okafor</div>
              <div className="text-[10px] text-muted-foreground">Super Admin</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile & Preferences</DropdownMenuItem>
          <DropdownMenuItem>Notifications</DropdownMenuItem>
          <DropdownMenuItem>Security & 2FA</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-rose-600">Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
