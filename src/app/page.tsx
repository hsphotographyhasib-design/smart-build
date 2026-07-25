'use client'

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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BrandFooter } from '@/components/brand'
import { FadeIn } from '@/components/eppm/motion'

/* ------------------------------------------------------------------ */
/*  Animation helper                                                   */
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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Layers,
    title: 'Portfolio & Program Management',
    description:
      'Align projects with strategic objectives. Manage portfolios, programs, and project hierarchies with full visibility.',
  },
  {
    icon: GanttChart,
    title: 'Gantt & Critical Path',
    description:
      'Interactive Gantt charts with critical path analysis, resource-loaded schedules, and real-time progress tracking.',
  },
  {
    icon: Users,
    title: 'Resource Planning',
    description:
      'Plan, allocate, and optimize your workforce across projects. Track availability, skills, and utilization rates.',
  },
  {
    icon: DollarSign,
    title: 'Cost & EVM',
    description:
      'Monitor budgets, earned value metrics (CPI, SPI), and forecast-at-completion with full cost transparency.',
  },
  {
    icon: FileCheck,
    title: 'Document Control',
    description:
      'Centralized document management with version control, approvals, transmittals, and compliance workflows.',
  },
  {
    icon: ShieldCheck,
    title: 'HSE & Quality',
    description:
      'Manage health, safety, and environmental compliance. Track incidents, inspections, and quality audits.',
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
      'Flexible plans from Free Trial to Enterprise. Scale features as you grow without downtime.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Live dashboards and executive reports with actionable insights across all your projects and programs.',
  },
]

const stats = [
  { value: '500+', label: 'Projects Managed' },
  { value: '50+', label: 'Companies' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Support' },
]

const dashboardMockupItems = [
  { label: 'Active Projects', value: '24', trend: '+3 this month' },
  { label: 'On Schedule', value: '87%', trend: '↑ from 82%' },
  { label: 'Budget Health', value: 'RM 42.8M', trend: '98% utilized' },
]

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* ============================================================ */}
      {/*  Top Bar                                                      */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur">
        <div className="max-w-[1600px] mx-auto flex h-full items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand/smartbuild-app-light.svg"
              alt="SmartBuild"
              width={36}
              height={36}
              className="h-9 w-9 rounded-[22%]"
            />
            <span className="font-heading text-lg font-bold text-primary">
              SmartBuild
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  Main Content                                                 */}
      {/* ============================================================ */}
      <main className="flex-1">
        {/* ---------------------------------------------------------- */}
        {/*  Hero Section                                               */}
        {/* ---------------------------------------------------------- */}
        <section className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — Copy */}
            <FadeIn>
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20 hover:bg-[#F5A623]/15"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Enterprise EPPM Platform
                </Badge>

                <h1 className="font-heading text-3xl lg:text-5xl font-bold leading-tight text-primary">
                  Deliver Projects{' '}
                  <span className="text-gradient">On Time &amp; On Budget</span>
                </h1>

                <p className="text-base lg:text-lg text-muted-foreground font-body max-w-xl leading-relaxed">
                  SmartBuild is the all-in-one enterprise project portfolio management
                  platform built for construction and infrastructure companies. Plan,
                  execute, and monitor every project from a single workspace.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link href="/register">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#F5A623]" />
                    14-day free trial
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#F5A623]" />
                    No credit card required
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#F5A623]" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </FadeIn>

            {/* Right — Dashboard Mockup */}
            <FadeIn delay={0.15}>
              <Card className="border-border/60 shadow-lg">
                <CardContent className="p-4 space-y-4">
                  {/* Mini header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-[22%] bg-primary grid place-items-center">
                        <Building2 className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-primary">Dashboard Preview</p>
                        <p className="text-[10px] text-muted-foreground">Hasanur Jaya Sdn. Bhd.</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                      Live
                    </Badge>
                  </div>

                  {/* KPI cards row */}
                  <div className="grid grid-cols-3 gap-2">
                    {dashboardMockupItems.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border bg-muted/30 p-3 space-y-1.5"
                      >
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-lg font-bold text-primary">{item.value}</p>
                        <p className="text-[10px] text-emerald-600 font-medium">{item.trend}</p>
                      </div>
                    ))}
                  </div>

                  {/* Fake progress bars */}
                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-bold text-primary">68%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: '68%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Schedule Performance</span>
                        <span className="font-bold text-[#F5A623]">SPI 0.94</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#F5A623]"
                          style={{ width: '94%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Cost Performance</span>
                        <span className="font-bold text-emerald-600">CPI 1.02</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Stats Strip                                                 */}
        {/* ---------------------------------------------------------- */}
        <section className="border-y bg-muted/30 py-6">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
            <SectionFadeIn>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {stats.map((stat) => (
                  <div key={stat.label} className="space-y-1">
                    <p className="text-2xl font-bold font-heading text-primary">
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Features Grid                                              */}
        {/* ---------------------------------------------------------- */}
        <section id="features" className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-16 space-y-4">
          <SectionFadeIn>
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-lg font-bold font-heading text-primary">
                Everything You Need to Deliver Projects
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                A comprehensive suite of tools designed for the construction and
                infrastructure industry — from planning to closeout.
              </p>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className="border-border/60 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 w-fit">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-primary">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </SectionFadeIn>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Architecture Highlights                                     */}
        {/* ---------------------------------------------------------- */}
        <section className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-16 space-y-4">
          <SectionFadeIn>
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-lg font-bold font-heading text-primary">
                Enterprise-Grade Platform
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                Built with enterprise security, scalability, and reliability at its
                core — so you can focus on delivering projects.
              </p>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architectureHighlights.map((item) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.title}
                    className="border-border/60 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="rounded-lg bg-primary/10 p-2.5 w-fit">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-primary">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </SectionFadeIn>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  CTA Section                                                 */}
        {/* ---------------------------------------------------------- */}
        <section className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <SectionFadeIn>
            <Card className="bg-primary text-primary-foreground border-primary">
              <CardContent className="p-8 lg:p-12 text-center space-y-4">
                <h2 className="text-lg font-bold font-heading text-primary-foreground">
                  Ready to Get Started?
                </h2>
                <p className="text-sm text-primary-foreground/70 font-body max-w-lg mx-auto leading-relaxed">
                  Join thousands of construction professionals who trust SmartBuild to
                  manage their projects. Start your free trial today — no credit card
                  required.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-primary hover:bg-white/90"
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
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-primary-foreground/60 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Setup in 5 minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Headphones className="h-3 w-3" />
                    Dedicated support
                  </span>
                </div>
              </CardContent>
            </Card>
          </SectionFadeIn>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  Footer                                                      */}
      {/* ============================================================ */}
      <BrandFooter />
    </div>
  )
}
