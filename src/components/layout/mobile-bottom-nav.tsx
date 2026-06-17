'use client'

import React from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  ListChecks,
  Bell,
  MoreHorizontal,
  Briefcase,
  Clock,
  Package,
  ClipboardCheck,
  Users,
  FileCheck,
  Headphones,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppPage } from '@/lib/store'
import { MobileMoreDrawer } from '@/components/layout/mobile-more-drawer'

interface TabDef {
  label: string
  page: AppPage | null // null = "More" tab
  icon: React.ElementType
}

const roleTabs: Record<string, TabDef[]> = {
  client: [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { label: 'Complaints', page: 'client-complaints', icon: MessageSquare },
    { label: 'Service Requests', page: 'maintenance-service-requests', icon: Headphones },
    { label: 'Invoices', page: 'invoices', icon: Receipt },
    { label: 'Notifications', page: 'notifications', icon: Bell },
    { label: 'More', page: null, icon: MoreHorizontal },
  ],
  technician: [
    { label: 'Jobs', page: 'maintenance-work-orders-maintenance', icon: Briefcase },
    { label: 'Attendance', page: 'attendance', icon: Clock },
    { label: 'Materials', page: 'maintenance-materials', icon: Package },
    { label: 'Tasks', page: 'projects', icon: ListChecks },
    { label: 'Notifications', page: 'notifications', icon: Bell },
    { label: 'More', page: null, icon: MoreHorizontal },
  ],
  admin: [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { label: 'Projects', page: 'projects', icon: FolderKanban },
    { label: 'Approvals', page: 'collaboration-approvals', icon: FileCheck },
    { label: 'Notifications', page: 'notifications', icon: Bell },
    { label: 'More', page: null, icon: MoreHorizontal },
  ],
  supervisor: [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { label: 'Team', page: 'employees', icon: Users },
    { label: 'Approvals', page: 'collaboration-approvals', icon: ClipboardCheck },
    { label: 'Projects', page: 'projects', icon: FolderKanban },
    { label: 'Notifications', page: 'notifications', icon: Bell },
    { label: 'More', page: null, icon: MoreHorizontal },
  ],
}

const defaultTabs: TabDef[] = [
  { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
  { label: 'Projects', page: 'projects', icon: FolderKanban },
  { label: 'Complaints', page: 'maintenance-service-requests', icon: MessageSquare },
  { label: 'Tasks', page: 'projects', icon: ListChecks },
  { label: 'Notifications', page: 'notifications', icon: Bell },
  { label: 'More', page: null, icon: MoreHorizontal },
]

export function MobileBottomNav() {
  const { user, currentPage, navigate, setShowMobileMoreDrawer } = useAppStore()

  const role = user?.role || ''
  const tabs = roleTabs[role] || defaultTabs
  const isAdminLike = role === 'admin'

  const handleTabClick = (tab: TabDef) => {
    if (tab.page === null) {
      setShowMobileMoreDrawer(true)
    } else {
      navigate(tab.page)
    }
  }

  return (
    <>
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-[0_-1px_3px_rgba(0,0,0,0.08)]',
          'md:hidden',
          isAdminLike ? 'h-[70px]' : 'h-[70px]'
        )}
        role="tablist"
        aria-label="Mobile navigation"
      >
        <div className={cn('flex items-stretch h-full pb-safe', isAdminLike ? 'justify-around' : 'justify-around')}>
          {tabs.map((tab) => {
            const isActive = tab.page !== null && currentPage === tab.page
            const Icon = tab.icon

            return (
              <button
                key={tab.label}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'flex flex-col items-center justify-center min-h-[70px] min-w-0 flex-1 px-1 transition-colors',
                  isActive
                    ? 'text-amber-600'
                    : 'text-muted-foreground active:text-amber-500'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isActive && 'stroke-[2.5]')} />
                <span className={cn(
                  'text-[10px] leading-tight mt-1 truncate max-w-full',
                  isActive && 'font-semibold'
                )}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* More Drawer */}
      <MobileMoreDrawer />
    </>
  )
}