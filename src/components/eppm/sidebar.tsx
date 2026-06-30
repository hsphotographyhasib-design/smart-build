'use client'

import { LayoutDashboard, FolderKanban, Network, Briefcase, ListTree, ListChecks,
  CalendarRange, GitBranch, Users, DollarSign, TrendingUp, GitCompareArrows,
  AlertTriangle, FileEdit, Telescope, FileText, BarChart3, Sparkles, Settings,
  ChevronDown, Building2, Radio, Construction, Scale, Milestone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/eppm'

interface NavItem { id: View; label: string; icon: any }
interface NavGroup { title: string; items: NavItem[] }

const groups: NavGroup[] = [
  { title: 'Overview', items: [{ id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard }] },
  { title: 'Portfolio', items: [
    { id: 'portfolios', label: 'Portfolios', icon: FolderKanban },
    { id: 'programs', label: 'Programs', icon: Network },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'compare', label: 'Compare Projects', icon: Scale },
  ]},
  { title: 'Planning & Scheduling', items: [
    { id: 'wbs', label: 'WBS', icon: ListTree },
    { id: 'activities', label: 'Activities', icon: ListChecks },
    { id: 'gantt', label: 'Gantt Schedule', icon: CalendarRange },
    { id: 'critical-path', label: 'Critical Path', icon: GitBranch },
    { id: 'milestones', label: 'Milestone Timeline', icon: Milestone },
    { id: 'lookahead', label: 'Lookahead', icon: Telescope },
  ]},
  { title: 'Controls', items: [
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'costs', label: 'Cost Management', icon: DollarSign },
    { id: 'evm', label: 'Earned Value (EVM)', icon: TrendingUp },
    { id: 'baselines', label: 'Baselines', icon: GitCompareArrows },
    { id: 'risks', label: 'Risk Register', icon: AlertTriangle },
    { id: 'changes', label: 'Change Management', icon: FileEdit },
  ]},
  { title: 'Delivery', items: [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'site-progress', label: 'Site Progress', icon: Construction },
    { id: 'reports', label: 'Reporting', icon: BarChart3 },
    { id: 'ai-planner', label: 'AI Project Planner', icon: Sparkles },
  ]},
  { title: 'System', items: [{ id: 'admin', label: 'Administration', icon: Settings }] },
]

export function Sidebar({ view, onNavigate, collapsed }: {
  view: View; onNavigate: (v: View) => void; collapsed: boolean
}) {
  return (
    <aside className={cn('flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200 shrink-0', collapsed ? 'w-[68px]' : 'w-[260px]')}>
      <div className="flex h-16 items-center gap-2.5 px-4 border-b border-sidebar-border shrink-0">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold tracking-tight">SmartBuild EPPM</div>
            <div className="truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Enterprise Portfolio</div>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto scroll-thin py-3 px-2">
        {groups.map((g) => (
          <div key={g.title} className="mb-1">
            {!collapsed && (
              <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {g.title}
              </div>
            )}
            <div className="space-y-0.5 mt-0.5">
              {g.items.map((item) => {
                const Icon = item.icon
                const active = view === item.id
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={cn('group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                      active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground')}>
                    <Icon className={cn('h-4 w-4 shrink-0', active ? '' : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </div>
            {collapsed && <div className="my-2 border-t border-sidebar-border/40" />}
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 shrink-0">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/60 p-2.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-sidebar-accent-foreground">
              <Radio className="h-3 w-3 text-emerald-400 animate-pulse" /> Realtime Sync Active
            </div>
            <div className="mt-1 text-sidebar-foreground/60">12 projects · 24 resources online</div>
          </div>
        ) : (
          <div className="grid place-items-center"><Radio className="h-4 w-4 text-emerald-400 animate-pulse" /></div>
        )}
      </div>
    </aside>
  )
}
