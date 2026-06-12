'use client'

import React from 'react'
import {
  LayoutDashboard, FolderKanban, FileText, Receipt, Calculator,
  ShoppingCart, Package, Users, UserCheck, Clock, DollarSign,
  ClipboardList, Wrench, Truck, CalendarRange, Store,
  Bell, ShieldCheck, UserCog, BarChart3, ScrollText, FileSpreadsheet,
  ChevronLeft, ChevronRight, HardHat, Settings, LogOut,
  Activity, Gauge, Hammer, Car, Ruler, UsersRound, ClipboardCheck, TrendingUp, LineChart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppPage } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface NavItem {
  label: string
  page: AppPage
  icon: React.ElementType
  badge?: number
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Project Management',
    items: [
      { label: 'Projects', page: 'projects', icon: FolderKanban },
      { label: 'Scheduling', page: 'scheduling', icon: CalendarRange },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices', page: 'invoices', icon: FileText },
      { label: 'Payments', page: 'payments', icon: Receipt },
      { label: 'BOQ', page: 'boq', icon: Calculator },
      { label: 'Day Book', page: 'daybook', icon: FileSpreadsheet },
      { label: 'Cashflow', page: 'cashflow', icon: DollarSign },
    ],
  },
  {
    title: 'Procurement',
    items: [
      { label: 'Purchase Requests', page: 'purchase-requests', icon: ShoppingCart },
      { label: 'Purchase Orders', page: 'purchase-orders', icon: ClipboardList },
      { label: 'Suppliers', page: 'suppliers', icon: Users },
      { label: 'Inventory', page: 'inventory', icon: Package },
    ],
  },
  {
    title: 'Labour & HR',
    items: [
      { label: 'Labour Groups', page: 'labour-groups', icon: UserCheck },
      { label: 'Attendance', page: 'attendance', icon: Clock },
      { label: 'Payroll', page: 'payroll', icon: DollarSign },
      { label: 'Employees', page: 'employees', icon: Users },
      { label: 'Leave Mgmt', page: 'leave', icon: ScrollText },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Sub Contractors', page: 'subcontractors', icon: Truck },
      { label: 'Assets', page: 'assets', icon: Wrench },
    ],
  },
  {
    title: 'Resource Management',
    items: [
      { label: 'Resource Dashboard', page: 'resource-dashboard', icon: Activity },
      { label: 'Resource Planning', page: 'resource-planning', icon: Gauge },
      { label: 'Labour Resources', page: 'labour-resources', icon: HardHat },
      { label: 'Equipment', page: 'equipment-resources', icon: Hammer },
      { label: 'Vehicles', page: 'vehicle-resources', icon: Car },
      { label: 'Tools', page: 'tool-resources', icon: Ruler },
      { label: 'Crew Management', page: 'crew-management', icon: UsersRound },
      { label: 'Resource Requests', page: 'resource-requests', icon: ClipboardCheck },
      { label: 'Productivity', page: 'resource-productivity', icon: TrendingUp },
      { label: 'Forecasting', page: 'resource-forecasting', icon: LineChart },
    ],
  },
  {
    title: 'Sales',
    items: [
      { label: 'Product Catalog', page: 'product-catalog', icon: Store },
      { label: 'Customers', page: 'customers', icon: Users },
      { label: 'Sales Invoices', page: 'sales-invoices', icon: FileText },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Reports', page: 'reports', icon: BarChart3 },
      { label: 'Audit Log', page: 'audit-log', icon: ShieldCheck },
      { label: 'Notifications', page: 'notifications', icon: Bell },
      { label: 'Users', page: 'users', icon: UserCog },
      { label: 'Settings', page: 'settings', icon: Settings },
    ],
  },
]

function NavItemButton({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { currentPage, navigate } = useAppStore()
  const isActive = currentPage === item.page

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              size="icon"
              className="w-full h-9"
              onClick={() => navigate(item.page)}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      size="sm"
      className={cn(
        'w-full justify-start gap-2 h-9 px-3 text-sm font-normal',
        isActive && 'font-medium bg-amber-50 text-amber-900 hover:bg-amber-100 hover:text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
      )}
      onClick={() => navigate(item.page)}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
          {item.badge > 9 ? '9+' : item.badge}
        </Badge>
      )}
    </Button>
  )
}

export function AppSidebar() {
  const { sidebarOpen, setSidebarOpen, user, logout } = useAppStore()

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-card transition-all duration-300 ease-in-out h-screen sticky top-0',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 w-full">
            <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center shrink-0">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm leading-none">SMARTBUILD</span>
              <span className="text-[10px] text-muted-foreground">Construction ERP</span>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center mx-auto">
            <HardHat className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-2">
        <div className="space-y-1 px-2">
          {navSections.map((section) => (
            <React.Fragment key={section.title}>
              {sidebarOpen && (
                <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => (
                <NavItemButton key={item.page} item={item} collapsed={!sidebarOpen} />
              ))}
              {sidebarOpen && <Separator className="my-1.5" />}
              {!sidebarOpen && <div className="h-1.5" />}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>

      {/* User */}
      <div className="border-t p-2 shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => logout()}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-9" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-16 h-6 w-6 rounded-full border bg-card shadow-sm z-10"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </Button>
    </aside>
  )
}

export function AppHeader() {
  const { breadcrumbs, navigate } = useAppStore()

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-muted-foreground">/</span>}
              <button
                onClick={() => crumb.page && navigate(crumb.page, crumb.params)}
                className={cn(
                  'hover:text-foreground transition-colors',
                  i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {crumb.label}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate('notifications')}
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
