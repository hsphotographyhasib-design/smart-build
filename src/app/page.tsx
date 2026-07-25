'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Layers,
  GanttChart,
  Users,
  DollarSign,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Shield,
  Lock,
  CreditCard,
  BarChart3,
  Building2,
  Clock,
  CheckCircle2,
  Headphones,
  Sparkles,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { BrandFooter } from '@/components/brand'
import { FadeIn } from '@/components/eppm/motion'

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                   */
/* ------------------------------------------------------------------ */
function SectionFadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '#architecture' },
]

const features = [
  {
    icon: Layers,
    title: 'Portfolio & Program Management',
    description:
      'Align projects with strategic objectives. Manage portfolios, programs, and project hierarchies with full visibility across your enterprise.',
  },
  {
    icon: GanttChart,
    title: 'Gantt & Critical Path',
    description:
      'Interactive Gantt charts with critical path analysis, resource-loaded schedules, and real-time progress tracking across all projects.',
  },
  {
    icon: Users,
    title: 'Resource Planning',
    description:
      'Plan, allocate, and optimize your workforce across projects. Track availability, skills, and utilization rates in real time.',
  },
  {
    icon: DollarSign,
    title: 'Cost & EVM',
    description:
      'Monitor budgets, earned value metrics (CPI, SPI), and forecast-at-completion with full cost transparency and forecasting.',
  },
  {
    icon: FileCheck,
    title: 'Document Control',
    description:
      'Centralized document management with version control, approvals, transmittals, and compliance workflows built in.',
  },
  {
    icon: ShieldCheck,
    title: 'HSE & Quality',
    description:
      'Manage health, safety, and environmental compliance. Track incidents, inspections, and quality audits across sites.',
  },
]

const architectureHighlights = [
  {
    icon: Shield,
    title: 'Multi-Tenant Isolation',
    description:
      'Each tenant gets fully isolated data with row-level security. Your data never mixes with others.',
  },
  {
    icon: Lock,
    title: 'RBAC Permissions',
    description:
      'Granular role-based access control with hierarchical permissions scoped to resources, actions, and branches.',
  },
  {
    icon: CreditCard,
    title: 'Subscription Plans',
    description:
      'Flexible plans from Free Trial to Enterprise. Scale features and capacity as you grow without downtime.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Live dashboards and executive reports with actionable insights across all your projects and programs.',
  },
]

const trustedCompanies = ['GAMUDA', 'IJM', 'YTL', 'SUNWAY', 'UEM']

const dashboardKPIs = [
  { label: 'Active Projects', value: '24', trend: '+3 this month', color: 'text-[#F5A623]' },
  { label: 'On Schedule', value: '87%', trend: '↑ from 82%', color: 'text-[#F5A623]' },
  { label: 'Budget Health', value: 'RM 42.8M', trend: '98% utilized', color: 'text-[#F5A623]' },
]

const progressBars = [
  { label: 'Overall Progress', value: 68, display: '68%', barColor: 'bg-[#F5A623]' },
  { label: 'Schedule Performance (SPI)', value: 94, display: 'SPI 0.94', barColor: 'bg-[#F7B84E]' },
  { label: 'Cost Performance (CPI)', value: 100, display: 'CPI 1.02', barColor: 'bg-emerald-400' },
]

/* ------------------------------------------------------------------ */
/*  Mobile Nav Sheet                                                   */
/* ------------------------------------------------------------------ */
function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 bg-[#0B2345] border-white/10 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-white flex items-center gap-2.5">
            <Image
              src="/brand/smartbuild-app-light.svg"
              alt="SmartBuild"
              width={36}
              height={36}
              className="h-9 w-9 rounded-[22%]"
            />
            <span className="font-heading text-lg font-bold">SmartBuild</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center px-3 py-3 text-sm font-medium text-white/80 rounded-lg transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-2 px-4">
          <Button
            variant="ghost"
            className="justify-start text-white/80 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            className="w-full bg-[#F5A623] text-[#0B2345] font-semibold hover:bg-[#F7B84E]"
            asChild
          >
            <Link href="/register">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* ============================================================ */}
      {/*  Sticky Navbar                                                */}
      {/* ============================================================ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-dark shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand/smartbuild-app-light.svg"
              alt="SmartBuild"
              width={36}
              height={36}
              className="h-9 w-9 rounded-[22%]"
            />
            <span className="font-heading text-lg font-bold text-white">
              SmartBuild
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/70 transition-colors hover:text-[#F5A623]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-white/80 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-[#F5A623] text-[#0B2345] font-semibold hover:bg-[#F7B84E] shadow-lg shadow-[#F5A623]/20"
              asChild
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  Main Content                                                 */}
      {/* ============================================================ */}
      <main className="flex-1">
        {/* ---------------------------------------------------------- */}
        {/*  Hero Section — Navy Gradient                               */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-navy-gradient relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#F5A623] blur-[120px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#132D52] blur-[100px]" />
          </div>

          <div className="relative max-w-[1600px] mx-auto px-4 lg:px-6 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left — Copy */}
              <FadeIn>
                <div className="space-y-6 lg:space-y-8">
                  <Badge
                    variant="secondary"
                    className="bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 px-3 py-1.5 text-xs font-semibold"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Enterprise EPPM Platform
                  </Badge>

                  <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white">
                    Deliver Projects{' '}
                    <span className="text-gradient">On Time &amp; On Budget</span>
                  </h1>

                  <p className="text-base lg:text-lg text-white/60 font-body max-w-xl leading-relaxed">
                    SmartBuild is the all-in-one enterprise project portfolio management
                    platform built for construction and infrastructure companies. Plan,
                    execute, and monitor every project from a single workspace.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      size="lg"
                      className="bg-[#F5A623] text-[#0B2345] font-bold hover:bg-[#F7B84E] shadow-lg shadow-[#F5A623]/25 px-6"
                      asChild
                    >
                      <Link href="/register">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white px-6"
                      asChild
                    >
                      <Link href="/login">Watch Demo</Link>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 pt-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                      14-day free trial
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                      No credit card required
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#F5A623]" />
                      Cancel anytime
                    </span>
                  </div>
                </div>
              </FadeIn>

              {/* Right — Glassmorphism Dashboard Mockup */}
              <FadeIn delay={0.2}>
                <div className="glass rounded-2xl p-5 lg:p-6 space-y-4">
                  {/* Mini header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/brand/smartbuild-app-light.svg"
                        alt="SmartBuild"
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-[22%]"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">Dashboard Preview</p>
                        <p className="text-xs text-white/50">Hasanur Jaya Sdn. Bhd.</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0.5">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      Live
                    </Badge>
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {dashboardKPIs.map((kpi) => (
                      <div
                        key={kpi.label}
                        className="glass-gold rounded-xl p-3 space-y-1.5"
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                          {kpi.label}
                        </p>
                        <p className={`text-xl font-bold font-heading ${kpi.color}`}>
                          {kpi.value}
                        </p>
                        <p className="text-[10px] text-emerald-400/80 font-medium">
                          {kpi.trend}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-3 pt-2">
                    {progressBars.map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-white/50">{bar.label}</span>
                          <span className={`font-bold ${bar.barColor === 'bg-emerald-400' ? 'text-emerald-400' : 'text-[#F5A623]'}`}>
                            {bar.display}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${bar.barColor}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${bar.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Trusted By Section — On navy gradient                      */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-navy-gradient relative">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            <SectionFadeIn>
              <div className="text-center space-y-8">
                <p className="text-xs font-medium uppercase tracking-widest text-white/40">
                  Trusted by leading construction companies
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                  {trustedCompanies.map((company) => (
                    <span
                      key={company}
                      className="text-2xl lg:text-3xl font-heading font-bold text-white/20 hover:text-white/40 transition-colors cursor-default select-none"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Features Grid — Light background                           */}
        {/* ---------------------------------------------------------- */}
        <section id="features" className="bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-16 lg:py-24">
            <SectionFadeIn>
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623]">
                  Platform Modules
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold font-heading text-[#0B2345]">
                  Everything You Need to Deliver Projects
                </h2>
                <p className="text-base text-muted-foreground font-body leading-relaxed">
                  A comprehensive suite of tools designed for the construction and
                  infrastructure industry — from planning to closeout.
                </p>
              </div>
            </SectionFadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <StaggerItem key={feature.title}>
                    <Card className="group border-border/60 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#F5A623]/20 hover:-translate-y-0.5">
                      <CardContent className="p-6 space-y-4">
                        <div className="rounded-xl bg-[#F5A623]/10 p-3 w-fit">
                          <Icon className="h-6 w-6 text-[#F5A623]" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-bold font-heading text-[#0B2345]">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-body leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Architecture Highlights — Light bg                         */}
        {/* ---------------------------------------------------------- */}
        <section id="architecture" className="bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-16 lg:pb-24">
            <SectionFadeIn>
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#F5A623]">
                  Platform Architecture
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold font-heading text-[#0B2345]">
                  Enterprise-Grade Platform
                </h2>
                <p className="text-base text-muted-foreground font-body leading-relaxed">
                  Built with enterprise security, scalability, and reliability at its
                  core — so you can focus on delivering projects.
                </p>
              </div>
            </SectionFadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
              {architectureHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <StaggerItem key={item.title}>
                    <Card className="group h-full border-border/60 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#F5A623]/20 hover:-translate-y-0.5">
                      <CardContent className="p-6 space-y-4">
                        <div className="rounded-xl bg-[#0B2345]/10 p-3 w-fit">
                          <Icon className="h-6 w-6 text-[#0B2345]" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-bold font-heading text-[#0B2345]">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground font-body leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  CTA Section — Navy gradient                                */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-16 lg:pb-24">
            <SectionFadeIn>
              <div className="bg-navy-gradient rounded-2xl p-8 sm:p-10 lg:p-16 text-center space-y-6 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#F5A623]/10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#132D52]/50 blur-[80px]" />

                <div className="relative z-10 space-y-6">
                  <h2 className="text-3xl lg:text-4xl font-bold font-heading text-white">
                    Ready to Get Started?
                  </h2>
                  <p className="text-base text-white/60 font-body max-w-lg mx-auto leading-relaxed">
                    Join thousands of construction professionals who trust SmartBuild to
                    manage their projects. Start your free trial today — no credit card
                    required.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Button
                      size="lg"
                      className="bg-[#F5A623] text-[#0B2345] font-bold hover:bg-[#F7B84E] shadow-lg shadow-[#F5A623]/25 px-8"
                      asChild
                    >
                      <Link href="/register">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white px-8"
                      asChild
                    >
                      <Link href="/pricing">View Pricing</Link>
                    </Button>
                  </div>
                  <div className="flex flex-wrap justify-center items-center gap-5 text-sm text-white/40 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#F5A623]" />
                      Setup in 5 minutes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Headphones className="h-4 w-4 text-[#F5A623]" />
                      Dedicated support
                    </span>
                  </div>
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  Footer                                                      */}
      {/* ============================================================ */}
      <BrandFooter />
    </div>
  )
}
