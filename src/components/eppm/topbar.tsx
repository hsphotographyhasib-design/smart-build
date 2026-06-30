'use client'

import { Search, Bell, Menu, Moon, Sun, Plus, HelpCircle, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { View } from '@/lib/eppm'

const titles: Record<View, { title: string; sub: string }> = {
  dashboard: { title: 'Executive Dashboard', sub: 'Real-time portfolio command center' },
  portfolios: { title: 'Portfolio Management', sub: 'Strategic investment portfolios' },
  programs: { title: 'Program Management', sub: 'Grouped project delivery' },
  projects: { title: 'Project Register', sub: 'Enterprise project lifecycle' },
  wbs: { title: 'Work Breakdown Structure', sub: 'Hierarchical scope decomposition' },
  activities: { title: 'Activity Management', sub: 'Schedule activity register' },
  gantt: { title: 'Gantt Schedule', sub: 'Interactive programme timeline' },
  'critical-path': { title: 'Critical Path Analysis', sub: 'CPM network & float analysis' },
  resources: { title: 'Resource Management', sub: 'Labour, equipment & materials' },
  costs: { title: 'Cost Management', sub: 'Budget vs actual & forecast' },
  evm: { title: 'Earned Value Management', sub: 'PV · EV · AC · SPI · CPI' },
  baselines: { title: 'Baseline Management', sub: 'Schedule & cost snapshots' },
  risks: { title: 'Risk Register', sub: 'Probability × impact analysis' },
  changes: { title: 'Change Management', sub: 'Variations, EOT & claims' },
  lookahead: { title: 'Lookahead Planning', sub: 'Short-interval work window' },
  documents: { title: 'Document Management', sub: 'Drawings, RFIs & submittals' },
  reports: { title: 'Reporting & Analytics', sub: 'Export-ready enterprise reports' },
  'ai-planner': { title: 'AI Project Planner', sub: 'Schedule optimisation & delay prediction' },
  admin: { title: 'System Administration', sub: 'RBAC · audit · configuration' },
}

export function TopBar({ view, onToggleSidebar }: { view: View; onToggleSidebar: () => void }) {
  const { theme, setTheme } = useTheme()
  const t = titles[view] ?? titles.dashboard
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="shrink-0">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>SmartBuild</span><ChevronRight className="h-3 w-3" /><span className="text-foreground font-medium">{t.title}</span>
        </div>
        <h1 className="truncate text-base font-bold tracking-tight leading-tight">{t.title}</h1>
      </div>

      <div className="hidden md:flex relative w-72">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects, activities, risks…" className="pl-8 h-9 bg-muted/50 border-0" />
      </div>

      <Button variant="outline" size="sm" className="hidden lg:flex h-9 gap-1.5">
        <Plus className="h-4 w-4" /> New Project
      </Button>

      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">7</span>
      </Button>

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
