'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import type { LucideIcon } from 'lucide-react'
import {
  ChevronDown, Sun, Moon, Sparkles, Settings,
  Menu, Bell, Search, X, Star, Clock, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { BrandAvatar } from '@/components/brand'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { NavigationDrawer } from './navigation-drawer'
import { NotificationsBell } from '../notifications-bell'
import { MegaMenu } from '@/components/eppm/nav/mega-menu'
import { NavigationScroller } from '@/components/eppm/nav/nav-scroller'
import { NotificationBadge } from '@/components/eppm/nav/notification-badge'
import { GlobalSearch } from '@/components/eppm/global-search'
import { useAuth } from '@/components/auth/auth-context'
import { useNav, useNavBadges } from '@/components/eppm/nav/nav-context'
import { categoryForView, flattenLeaves, type NavCategory } from '@/lib/navigation'
import type { View } from '@/lib/eppm'

// ── Category button for the center nav strip ─────────────────────────────────
function CategoryButton({
  cat, active, open, badge, showUnderline, onClick, onMouseEnter,
}: {
  cat: NavCategory
  active: boolean
  open: boolean
  badge: number
  showUnderline: boolean
  onClick: () => void
  onMouseEnter: () => void
}) {
  const Icon = cat.icon
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={(e) => e.currentTarget.blur()}
      aria-haspopup={cat.columns ? 'menu' : undefined}
      aria-expanded={cat.columns ? open : undefined}
      className={cn(
        'relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer select-none',
        active || open
          ? 'text-primary'
          : 'text-foreground/75 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{cat.label}</span>
      {cat.columns && (
        <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
      )}
      {badge > 0 && <NotificationBadge count={badge} tone="rose" className="ml-0.5" />}
      {showUnderline && (
        <motion.div
          layoutId="cat-underline"
          className="absolute -bottom-0.5 left-3 right-3 h-[2.5px] rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        />
      )}
    </button>
  )
}

// ── Main Floating Navbar ──────────────────────────────────────────────────────
interface FloatingNavbarProps {
  view: View
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
  mobileDrawerOpen: boolean
  setMobileDrawerOpen: (open: boolean) => void
}

export function FloatingNavbar({
  view, onNavigate, onOpenProject, mobileDrawerOpen, setMobileDrawerOpen,
}: FloatingNavbarProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { favorites, recents, filteredNav: nav } = useNav()
  const badges = useNavBadges()

  const [searchOpen, setSearchOpen] = useState(false)
  const [openCat, setOpenCat] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const megaMenuRef = useRef<HTMLDivElement>(null)

  const activeCategory = categoryForView(view)
  const openCatObj = openCat ? nav.find((c) => c.id === openCat) ?? null : null

  // view → leaf metadata (for favorites & recents lists)
  const leafByView = useMemo(() => {
    const m = new Map<View, { label: string; icon: LucideIcon; categoryLabel: string }>()
    flattenLeaves().forEach((l) => {
      if (l.view) m.set(l.view, { label: l.label, icon: l.icon, categoryLabel: l.categoryLabel })
    })
    return m
  }, [])

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const categoryBadge = (cat: NavCategory) =>
    (cat.columns ?? []).reduce(
      (sum, col) => sum + col.items.reduce((s, it) => s + (it.badgeKey ? badges[it.badgeKey] : 0), 0),
      0,
    )

  const closeMega = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setOpenCat(null)
  }, [])

  const onCategoryClick = useCallback(
    (cat: NavCategory) => {
      if (cat.view) {
        onNavigate(cat.view)
        closeMega()
      } else {
        setOpenCat((cur) => (cur === cat.id ? null : cat.id))
      }
    },
    [onNavigate, closeMega],
  )

  const onCategoryHover = useCallback(
    (cat: NavCategory) => {
      if (!cat.columns) return
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      // If another mega menu is already open, switch immediately
      if (openCat && openCat !== cat.id) {
        setOpenCat(cat.id)
      } else {
        // On first hover, open after a short delay to avoid flicker
        hoverTimeoutRef.current = setTimeout(() => {
          setOpenCat(cat.id)
        }, 200)
      }
    },
    [openCat],
  )

  // Escape closes the mega menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMega()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeMega])

  // Cmd+K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const favItems = favorites
    .map((v) => ({ view: v, ...leafByView.get(v) }))
    .filter((x): x is { view: View; label: string; icon: LucideIcon; categoryLabel: string } => !!x.label)
  const recentItems = recents
    .map((v) => ({ view: v, ...leafByView.get(v) }))
    .filter((x): x is { view: View; label: string; icon: LucideIcon; categoryLabel: string } => !!x.label)

  // Total notification count for badge
  const totalBadgeCount = (badges.workOrders ?? 0) + (badges.approvals ?? 0) + (badges.risks ?? 0)

  return (
    <>
      {/* ── Floating Glassmorphism Navigation Bar ──────────────────── */}
      <header className="sticky top-0 z-[var(--z-header)] select-none pt-2">
        <div className="mx-4">
          <nav
            className="flex h-14 items-center gap-2 rounded-2xl border-b border-white/20 bg-white/80 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80 sm:h-[60px] sm:gap-4 sm:px-4 lg:px-6"
            aria-label="Primary navigation"
          >
            {/* LEFT — Logo + Tenant */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-white/40 dark:hover:bg-white/5 lg:hidden cursor-pointer"
                aria-label="Open navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Brand avatar + company name */}
              <button
                aria-label="SmartBuild — go to dashboard"
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => { onNavigate('dashboard'); closeMega() }}
              >
                <BrandAvatar size="md" />
                <div className="hidden leading-tight sm:block">
                  <div className="text-sm font-extrabold tracking-tight">
                    {user?.tenant?.name ?? 'SmartBuild'}
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground">
                    {user?.tenant?.tier ? `${user.tenant.tier} Plan` : 'Enterprise'}
                  </div>
                </div>
              </button>
            </div>

            {/* CENTER — Nav items (desktop only) */}
            <div className="hidden flex-1 justify-center lg:flex">
              <NavigationScroller>
                {nav.map((cat) => (
                  <CategoryButton
                    key={cat.id}
                    cat={cat}
                    active={activeCategory === cat.id}
                    open={openCat === cat.id}
                    showUnderline={openCat ? openCat === cat.id : activeCategory === cat.id}
                    badge={categoryBadge(cat)}
                    onClick={() => onCategoryClick(cat)}
                    onMouseEnter={() => onCategoryHover(cat)}
                  />
                ))}
              </NavigationScroller>
            </div>

            {/* Spacer on desktop */}
            <div className="hidden flex-1 lg:block" />

            {/* RIGHT — Actions */}
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              {/* Search button (all sizes) */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5 cursor-pointer"
                title="Search (⌘K)"
                aria-label="Search"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              {/* Notification bell with badge */}
              <div className="relative hidden sm:block">
                <NotificationsBell onNavigate={onNavigate} />
              </div>
              <button
                onClick={() => onNavigate('notifications')}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5 sm:hidden cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {totalBadgeCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
                  </span>
                )}
              </button>

              {/* AI Assistant button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 cursor-pointer"
                    onClick={() => onNavigate('ai-planner')}
                    aria-label="AI Assistant"
                  >
                    <Sparkles className="h-4.5 w-4.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">AI Assistant</TooltipContent>
              </Tooltip>

              {/* Theme toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5 sm:flex cursor-pointer"
                    title="Toggle Theme"
                    aria-label="Toggle theme"
                  >
                    <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </TooltipContent>
              </Tooltip>

              {/* Settings gear */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-white/40 hover:text-foreground dark:hover:bg-white/5 sm:flex cursor-pointer"
                    aria-label="Settings"
                  >
                    <Settings className="h-4.5 w-4.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-medium">Settings</TooltipContent>
              </Tooltip>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-0.5 flex items-center gap-2 rounded-xl py-1 pl-1 pr-1.5 transition-colors hover:bg-white/40 focus:outline-none cursor-pointer dark:hover:bg-white/5 sm:pr-2.5">
                    <Avatar className="h-8 w-8 border border-white/30">
                      <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left leading-tight md:block">
                      <div className="text-xs font-bold text-foreground">{user?.name ?? 'Guest'}</div>
                      <div className="text-[10px] text-muted-foreground">{user?.role ?? '—'}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mt-2 w-64 rounded-2xl border border-white/20 bg-white/90 p-1.5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-gray-900/90"
                >
                  <DropdownMenuLabel className="px-2.5 py-2">
                    <div className="text-sm font-bold">{user?.name ?? 'Guest'}</div>
                    <div className="text-[11px] text-muted-foreground">{user?.email ?? ''}</div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {user?.role ?? '—'}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {favItems.length > 0 && (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        <Star className="h-3 w-3 text-amber-500" /> Favorites
                      </DropdownMenuLabel>
                      {favItems.slice(0, 4).map((f) => {
                        const Icon = f.icon!
                        return (
                          <DropdownMenuItem
                            key={f.view}
                            onClick={() => { onNavigate(f.view); closeMega() }}
                            className="gap-2 rounded-lg py-1.5 text-xs cursor-pointer"
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="flex-1 truncate">{f.label}</span>
                          </DropdownMenuItem>
                        )
                      })}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {recentItems.length > 0 && (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        <Clock className="h-3 w-3" /> Recently Visited
                      </DropdownMenuLabel>
                      {recentItems.slice(0, 3).map((r) => {
                        const Icon = r.icon!
                        return (
                          <DropdownMenuItem
                            key={r.view}
                            onClick={() => { onNavigate(r.view); closeMega() }}
                            className="gap-2 rounded-lg py-1.5 text-xs cursor-pointer"
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="flex-1 truncate">{r.label}</span>
                          </DropdownMenuItem>
                        )
                      })}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="rounded-lg py-2 text-xs font-semibold cursor-pointer sm:hidden"
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => { onNavigate('admin'); closeMega() }}
                    className="rounded-lg py-2 text-xs font-semibold cursor-pointer"
                  >
                    Profile &amp; Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => { onNavigate('admin'); closeMega() }}
                    className="rounded-lg py-2 text-xs font-semibold cursor-pointer"
                  >
                    Security &amp; 2FA
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { void logout() }}
                    className="rounded-lg py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          {/* ── Mega Menu Dropdown (desktop) ──────────────────────────────── */}
          <div className="relative hidden lg:block" ref={megaMenuRef}>
            <AnimatePresence>
              {openCatObj && openCatObj.columns && (
                <>
                  <div className="fixed inset-0 z-10" onClick={closeMega} />
                  <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2">
                    <MegaMenu
                      category={openCatObj}
                      currentView={view}
                      onNavigate={(v) => { onNavigate(v); closeMega() }}
                      onClose={closeMega}
                      badges={badges}
                    />
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      <NavigationDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentView={view}
        onNavigate={onNavigate}
      />

      {/* Global search overlay */}
      <GlobalSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={onNavigate}
        onOpenProject={onOpenProject}
      />
    </>
  )
}
