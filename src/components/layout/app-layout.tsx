'use client'

import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, HardHat, LogOut, Bell,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type AppPage } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SearchTrigger } from '@/components/search/search-trigger'
import { GlobalSearchDialog } from '@/components/search/global-search'
import { MobileHeader } from '@/components/layout/mobile-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  useMenuData,
  IconByName,
  findActiveInfo,
  type MenuGroup,
  type MenuTreeItem,
} from '@/hooks/use-menu-data'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatePresence, motion } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════
// Animation Variants — smooth expand/collapse
// ═══════════════════════════════════════════════════════════════════

const expandVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  visible: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: {
      height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      opacity: { duration: 0.2, delay: 0.03, ease: 'easeOut' },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      height: { duration: 0.2, ease: [0.4, 0, 1, 1] },
      opacity: { duration: 0.15, ease: 'easeIn' },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════
// Sidebar Skeleton — loading state
// ═══════════════════════════════════════════════════════════════════

function SidebarSkeleton({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="space-y-1.5 px-1 py-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 rounded-lg mx-auto" />
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-1 px-2 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-8 w-32 rounded-md" />
          <div className="pl-2 space-y-1">
            <Skeleton className="h-8 w-full rounded-md" />
            {i < 3 && <Skeleton className="h-8 w-[80%] rounded-md" />}
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Sub-Menu Leaf Item — the actual navigable page
// ═══════════════════════════════════════════════════════════════════

function SubMenuItem({
  item,
  collapsed,
}: {
  item: { id: string; label: string; page: string; icon: string }
  collapsed: boolean
}) {
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
              className="w-full h-8"
              onClick={() => navigate(item.page as AppPage)}
              data-active={isActive}
              data-page={item.page}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconByName name={item.icon} className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <button
      className={cn(
        'flex items-center gap-2.5 w-full h-8 px-3 rounded-md text-[13px] transition-colors sb-nav-item',
        isActive
          ? 'font-medium bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
      onClick={() => navigate(item.page as AppPage)}
      data-active={isActive}
      data-page={item.page}
      aria-current={isActive ? 'page' : undefined}
    >
      <IconByName
        name={item.icon}
        className={cn(
          'h-3.5 w-3.5 shrink-0',
          isActive ? 'text-amber-600 dark:text-amber-400' : ''
        )}
      />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Menu Group — collapsible parent with children
// ═══════════════════════════════════════════════════════════════════

function MenuGroupItem({
  group,
  collapsed,
  defaultExpanded,
}: {
  group: MenuGroup
  collapsed: boolean
  defaultExpanded: boolean
}) {
  const { currentPage, navigate } = useAppStore()
  const [manualExpanded, setManualExpanded] = React.useState<boolean | null>(null)

  const isSingleItem = group.items.length === 1 && !group.items[0].hasChildren && !group.items[0].isCategory
  const hasActiveChild = group.items.some(
    (item) =>
      (item.page === currentPage && !item.isCategory) ||
      item.children.some((c) => c.page === currentPage)
  )
  // Expand if: user manually expanded, OR current page is a child, OR default expanded
  const expanded = manualExpanded !== null ? manualExpanded : (defaultExpanded || hasActiveChild)

  // ── Collapsed mode: icon button or icon stack ──
  if (collapsed) {
    if (isSingleItem) {
      const item = group.items[0]
      const isActive = currentPage === item.page
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                size="icon"
                className="w-full h-9"
                onClick={() => navigate(item.page as AppPage)}
                data-active={isActive}
                data-page={item.page}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconByName name={group.icon} className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{group.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={hasActiveChild ? 'secondary' : 'ghost'}
              size="icon"
              className="w-full h-9"
              data-active={hasActiveChild}
            >
              <IconByName name={group.icon} className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{group.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // ── Expanded mode: full collapsible group ──
  return (
    <div className="group">
      {/* Parent header */}
      <button
        onClick={() => {
          if (isSingleItem) {
            navigate(group.items[0].page as AppPage)
          } else {
            setManualExpanded((prev) => prev === null ? false : !prev)
          }
        }}
        className={cn(
          'flex items-center gap-2.5 w-full h-10 px-3 rounded-lg text-sm font-semibold transition-colors',
          'hover:bg-accent/50 active:bg-accent/80',
          hasActiveChild
            ? 'text-amber-900 bg-amber-50/60 dark:text-amber-200 dark:bg-amber-950/20'
            : 'text-foreground'
        )}
        aria-expanded={expanded}
        aria-label={group.label}
      >
        <IconByName
          name={group.icon}
          className={cn(
            'h-[18px] w-[18px] shrink-0',
            hasActiveChild ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
          )}
        />
        <span className="flex-1 text-left truncate">{group.label}</span>
        {!isSingleItem && (
          <motion.div
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0',
                hasActiveChild ? 'text-amber-600' : 'text-muted-foreground'
              )}
            />
          </motion.div>
        )}
      </button>

      {/* Children — animated expand/collapse */}
      {!isSingleItem && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key={`${group.id}-children`}
              variants={expandVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="pl-3 pr-1 py-0.5 space-y-0.5">
                {group.items.map((item) => {
                  // Leaf item — directly navigable
                  if (!item.isCategory && !item.hasChildren) {
                    return (
                      <SubMenuItem
                        key={item.id}
                        item={item}
                        collapsed={false}
                      />
                    )
                  }

                  // Category/folder item with sub-children
                  return <CategoryItem key={item.id} item={item} />
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Separator between groups */}
      <div className="h-px bg-border/30 my-1 mx-3" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Category Item — expandable sub-folder inside a group
// ═══════════════════════════════════════════════════════════════════

function CategoryItem({ item }: { item: MenuTreeItem }) {
  const { currentPage, navigate } = useAppStore()
  const [manualExpanded, setManualExpanded] = React.useState<boolean | null>(null)

  const hasActiveChild = item.children.some((c) => c.page === currentPage)
  const expanded = manualExpanded !== null ? manualExpanded : hasActiveChild

  return (
    <div>
      <button
        onClick={() => setManualExpanded((prev) => prev === null ? false : !prev)}
        className={cn(
          'flex items-center gap-2.5 w-full h-8 px-3 rounded-md text-[13px] transition-colors',
          'hover:bg-accent/50 active:bg-accent/80',
          hasActiveChild ? 'text-amber-900 dark:text-amber-200' : 'text-muted-foreground'
        )}
        aria-expanded={expanded}
        aria-label={item.label}
      >
        <IconByName
          name={item.icon}
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            hasActiveChild ? 'text-amber-600' : ''
          )}
        />
        <span className="flex-1 text-left truncate">{item.label}</span>
        <motion.div
          animate={{ rotate: expanded ? 0 : -90 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown
            className={cn(
              'h-3 w-3 shrink-0',
              hasActiveChild ? 'text-amber-600' : 'text-muted-foreground'
            )}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={`${item.id}-sub`}
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="pl-5 pr-1 py-0.5 space-y-0.5">
              {item.children.map((child) => (
                <SubMenuItem key={child.id} item={child} collapsed={false} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AppSidebar — Desktop only (hidden on mobile)
// ═══════════════════════════════════════════════════════════════════

export function AppSidebar() {
  const { sidebarOpen, setSidebarOpen, user, logout, currentPage } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const userRole = user?.role || 'labour'
  const { menuGroups, loading } = useMenuData(userRole)
  const activeInfo = useMemo(
    () => findActiveInfo(menuGroups, currentPage),
    [menuGroups, currentPage]
  )

  // Auto-scroll to active menu item on page change
  useEffect(() => {
    if (!scrollRef.current || !currentPage) return
    const activeEl = scrollRef.current.querySelector(
      `[data-page="${currentPage}"]`
    ) as HTMLElement | null
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      })
    }
  }, [currentPage, sidebarOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const container = scrollRef.current
      if (!container) return
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button[data-page]:not([disabled]), [role="button"][data-page]'
        )
      )
      if (focusable.length === 0) return
      const currentIdx = focusable.indexOf(document.activeElement as HTMLElement)

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const next = currentIdx < focusable.length - 1 ? currentIdx + 1 : 0
          focusable[next]?.focus()
          focusable[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prev = currentIdx > 0 ? currentIdx - 1 : focusable.length - 1
          focusable[prev]?.focus()
          focusable[prev]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          break
        }
        case 'Home': {
          e.preventDefault()
          focusable[0]?.focus()
          focusable[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          break
        }
        case 'End': {
          e.preventDefault()
          const last = focusable[focusable.length - 1]
          last?.focus()
          last?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          break
        }
      }
    },
    []
  )

  return (
    <aside
      className={cn(
        'hidden md:flex',
        'flex-col border-r bg-card',
        'transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'h-[100dvh] sticky top-0 z-30',
        'overflow-hidden',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
      role="navigation"
      aria-label="Main navigation"
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

      {/* Navigation */}
      <div
        ref={scrollRef}
        className={cn(
          'sb-nav-scroll flex-1',
          sidebarOpen ? 'py-2 px-2' : 'py-1 px-1'
        )}
        onKeyDown={handleKeyDown}
        role="tree"
        aria-label="Navigation menu"
      >
        {loading ? (
          <SidebarSkeleton collapsed={!sidebarOpen} />
        ) : (
          <div className="space-y-0.5">
            {menuGroups.map((group) => (
              <MenuGroupItem
                key={group.id}
                group={group}
                collapsed={!sidebarOpen}
                defaultExpanded={activeInfo.groupId === group.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* User footer */}
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

      {/* Collapse/Expand Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-16 h-6 w-6 rounded-full border bg-card shadow-sm z-40 transition-transform duration-200 hover:scale-110"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </Button>
    </aside>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AppHeader — Desktop only (hidden on mobile)
// ═══════════════════════════════════════════════════════════════════

export function AppHeader() {
  const { breadcrumbs, navigate } = useAppStore()

  return (
    <>
      <GlobalSearchDialog />
      <header className="hidden md:flex h-14 border-b bg-card items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-muted-foreground" aria-hidden="true">/</span>}
                <button
                  onClick={() => crumb.page && navigate(crumb.page, crumb.params)}
                  className={cn(
                    'hover:text-foreground transition-colors',
                    i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <SearchTrigger />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate('notifications')}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </header>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AppLayout — Responsive layout: desktop sidebar + mobile header
// ═══════════════════════════════════════════════════════════════════

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Desktop: Sidebar + Header + Content */}
      {!isMobile && (
        <>
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <AppHeader />
            <main className="flex-1 overflow-y-auto overscroll-contain" id="main-content">
              {children}
            </main>
          </div>
        </>
      )}

      {/* Mobile: Header + Content + Bottom Nav */}
      {isMobile && (
        <>
          <MobileHeader />
          <main className="flex-1 overflow-y-auto overscroll-contain pb-[80px] pt-0" id="main-content-mobile">
            {children}
          </main>
          <MobileBottomNav />
        </>
      )}
    </div>
  )
}
