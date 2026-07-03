'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import type { LucideIcon } from 'lucide-react'
import {
  Building2, Menu, ChevronDown, QrCode, Sparkles, Sun, Moon, HelpCircle,
  Star, Clock, Camera, RefreshCw, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

import { NavigationSearch } from './navigation-search'
import { NavigationDrawer } from './navigation-drawer'
import { NotificationsBell } from '../notifications-bell'
import { MegaMenu } from '@/components/eppm/nav/mega-menu'
import { NavigationScroller } from '@/components/eppm/nav/nav-scroller'
import { NotificationBadge } from '@/components/eppm/nav/notification-badge'
import { useAuth } from '@/components/auth/auth-context'
import { useNav, useNavBadges } from '@/components/eppm/nav/nav-context'
import { filterNav, categoryForView, flattenLeaves, type NavCategory } from '@/lib/navigation'
import type { View } from '@/lib/eppm'

// ── Session timer chip ───────────────────────────────────────────────────────
function SessionTimer() {
  const [timeLeft, setTimeLeft] = useState(3599)
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 3599)), 1000)
    return () => clearInterval(timer)
  }, [])
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  return (
    <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-background/30 backdrop-blur-md text-[10px] font-bold text-muted-foreground/80 select-none">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span suppressHydrationWarning>Session: {fmt(timeLeft)}</span>
    </div>
  )
}

// ── Top-level category button (opens a mega menu or navigates directly) ──────
function CategoryButton({
  cat, active, open, badge, showUnderline, onClick,
}: {
  cat: NavCategory
  active: boolean
  open: boolean
  badge: number
  showUnderline: boolean
  onClick: () => void
}) {
  const Icon = cat.icon
  return (
    <button
      onClick={onClick}
      aria-haspopup={cat.columns ? 'menu' : undefined}
      aria-expanded={cat.columns ? open : undefined}
      className={cn(
        'relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer select-none',
        active || open ? 'text-primary' : 'text-foreground/75 hover:text-foreground hover:bg-muted/60',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{cat.label}</span>
      {cat.columns && <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />}
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

interface FloatingNavbarProps {
  view: View
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
  mobileDrawerOpen: boolean
  setMobileDrawerOpen: (open: boolean) => void
}

export function FloatingNavbar({ view, onNavigate, onOpenProject, mobileDrawerOpen, setMobileDrawerOpen }: FloatingNavbarProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { favorites, recents } = useNav()
  const badges = useNavBadges()

  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [openCat, setOpenCat] = useState<string | null>(null)
  const lastScrollY = useRef(0)

  const nav = useMemo(() => filterNav(user?.role), [user?.role])
  const activeCategory = categoryForView(view)
  const openCatObj = openCat ? nav.find((c) => c.id === openCat) ?? null : null

  // view → leaf metadata (for favorites & recents lists)
  const leafByView = useMemo(() => {
    const m = new Map<View, { label: string; icon: LucideIcon; categoryLabel: string }>()
    flattenLeaves().forEach((l) => { if (l.view) m.set(l.view, { label: l.label, icon: l.icon, categoryLabel: l.categoryLabel }) })
    return m
  }, [])

  const initials = (user?.name || 'U').split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

  const categoryBadge = (cat: NavCategory) =>
    (cat.columns ?? []).reduce((sum, col) => sum + col.items.reduce((s, it) => s + (it.badgeKey ? badges[it.badgeKey] : 0), 0), 0)

  // Click-to-toggle only — mega menus never open on hover.
  const closeNow = () => setOpenCat(null)

  const onCategoryClick = (cat: NavCategory) => {
    if (cat.view) { onNavigate(cat.view); closeNow() }
    else setOpenCat((cur) => (cur === cat.id ? null : cat.id))
  }

  // Auto-hide on scroll down / show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      setIsScrolledDown(y > lastScrollY.current && y > 70)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Escape closes the mega menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNow() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleScanQrMock = (type: string, id: string, name: string) => {
    setQrOpen(false)
    toast.success(`Scanned QR Code for ${type}: ${name}`, { description: `Navigating to ${type} logs...` })
    if (type === 'Equipment') onNavigate('equipment')
    else if (type === 'Project') { onOpenProject(id); onNavigate('gantt') }
    else if (type === 'Employee') onNavigate('resources')
  }

  const favItems = favorites.map((v) => ({ view: v, ...leafByView.get(v) })).filter((x) => x.label)
  const recentItems = recents.map((v) => ({ view: v, ...leafByView.get(v) })).filter((x) => x.label)

  return (
    <>
      <div className="sticky top-4 z-[999] mx-4 lg:mx-6">
        <motion.nav
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: isScrolledDown ? -16 : 0, opacity: isScrolledDown ? 0.94 : 1 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex items-center justify-between gap-3 h-14 rounded-[20px] border border-border/70 bg-background/60 dark:bg-zinc-950/60 backdrop-blur-2xl px-3 lg:px-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] select-none"
        >
          {/* LEFT — hamburger + logo + company */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex lg:hidden p-1.5 rounded-full hover:bg-muted text-foreground transition-all cursor-pointer"
              aria-label="Open navigation drawer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <button className="flex items-center gap-2 cursor-pointer" onClick={() => { onNavigate('dashboard'); closeNow() }}>
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shrink-0">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div className="hidden sm:block text-left leading-none">
                <div className="text-xs font-extrabold tracking-tight">HJSB</div>
                <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Enterprise</div>
              </div>
            </button>
          </div>

          {/* CENTER — search + category strip */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <NavigationSearch onNavigate={onNavigate} onOpenProject={onOpenProject} />
            <div className="hidden lg:block h-6 w-px bg-border/70 shrink-0" />
            <div className="hidden lg:flex flex-1 min-w-0 overflow-hidden">
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
                  />
                ))}
              </NavigationScroller>
            </div>
            {/* Hard right boundary so the category strip can never touch the action cluster */}
            <div className="hidden lg:block h-6 w-px bg-border/70 shrink-0" />
          </div>

          {/* RIGHT — favorites, recents, QR, AI, timer, notifications, theme, profile */}
          <div className="flex items-center gap-1.5 shrink-0 pl-0.5">
            {/* Favorites */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer" title="Favorites">
                  <Star className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl bg-background/85 border border-border">
                <DropdownMenuLabel className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Favorites
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {favItems.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">Star any page to pin it here.</div>
                ) : favItems.map((f) => {
                  const Icon = f.icon!
                  return (
                    <DropdownMenuItem key={f.view} onClick={() => { onNavigate(f.view); closeNow() }} className="gap-2 rounded-lg py-1.5 text-xs cursor-pointer">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate">{f.label}</span>
                      <span className="text-[9px] text-muted-foreground/70">{f.categoryLabel}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Recents */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer" title="Recently visited">
                  <Clock className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl bg-background/85 border border-border">
                <DropdownMenuLabel className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Recently Visited
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentItems.length === 0 ? (
                  <div className="px-3 py-4 text-center text-[11px] text-muted-foreground">Your recent pages appear here.</div>
                ) : recentItems.map((r) => {
                  const Icon = r.icon!
                  return (
                    <DropdownMenuItem key={r.view} onClick={() => { onNavigate(r.view); closeNow() }} className="gap-2 rounded-lg py-1.5 text-xs cursor-pointer">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate">{r.label}</span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <button onClick={() => setQrOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer" title="QR Scanner">
              <QrCode className="h-4 w-4" />
            </button>

            <button
              onClick={() => { onNavigate('ai-planner'); closeNow() }}
              className={cn('flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-all cursor-pointer', view === 'ai-planner' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground')}
              title="AI Assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            <SessionTimer />
            <NotificationsBell onNavigate={onNavigate} />

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer" title="Toggle Theme">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer" title="Help">
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-full pl-0.5 pr-1.5 py-0.5 hover:bg-muted transition-colors cursor-pointer focus:outline-none">
                  <Avatar className="h-7 w-7 border border-border"><AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">{initials}</AvatarFallback></Avatar>
                  <div className="hidden xl:block text-left leading-none">
                    <div className="text-[10px] font-bold text-foreground">{user?.name ?? 'Guest'}</div>
                    <div className="text-[8px] text-muted-foreground">{user?.role ?? '—'}</div>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl bg-background/80 border border-border">
                <DropdownMenuLabel className="px-2.5 py-2">
                  <div className="text-xs font-bold">{user?.name ?? 'Guest'}</div>
                  <div className="text-[9px] text-muted-foreground">{user?.email ?? ''}</div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{user?.role ?? '—'}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('admin')} className="rounded-lg text-xs font-semibold py-2 cursor-pointer">Profile &amp; Preferences</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate('admin')} className="rounded-lg text-xs font-semibold py-2 cursor-pointer">Security &amp; 2FA</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { void logout() }} className="rounded-lg text-xs font-semibold py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer">Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.nav>

        {/* Mega menu panel */}
        <AnimatePresence>
          {openCatObj && openCatObj.columns && (
            <>
              <div className="fixed inset-0 z-[997]" onClick={closeNow} />
              <div className="absolute left-1/2 top-full z-[998] -translate-x-1/2 pt-2.5">
                <MegaMenu
                  category={openCatObj}
                  currentView={view}
                  onNavigate={(v) => { onNavigate(v); closeNow() }}
                  onClose={closeNow}
                  badges={badges}
                />
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile navigation drawer */}
      <NavigationDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentView={view}
        onNavigate={onNavigate}
      />

      {/* QR Scanner mock dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border border-border/80 bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold">
              <QrCode className="h-5 w-5 text-primary" /> <span>HJSB QR Scanner</span>
            </DialogTitle>
            <DialogDescription className="text-xs">Scan project tags, employee cards, or equipment badges for instant lookup.</DialogDescription>
          </DialogHeader>
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-black aspect-video flex items-center justify-center">
            <motion.div animate={{ y: [-60, 60, -60] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }} className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] z-10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-zinc-400 bg-zinc-950/80">
              <Camera className="h-10 w-10 text-zinc-500 animate-pulse" />
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-500"><RefreshCw className="h-3 w-3 animate-spin" /> Camera Feed Online</div>
            </div>
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-sm" />
          </div>
          <div className="grid gap-2.5 mt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mock Scans (Simulated)</span>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer" onClick={() => handleScanQrMock('Project', '1', 'Metro Station Extension')}><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span className="truncate">Metro Project</span></Button>
              <Button variant="outline" size="sm" className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer" onClick={() => handleScanQrMock('Equipment', 'eq-001', 'Caterpillar 320 Excavator')}><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span className="truncate">Excavator EQ</span></Button>
              <Button variant="outline" size="sm" className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer" onClick={() => handleScanQrMock('Employee', 'emp-101', 'Daniel Okafor')}><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span className="truncate">Daniel Okafor Card</span></Button>
              <Button variant="outline" size="sm" className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer" onClick={() => handleScanQrMock('Employee', 'emp-102', 'Sarah Jenkins')}><CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" /><span className="truncate">Sarah Jenkins Card</span></Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
