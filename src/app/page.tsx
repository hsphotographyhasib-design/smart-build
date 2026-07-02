'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, ArrowRight, CalendarRange, DollarSign, ShieldCheck, Users, Truck,
  Sparkles, GitBranch, TrendingUp, CheckCircle2, Layers, Gauge, Lock, Play,
  BarChart3, Menu, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ── scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Modules', href: '#modules' },
  { label: 'Why SmartBuild', href: '#why' },
]

const MODULES = [
  { icon: CalendarRange, title: 'Scheduling & Gantt', desc: 'Primavera P6-class scheduling — WBS, critical path, baselines, lookahead and an interactive Gantt engine.', tone: 'emerald' },
  { icon: DollarSign, title: 'Cost & Earned Value', desc: 'Budgets, actuals, forecasts, cash-flow S-curves and live EVM with CPI/SPI performance indices.', tone: 'sky' },
  { icon: ShieldCheck, title: 'Risk, Quality & HSE', desc: '5×5 risk heat maps, NCRs, inspections, punch lists and safety dashboards in one governance layer.', tone: 'amber' },
  { icon: Users, title: 'Resource Management', desc: 'Crews, equipment and workforce planning with utilisation, competency and leveling recommendations.', tone: 'violet' },
  { icon: Truck, title: 'Procurement', desc: 'Material planning, purchase requests, supplier tracking and delivery visibility across projects.', tone: 'rose' },
  { icon: Sparkles, title: 'AI Project Planner', desc: 'AI-assisted planning grounded in your live portfolio context — insights, risks and recommendations.', tone: 'emerald' },
]

const TONES: Record<string, string> = {
  emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600 group-hover:border-emerald-300',
  sky: 'from-sky-500/15 to-sky-500/5 text-sky-600 group-hover:border-sky-300',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 group-hover:border-amber-300',
  violet: 'from-violet-500/15 to-violet-500/5 text-violet-600 group-hover:border-violet-300',
  rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 group-hover:border-rose-300',
}

const STATS = [
  { value: '$1.9B', label: 'Portfolio value managed' },
  { value: '30+', label: 'Enterprise modules' },
  { value: '37%', label: 'Avg. schedule progress tracked' },
  { value: '99.7%', label: 'Platform uptime' },
]

const VALUES = [
  { icon: GitBranch, title: 'Primavera P6-class engine', desc: 'Full CPM scheduling, float analysis, baselines and a custom SVG Gantt built for enterprise portfolios.' },
  { icon: TrendingUp, title: 'Real-time earned value', desc: 'PV / EV / AC with CPI & SPI computed live across every project — no spreadsheets, no lag.' },
  { icon: Lock, title: 'Role-based security', desc: 'Encrypted sessions, granular RBAC and permission-aware navigation from Customer to Super Admin.' },
  { icon: Sparkles, title: 'AI-native planning', desc: 'An AI planner that reasons over your real portfolio data to surface risk, slippage and opportunity.' },
]

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Header ── */}
      <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-300', scrolled ? 'border-b border-slate-200/70 bg-white/80 backdrop-blur-xl' : 'bg-transparent')}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="leading-none">
              <div className="text-[15px] font-extrabold tracking-tight">SmartBuild</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Enterprise EPPM</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">{l.label}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login"><Button variant="ghost" className="text-sm font-semibold">Sign in</Button></Link>
            <Link href="/login"><Button className="gap-1.5 rounded-full bg-emerald-600 text-sm font-semibold hover:bg-emerald-700">Get started <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>

          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{l.label}</a>)}
              <Link href="/login" className="mt-2"><Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700">Get started</Button></Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
        {/* background mesh */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,theme(colors.emerald.100),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.slate.100)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.100)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(60%_60%_at_50%_20%,black,transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Enterprise Project Portfolio Management
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Build excellence.<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Delivered on schedule.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
              SmartBuild unifies scheduling, cost control, earned value, risk, resources and procurement into one
              Primavera P6-class platform — so you can plan, control and deliver your entire construction portfolio with confidence.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login"><Button size="lg" className="h-12 gap-2 rounded-full bg-emerald-600 px-7 text-base font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">Get started free <ArrowRight className="h-4.5 w-4.5" /></Button></Link>
              <Link href="/login"><Button size="lg" variant="outline" className="h-12 gap-2 rounded-full border-slate-300 px-7 text-base font-semibold"><Play className="h-4 w-4" /> Explore the platform</Button></Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-xs text-slate-400">Primavera P6-class scheduling · Real-time EVM · Role-based access · AI planning</p>
          </Reveal>

          {/* product preview mockup */}
          <Reveal delay={0.25}>
            <div className="relative mx-auto mt-16 max-w-5xl">
              <div className="absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[32px] bg-gradient-to-b from-emerald-200/40 to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {/* window chrome */}
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[10px] text-slate-400 ring-1 ring-slate-200">
                    <Lock className="h-2.5 w-2.5" /> app.smartbuild.io/dashboard
                  </div>
                </div>
                <AppMock />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-14 lg:grid-cols-4 lg:px-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05} className="text-center">
              <div className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{s.value}</div>
              <div className="mt-1.5 text-xs font-medium text-slate-500 sm:text-sm">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Modules</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">One platform. Every discipline.</h2>
          <p className="mt-4 text-slate-600">From the boardroom to the site office — 30+ integrated modules covering the full project lifecycle.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => {
            const Icon = m.icon
            return (
              <Reveal key={m.title} delay={(i % 3) * 0.06}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className={cn('mb-5 grid h-12 w-12 place-items-center rounded-xl border border-transparent bg-gradient-to-br transition-colors', TONES[m.tone])}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{m.desc}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ── Platform showcase ── */}
      <section id="platform" className="relative overflow-hidden bg-slate-950 py-24 text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-40 [background:radial-gradient(50%_50%_at_15%_0%,theme(colors.emerald.500),transparent_60%),radial-gradient(50%_50%_at_85%_100%,theme(colors.teal.600),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">The Platform</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Your whole portfolio, in one workspace.</h2>
            <p className="mt-4 max-w-lg text-slate-300">
              Executives get real-time KPIs and cash-flow S-curves. Planners get a P6-class Gantt and critical path.
              Site teams log daily progress. Everyone works from the same live data — with a permission-aware, mega-menu navigation that scales to hundreds of pages.
            </p>
            <ul className="mt-8 space-y-3">
              {['Executive dashboard with earned-value analytics', 'Interactive Gantt with dependencies, baselines & critical path', 'AI planner grounded in your real project data', 'Enterprise RBAC with encrypted sessions'].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/login"><Button size="lg" className="mt-9 gap-2 rounded-full bg-emerald-500 px-6 font-semibold text-slate-950 hover:bg-emerald-400">Open the app <ArrowRight className="h-4 w-4" /></Button></Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard icon={Gauge} label="Avg. Progress" value="37.1%" tone="emerald" />
              <MetricCard icon={BarChart3} label="CPI · SPI" value="0.92 · 0.85" tone="sky" />
              <MetricCard icon={Layers} label="Active Projects" value="12" tone="violet" />
              <MetricCard icon={ShieldCheck} label="Open Risks" value="14" tone="amber" />
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-300"><span>Cash-flow S-curve</span><span className="text-emerald-400">$104M peak</span></div>
                <MiniChart />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why ── */}
      <section id="why" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Why SmartBuild</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Built for how enterprises actually deliver.</h2>
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = v.icon
            return (
              <Reveal key={v.title} delay={(i % 4) * 0.05}>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="h-5.5 w-5.5" /></div>
                <h3 className="mt-4 font-bold tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{v.desc}</p>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-8 py-16 text-center text-white shadow-2xl sm:px-16">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(40%_60%_at_20%_20%,white,transparent_60%),radial-gradient(40%_60%_at_80%_80%,white,transparent_55%)]" />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to transform your portfolio?</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-emerald-50">Sign in to access the full SmartBuild workspace — new accounts start as Customer and can be upgraded by an administrator.</p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login"><Button size="lg" className="h-12 gap-2 rounded-full bg-white px-7 text-base font-semibold text-emerald-700 hover:bg-emerald-50">Get started <ArrowRight className="h-4.5 w-4.5" /></Button></Link>
              <Link href="/login"><Button size="lg" variant="outline" className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base font-semibold text-white hover:bg-white/10">Sign in</Button></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"><Building2 className="h-5 w-5" /></div>
                <div className="leading-none"><div className="text-sm font-extrabold">SmartBuild</div><div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Enterprise EPPM</div></div>
              </div>
              <p className="mt-4 max-w-xs text-sm text-slate-500">Primavera P6-class project portfolio management for the construction enterprise.</p>
            </div>
            {[
              { title: 'Platform', links: ['Modules', 'Scheduling', 'Earned Value', 'AI Planner'] },
              { title: 'Company', links: ['About', 'Careers', 'Contact', 'Partners'] },
              { title: 'Resources', links: ['Documentation', 'Support', 'Security', 'Status'] },
            ].map((col) => (
              <div key={col.title}>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{col.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => <li key={l}><a href="#" className="text-sm text-slate-600 hover:text-emerald-600">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
            <span>© 2026 SmartBuild Enterprise · EPPM v4.2.1</span>
            <span>Built for enterprise construction · All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── decorative mock components ───────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof Gauge; label: string; value: string; tone: string }) {
  const tint: Record<string, string> = { emerald: 'text-emerald-400', sky: 'text-sky-400', violet: 'text-violet-400', amber: 'text-amber-400' }
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <Icon className={cn('h-5 w-5', tint[tone])} />
      <div className="mt-3 text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  )
}

function MiniChart() {
  const bars = [18, 26, 34, 30, 44, 52, 60, 74, 68, 88, 96, 104]
  const max = 104
  return (
    <div className="flex h-20 items-end gap-1.5">
      {bars.map((b, i) => (
        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/40 to-emerald-400" style={{ height: `${(b / max) * 100}%` }} />
      ))}
    </div>
  )
}

function AppMock() {
  return (
    <div className="grid grid-cols-4 gap-3 bg-white p-4 sm:p-5">
      {/* KPI row */}
      {[
        { l: 'Budget', v: '$1.9B', c: 'text-slate-900' },
        { l: 'Spent', v: '$722M', c: 'text-emerald-600' },
        { l: 'Progress', v: '37.1%', c: 'text-sky-600' },
        { l: 'Open Risks', v: '14', c: 'text-amber-600' },
      ].map((k) => (
        <div key={k.l} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-left">
          <div className="text-[9px] uppercase tracking-wide text-slate-400">{k.l}</div>
          <div className={cn('mt-1 text-base font-extrabold', k.c)}>{k.v}</div>
        </div>
      ))}
      {/* chart block */}
      <div className="col-span-3 rounded-xl border border-slate-100 p-4 text-left">
        <div className="mb-3 text-[10px] font-semibold text-slate-500">Cash-flow S-curve</div>
        <div className="flex h-24 items-end gap-1">
          {[10, 16, 22, 20, 30, 38, 46, 58, 54, 70, 82, 92].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/30 to-emerald-500" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      {/* gantt block */}
      <div className="rounded-xl border border-slate-100 p-4 text-left">
        <div className="mb-3 text-[10px] font-semibold text-slate-500">Schedule</div>
        <div className="space-y-2">
          {[['w-3/4', 'bg-emerald-500'], ['w-1/2', 'bg-sky-500'], ['w-2/3', 'bg-rose-500'], ['w-2/5', 'bg-slate-300']].map(([w, c], i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-1.5 w-6 rounded bg-slate-100" />
              <div className={cn('h-1.5 rounded', w, c)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
