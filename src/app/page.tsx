'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Menu,
  Layers,
  GanttChart,
  Users,
  DollarSign,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Server,
  Lock,
  CreditCard,
  Code2,
  ChevronRight,
  Linkedin,
  Twitter,
  Github,
  Building2,
  BarChart3,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7 } },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
]

const TRUSTED_COMPANIES = ['Gamuda', 'IJM', 'YTL', 'Sunway', 'UEM']

const FEATURES = [
  {
    icon: Layers,
    title: 'Portfolio & Program Management',
    description:
      'Align projects with strategic objectives. Manage portfolios, programs, and projects in a unified hierarchy with real-time KPI tracking.',
  },
  {
    icon: GanttChart,
    title: 'Gantt Scheduling & Critical Path',
    description:
      'Interactive Gantt charts with drag-and-drop scheduling, critical path analysis, and automatic dependency resolution.',
  },
  {
    icon: Users,
    title: 'Resource & Workforce Planning',
    description:
      'Optimize resource allocation across projects with capacity planning, availability tracking, and skills matching.',
  },
  {
    icon: DollarSign,
    title: 'Cost Management & EVM',
    description:
      'Track budgets, commitments, and expenditures with Earned Value Management for data-driven project health insights.',
  },
  {
    icon: FileCheck,
    title: 'Document Control & Submittals',
    description:
      'Centralized document management with version control, approval workflows, and automated submittal tracking.',
  },
  {
    icon: ShieldCheck,
    title: 'HSE & Quality Management',
    description:
      'Digital safety inspections, incident reporting, non-conformance tracking, and quality audit management.',
  },
]

const ARCHITECTURE_POINTS = [
  {
    icon: Server,
    text: 'Multi-tenant data isolation with tenant-scoped database queries',
  },
  {
    icon: Lock,
    text: 'Granular RBAC \u2014 role-based access control across branches & departments',
  },
  {
    icon: CreditCard,
    text: 'Flexible subscription plans from Free Trial to Enterprise',
  },
  {
    icon: Code2,
    text: 'RESTful API with tenant context headers for system integration',
  },
]

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Integrations', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Support', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
}

/* ------------------------------------------------------------------ */
/*  Counter component for hero metrics                                */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-gradient font-heading text-3xl font-bold lg:text-4xl"
    >
      {value.toLocaleString()}
      {suffix}
    </motion.span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 bg-brand-navy/95 backdrop-blur-md border-b border-white/10">
        <nav className="container-brand flex h-16 items-center justify-between lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/brand/smartbuild-app-dark.svg"
              alt="SmartBuild"
              width={140}
              height={36}
              className="h-8 w-auto lg:h-9 brightness-0 invert"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm text-white/70 transition-colors hover:text-brand-gold"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold">
              Get Started
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-brand-navy border-white/10 w-72">
                <SheetHeader>
                  <SheetTitle className="text-white font-heading">SmartBuild</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {NAV_LINKS.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <a
                        href={link.href}
                        className="font-body text-white/80 text-base py-2 transition-colors hover:text-brand-gold"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
                  <Separator className="bg-white/10" />
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      className="text-white/80 hover:text-white hover:bg-white/10 justify-start"
                      asChild
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold w-full"
                      asChild
                    >
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="bg-navy-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-gold/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-brand-gold/3 blur-3xl" />
        </div>

        <div className="container-brand relative z-10 min-h-[calc(100vh-4rem)] flex items-center py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.div variants={fadeUp} custom={0}>
                <Badge className="mb-6 bg-brand-gold/15 text-brand-gold border-brand-gold/30 font-body text-sm px-4 py-1.5">
                  <Zap className="size-3.5 mr-1.5" />
                  Enterprise-Grade SaaS Platform
                </Badge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance"
              >
                Enterprise Construction Management,{' '}
                <span className="text-gradient">Reimagined for the Cloud</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-6 font-body text-lg text-white/65 leading-relaxed max-w-xl text-balance"
              >
                A multi-tenant SaaS platform that gives construction enterprises full
                control over portfolios, programs, and projects — with enterprise-grade
                security, role-based access, and subscription flexibility.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold text-base px-8 h-12"
                  asChild
                >
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white text-base px-8 h-12"
                  asChild
                >
                  <Link href="/pricing">See Plans</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Metrics Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
              className="flex justify-center lg:justify-end"
            >
              <motion.div
                variants={scaleIn}
                className="glass rounded-2xl p-6 lg:p-8 w-full max-w-md"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-brand-gold/15">
                    <BarChart3 className="size-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="font-heading text-white font-semibold text-sm">Platform Overview</p>
                    <p className="font-body text-white/50 text-xs">Real-time metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <AnimatedCounter value={500} suffix="+" />
                    <p className="font-body text-white/50 text-xs mt-1">Active Projects</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <AnimatedCounter value={98} suffix="%" />
                    <p className="font-body text-white/50 text-xs mt-1">Uptime SLA</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <AnimatedCounter value={50} suffix="+" />
                    <p className="font-body text-white/50 text-xs mt-1">Enterprise Tenants</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <AnimatedCounter value={12} suffix="k+" />
                    <p className="font-body text-white/50 text-xs mt-1">Users Managed</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light"
                    />
                  </div>
                  <span className="font-body text-white/50 text-xs">78% on-track</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== TRUSTED BY ==================== */}
      <section className="bg-white border-b border-border py-10 lg:py-12">
        <div className="container-brand text-center">
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-body text-sm text-muted-foreground uppercase tracking-wider mb-8"
          >
            Trusted by leading construction enterprises
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="flex flex-wrap items-center justify-center gap-8 lg:gap-16"
          >
            {TRUSTED_COMPANIES.map((company) => (
              <motion.div key={company} variants={fadeIn} className="flex items-center justify-center">
                <span className="font-heading text-xl lg:text-2xl font-bold text-muted-foreground/40 tracking-tight select-none">
                  {company}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== FEATURES GRID ==================== */}
      <section id="features" className="section-padding bg-background">
        <div className="container-brand">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
              Everything You Need to{' '}
              <span className="text-gradient">Deliver Projects</span>
            </h2>
            <p className="mt-4 font-body text-muted-foreground text-lg leading-relaxed">
              Six powerful EPPM modules designed for the complexities of construction portfolio management.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="group h-full border-border/60 bg-card hover:border-brand-gold/30 hover:shadow-lg hover:shadow-brand-gold/5 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-brand-navy/5 group-hover:bg-brand-gold/10 transition-colors duration-300">
                      <feature.icon className="size-5 text-brand-navy group-hover:text-brand-gold transition-colors duration-300" />
                    </div>
                    <CardTitle className="font-heading text-base leading-snug">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== PLATFORM ARCHITECTURE ==================== */}
      <section id="about" className="section-padding bg-brand-light">
        <div className="container-brand">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.h2
                variants={fadeUp}
                className="font-heading text-3xl sm:text-4xl font-bold text-foreground"
              >
                Built for{' '}
                <span className="text-gradient">Enterprise Scale</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 font-body text-muted-foreground text-base leading-relaxed max-w-lg"
              >
                SmartBuild is engineered from the ground up as a true multi-tenant
                SaaS — with complete data isolation, granular permissions, and flexible
                subscription management.
              </motion.p>

              <div className="mt-8 flex flex-col gap-5">
                {ARCHITECTURE_POINTS.map((point) => (
                  <motion.div key={point.text} variants={fadeUp} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold/10">
                      <point.icon className="size-4 text-brand-gold" />
                    </div>
                    <p className="font-body text-sm text-foreground/80 leading-relaxed">
                      {point.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Architecture diagram */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={scaleIn}
              className="flex justify-center"
            >
              <div className="w-full max-w-md">
                {/* Tenant Layer */}
                <div className="rounded-xl border-2 border-brand-navy/20 bg-white p-5 shadow-sm">
                  <p className="font-heading text-xs uppercase tracking-wider text-brand-navy/50 mb-3">
                    Multi-Tenant SaaS Layer
                  </p>
                  <div className="space-y-2.5">
                    {['Tenant A', 'Tenant B', 'Tenant C'].map((t, i) => (
                      <div
                        key={t}
                        className={
                          'flex items-center gap-3 rounded-lg px-4 py-3 ' +
                          (i === 0
                            ? 'bg-brand-navy text-white'
                            : 'bg-brand-navy/5 text-brand-navy/70')
                        }
                      >
                        <Building2 className="size-4 shrink-0" />
                        <span className="font-body text-sm font-medium">{t}</span>
                        <ChevronRight className="size-3.5 ml-auto opacity-50" />
                      </div>
                    ))}
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center my-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-4 bg-brand-gold" />
                      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-brand-gold" />
                    </div>
                  </div>

                  {/* RBAC Layer */}
                  <div className="rounded-lg bg-brand-gold/8 border border-brand-gold/20 p-4">
                    <p className="font-heading text-xs uppercase tracking-wider text-brand-gold mb-2">
                      RBAC & Permissions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Super Admin', 'Tenant Admin', 'Manager', 'Supervisor', 'Employee'].map(
                        (role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1 font-body text-xs text-brand-navy shadow-sm"
                          >
                            {role}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center my-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-px h-4 bg-brand-gold" />
                      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-brand-gold" />
                    </div>
                  </div>

                  {/* Data Layer */}
                  <div className="rounded-lg bg-brand-navy p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="size-4 text-brand-gold" />
                      <p className="font-heading text-xs uppercase tracking-wider text-white/70">
                        Isolated Data Store
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['Projects', 'Resources', 'Costs'].map((d) => (
                        <div key={d} className="rounded-md bg-white/10 px-2.5 py-1.5 text-center">
                          <span className="font-body text-xs text-white/80">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section id="pricing" className="bg-navy-gradient relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-brand-gold/5 blur-3xl" />
        </div>
        <div className="container-brand relative z-10 py-20 lg:py-28 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.h2
              variants={fadeUp}
              className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-balance max-w-3xl mx-auto"
            >
              Ready to Transform Your{' '}
              <span className="text-gradient">Construction Operations?</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-5 font-body text-white/60 text-lg max-w-xl mx-auto leading-relaxed"
            >
              Join the growing number of construction enterprises that trust SmartBuild
              to manage their project portfolios. Start your free trial today.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold text-base px-8 h-12"
                asChild
              >
                <Link href="/register">
                  <CheckCircle2 className="size-4" />
                  Register Free
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white text-base px-8 h-12"
                asChild
              >
                <Link href="#">Contact Sales</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-auto bg-brand-navy border-t border-white/10">
        <div className="container-brand py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
              <Image
                src="/brand/smartbuild-app-dark.svg"
                alt="SmartBuild"
                width={140}
                height={36}
                className="h-8 w-auto brightness-0 invert mb-4"
              />
              <p className="font-body text-sm text-white/50 leading-relaxed max-w-xs">
                Enterprise Project Portfolio Management for the construction industry.
              </p>
              {/* Social links */}
              <div className="flex gap-3 mt-5">
                {[
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Linkedin, label: 'LinkedIn' },
                  { icon: Github, label: 'GitHub' },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-brand-gold/15 hover:text-brand-gold transition-colors"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-heading text-sm font-semibold text-white mb-4">
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-body text-sm text-white/50 hover:text-brand-gold transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="bg-white/10 my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-white/40">
              &copy; {new Date().getFullYear()} SmartBuild. All rights reserved.
            </p>
            <p className="font-body text-xs text-white/30">
              Built for the construction industry, powered by the cloud.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
