'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  Building2, Sparkles, Sun, Moon, HelpCircle, Menu, QrCode, CheckCircle,
  LayoutDashboard, FolderKanban, Network, Briefcase, Scale, SlidersHorizontal, 
  ListTree, ListChecks, CalendarRange, GitBranch, Milestone, Telescope, 
  Users, Wrench, HardHat, Truck, DollarSign, TrendingUp, Wallet, 
  GitCompareArrows, AlertTriangle, FileEdit, FileText, FileSignature, 
  ShieldCheck, HeartPulse, ClipboardCheck, Construction, BookOpenCheck, 
  Plug, Settings, Camera, RefreshCw, Gavel
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

import { NavigationSearch } from './navigation-search'
import { NavigationDropdown } from './navigation-dropdown'
import { NavigationScroller } from './navigation-scroller'
import { NavigationDrawer } from './navigation-drawer'
import { NotificationsBell } from '../notifications-bell'
import type { View } from '@/lib/eppm'

// 1. Session Timer Component
function SessionTimer() {
  const [timeLeft, setTimeLeft] = useState(3599) // 60 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 3599))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-background/30 backdrop-blur-md text-[10px] font-bold text-muted-foreground/80 select-none">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>Session: {formatTime(timeLeft)}</span>
    </div>
  )
}

// 2. Custom Navigation Item Component
interface NavigationItemProps {
  label: string
  active: boolean
  onClick: () => void
}

function NavigationItem({ label, active, onClick }: NavigationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-3.5 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-200 hover:scale-103 cursor-pointer",
        active
          ? "text-primary font-bold"
          : "text-foreground/80 hover:bg-background/45 hover:text-foreground"
      )}
    >
      <span className="relative z-10">{label}</span>
      {active && (
        <motion.div
          layoutId="active-underline"
          className="absolute bottom-[-1.5px] left-2.5 right-2.5 h-[2.5px] bg-primary rounded-full"
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        />
      )}
    </button>
  )
}

// 3. Mobile drawer data groups matching sidebar structure
const drawerGroups = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard' as View, label: 'Executive Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Portfolio',
    items: [
      { id: 'portfolios' as View, label: 'Portfolios', icon: FolderKanban },
      { id: 'programs' as View, label: 'Programs', icon: Network },
      { id: 'projects' as View, label: 'Projects', icon: Briefcase },
      { id: 'compare' as View, label: 'Compare Projects', icon: Scale },
      { id: 'whatif' as View, label: 'What-If Modelling', icon: SlidersHorizontal },
    ],
  },
  {
    title: 'Planning & Scheduling',
    items: [
      { id: 'wbs' as View, label: 'WBS', icon: ListTree },
      { id: 'activities' as View, label: 'Activities', icon: ListChecks },
      { id: 'gantt' as View, label: 'Gantt Schedule', icon: CalendarRange },
      { id: 'critical-path' as View, label: 'Critical Path', icon: GitBranch },
      { id: 'milestones' as View, label: 'Milestone Timeline', icon: Milestone },
      { id: 'lookahead' as View, label: 'Lookahead', icon: Telescope },
    ],
  },
  {
    title: 'Controls',
    items: [
      { id: 'resources' as View, label: 'Resources', icon: Users },
      { id: 'equipment' as View, label: 'Equipment Planning', icon: Wrench },
      { id: 'workforce' as View, label: 'Workforce Planning', icon: HardHat },
      { id: 'procurement' as View, label: 'Procurement', icon: Truck },
      { id: 'costs' as View, label: 'Cost Management', icon: DollarSign },
      { id: 'evm' as View, label: 'Earned Value (EVM)', icon: TrendingUp },
      { id: 'cashflow' as View, label: 'Cash Flow Forecast', icon: Wallet },
      { id: 'baselines' as View, label: 'Baselines', icon: GitCompareArrows },
      { id: 'risks' as View, label: 'Risk Register', icon: AlertTriangle },
      { id: 'changes' as View, label: 'Change Management', icon: FileEdit },
      { id: 'claims' as View, label: 'Claims & Disputes', icon: Gavel },
    ],
  },
  {
    title: 'Delivery',
    items: [
      { id: 'documents' as View, label: 'Documents', icon: FileText },
      { id: 'submittals' as View, label: 'Submittals', icon: FileSignature },
      { id: 'quality' as View, label: 'Quality Management', icon: ShieldCheck },
      { id: 'hse' as View, label: 'HSE Dashboard', icon: HeartPulse },
      { id: 'commissioning' as View, label: 'Commissioning', icon: ClipboardCheck },
      { id: 'site-progress' as View, label: 'Site Progress', icon: Construction },
      { id: 'closeout' as View, label: 'Closeout & Lessons', icon: BookOpenCheck },
      { id: 'reports' as View, label: 'Reporting', icon: BarChart3 },
      { id: 'ai-planner' as View, label: 'AI Project Planner', icon: Sparkles },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'integrations' as View, label: 'Integration Hub', icon: Plug },
      { id: 'admin' as View, label: 'Administration', icon: Settings },
    ],
  },
]

interface FloatingNavbarProps {
  view: View
  onNavigate: (v: View) => void
  onOpenProject: (id: string) => void
  mobileDrawerOpen: boolean
  setMobileDrawerOpen: (o: boolean) => void
}

export function FloatingNavbar({
  view,
  onNavigate,
  onOpenProject,
  mobileDrawerOpen,
  setMobileDrawerOpen,
}: FloatingNavbarProps) {
  const { theme, setTheme } = useTheme()
  const [isScrolledDown, setIsScrolledDown] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const lastScrollY = useRef(0)

  // Auto-hide/slide-up navigation bar scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        setIsScrolledDown(true)
      } else {
        setIsScrolledDown(false)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScanQrMock = (type: string, id: string, name: string) => {
    setQrOpen(false)
    toast.success(`Scanned QR Code for ${type}: ${name}`, {
      description: `Navigating to ${type} logs...`,
    })
    
    if (type === 'Equipment') {
      onNavigate('equipment')
    } else if (type === 'Project') {
      onOpenProject(id)
      onNavigate('gantt')
    } else if (type === 'Employee') {
      onNavigate('resources')
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isScrolledDown ? -18 : 0,
          opacity: isScrolledDown ? 0.92 : 1
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="sticky top-4 z-[999] mx-4 lg:mx-6 flex items-center justify-between gap-3 h-14 rounded-full border border-border/80 bg-background/60 dark:bg-zinc-950/60 backdrop-blur-2xl px-4 shadow-lg select-none"
      >
        {/* Left Side: Logo & Brand Name */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setMobileDrawerOpen(true)}
            className="flex lg:hidden p-1.5 rounded-full hover:bg-muted text-foreground transition-all cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm shrink-0">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <span className="hidden sm:inline-block text-xs font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              SmartBuild
            </span>
          </div>
        </div>

        {/* Center: Search Bar & Horizontal Navigation Slider */}
        <div className="flex-1 flex items-center gap-2 min-w-0 max-w-5xl">
          {/* Search Trigger */}
          <NavigationSearch onNavigate={onNavigate} onOpenProject={onOpenProject} />

          {/* Vertical Separator */}
          <div className="hidden lg:block h-6 w-[1px] bg-border/80 shrink-0" />

          {/* Desktop Slider Nav */}
          <div className="hidden lg:flex flex-1 min-w-0">
            <NavigationScroller>
              <NavigationItem
                label="Dashboard"
                active={view === 'dashboard'}
                onClick={() => onNavigate('dashboard')}
              />
              <NavigationDropdown
                label="Portfolio"
                active={['projects', 'compare', 'whatif', 'portfolios', 'programs'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'portfolios', label: 'Portfolios', icon: FolderKanban, description: 'Strategic investment groups' },
                  { id: 'programs', label: 'Programs', icon: Network, description: 'Grouped project delivery' },
                  { id: 'projects', label: 'Projects', icon: Briefcase, description: 'Enterprise project register' },
                  { id: 'compare', label: 'Compare Projects', icon: Scale, description: 'Benchmark project health' },
                  { id: 'whatif', label: 'What-If Modelling', icon: SlidersHorizontal, description: 'Scenario testing' },
                ]}
              />
              <NavigationDropdown
                label="Planning"
                active={['wbs', 'activities', 'gantt', 'critical-path', 'milestones', 'lookahead'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'wbs', label: 'WBS', icon: ListTree, description: 'Work Breakdown Structure' },
                  { id: 'activities', label: 'Activities', icon: ListChecks, description: 'Work package activities' },
                  { id: 'gantt', label: 'Gantt Schedule', icon: CalendarRange, description: 'Interactive project schedule' },
                  { id: 'critical-path', label: 'Critical Path', icon: GitBranch, description: 'CPM float analysis' },
                  { id: 'milestones', label: 'Milestones', icon: Milestone, description: 'Milestone timeline' },
                  { id: 'lookahead', label: 'Lookahead', icon: Telescope, description: 'Short interval schedules' },
                ]}
              />
              <NavigationDropdown
                label="Resources"
                active={['resources', 'equipment', 'workforce', 'procurement'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'resources', label: 'Resources', icon: Users, description: 'Enterprise staff list' },
                  { id: 'equipment', label: 'Equipment Planning', icon: Wrench, description: 'Fleet allocation & details' },
                  { id: 'workforce', label: 'Workforce Planning', icon: HardHat, description: 'Labor crews & allocation' },
                  { id: 'procurement', label: 'Procurement', icon: Truck, description: 'Orders & materials' },
                ]}
              />
              <NavigationDropdown
                label="Finances"
                active={['costs', 'evm', 'cashflow'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'costs', label: 'Cost Management', icon: DollarSign, description: 'Budget, actuals & forecasts' },
                  { id: 'evm', label: 'Earned Value (EVM)', icon: TrendingUp, description: 'SPI & CPI analysis' },
                  { id: 'cashflow', label: 'Cash Flow', icon: Wallet, description: 'Cumulative flow forecasts' },
                ]}
              />
              <NavigationDropdown
                label="Risk & Change"
                active={['baselines', 'risks', 'changes', 'claims'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'baselines', label: 'Baselines', icon: GitCompareArrows, description: 'Original targets snapshot' },
                  { id: 'risks', label: 'Risk Register', icon: AlertTriangle, description: 'Mitigation workflows' },
                  { id: 'changes', label: 'Change Management', icon: FileEdit, description: 'Variations & approvals' },
                  { id: 'claims', label: 'Claims & Disputes', icon: Gavel, description: 'EOT, claims & DRB' },
                ]}
              />
              <NavigationItem
                label="Documents"
                active={view === 'documents'}
                onClick={() => onNavigate('documents')}
              />
              <NavigationItem
                label="Submittals"
                active={view === 'submittals'}
                onClick={() => onNavigate('submittals')}
              />
              <NavigationDropdown
                label="Quality & HSE"
                active={['quality', 'hse', 'commissioning'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'quality', label: 'Quality Management', icon: ShieldCheck, description: 'Inspections & punch list' },
                  { id: 'hse', label: 'HSE Dashboard', icon: HeartPulse, description: 'Safety & incidents tracking' },
                  { id: 'commissioning', label: 'Commissioning', icon: ClipboardCheck, description: 'System testing & handover' },
                ]}
              />
              <NavigationItem
                label="Site Progress"
                active={view === 'site-progress'}
                onClick={() => onNavigate('site-progress')}
              />
              <NavigationItem
                label="Closeout"
                active={view === 'closeout'}
                onClick={() => onNavigate('closeout')}
              />
              <NavigationItem
                label="AI Planner"
                active={view === 'ai-planner'}
                onClick={() => onNavigate('ai-planner')}
              />
              <NavigationItem
                label="Reports"
                active={view === 'reports'}
                onClick={() => onNavigate('reports')}
              />
              <NavigationDropdown
                label="System"
                active={['integrations', 'admin'].includes(view)}
                onNavigate={onNavigate}
                items={[
                  { id: 'integrations', label: 'Integration Hub', icon: Plug, description: 'ERP & external data' },
                  { id: 'admin', label: 'Administration', icon: Settings, description: 'RBAC controls & auditing' },
                ]}
              />
            </NavigationScroller>
          </div>
        </div>

        {/* Right Side: Utilities, Profile & Toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* QR Scanner Trigger */}
          <button
            onClick={() => setQrOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
            title="QR Code Scanner"
          >
            <QrCode className="h-4 w-4" />
          </button>

          {/* Quick AI Assistant Sparkle Button */}
          <button
            onClick={() => onNavigate('ai-planner')}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-all duration-200 cursor-pointer",
              view === 'ai-planner' ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
            title="AI Assistant Planner"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Session Timer */}
          <SessionTimer />

          {/* Notifications Bell */}
          <NotificationsBell onNavigate={onNavigate} />

          {/* Theme Switch */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
            title="Toggle Theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          <button className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer">
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full pl-0.5 pr-1.5 py-0.5 hover:bg-muted transition-colors cursor-pointer focus:outline-none">
                <Avatar className="h-7 w-7 border border-border"><AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">DO</AvatarFallback></Avatar>
                <div className="hidden xl:block text-left leading-none">
                  <div className="text-[10px] font-bold text-foreground">Daniel Okafor</div>
                  <div className="text-[8px] text-muted-foreground">Admin</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl bg-background/80 border border-border">
              <DropdownMenuLabel className="px-2.5 py-2">
                <div className="text-xs font-bold">Daniel Okafor</div>
                <div className="text-[9px] text-muted-foreground">Daniel.Okafor@smartbuild.com</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('admin')} className="rounded-lg text-xs font-semibold py-2 cursor-pointer">
                Profile & Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('admin')} className="rounded-lg text-xs font-semibold py-2 cursor-pointer">
                Security & 2FA
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-xs font-semibold py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.nav>

      {/* Mobile slide-out Navigation Drawer */}
      <NavigationDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        groups={drawerGroups}
        currentView={view}
        onNavigate={onNavigate}
      />

      {/* QR Scanner Mock Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 border border-border/80 bg-background/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold">
              <QrCode className="h-5 w-5 text-primary" />
              <span>SmartBuild QR Scanner</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Scan project tags, employee cards, or equipment badges for instant lookup.
            </DialogDescription>
          </DialogHeader>

          {/* Scanner UI */}
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-black aspect-video flex items-center justify-center">
            {/* Blinking scanning laser line */}
            <motion.div 
              animate={{ y: [-60, 60, -60] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
              className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] z-10"
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-zinc-400 bg-zinc-950/80">
              <Camera className="h-10 w-10 text-zinc-500 animate-pulse" />
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                <RefreshCw className="h-3 w-3 animate-spin" /> Camera Feed Online
              </div>
            </div>
            
            {/* Overlay frame corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-500 rounded-tl-sm" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-500 rounded-tr-sm" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-500 rounded-bl-sm" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-500 rounded-br-sm" />
          </div>

          <div className="grid gap-2.5 mt-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Mock Scans (Simulated Scans)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer"
                onClick={() => handleScanQrMock('Project', '1', 'Metro Station Extension')}
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Metro Project</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer"
                onClick={() => handleScanQrMock('Equipment', 'eq-001', 'Caterpillar 320 Excavator')}
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Excavator EQ</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer"
                onClick={() => handleScanQrMock('Employee', 'emp-101', 'Daniel Okafor')}
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Daniel Okafor Card</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2 h-10 text-[11px] rounded-xl font-bold cursor-pointer"
                onClick={() => handleScanQrMock('Employee', 'emp-102', 'Sarah Jenkins')}
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Sarah Jenkins Card</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
