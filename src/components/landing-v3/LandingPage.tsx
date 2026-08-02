'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, ChevronRight, Play, Building2, CalendarDays, Wrench,
  DollarSign, Users, FileText, Truck, Package, Cpu, BarChart3,
  Shield, Globe, CheckCircle2, Menu, X, MapPin, Clock, Briefcase,
  HardHat, Zap, Factory, ClipboardList, TrendingUp, Star,
  Mail, Phone, Linkedin, Twitter, Facebook, Youtube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Image Constants ───
const IMG = {
  hero: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e12158f7efe.jpg',
  heroDash: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7f4a72632c32.jpg',
  project1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fde4d2e2b071.jpg',
  project2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/906f3b286926.jpg',
  project3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a5a80a44b5e0.jpg',
  project4: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/81018abdd818.jpg',
  project5: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/773b5383ceb5.jpg',
  team1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/14a6dd509cbe.jpg',
  team2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bec65e1e4f76.jpg',
  maintenance1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bbfb032c90cb.jpg',
  maintenance2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a8d425d15bec.jpg',
  portrait1: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/eb094dd1a2d7.jpg',
  portrait2: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3b5eafec215f.jpg',
  portrait3: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2a48362f20a1.jpg',
  ctaBg: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f75baa9c3133.jpg',
  architect: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b0dca9bec323.jpg',
  safety: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6f3bd4041190.png',
}

// ─── Animation Wrapper ───
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Section Wrapper ───
function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('py-16 md:py-24 lg:py-28', className)}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">{children}</div>
    </section>
  )
}

// ─── Data ───
const NAV_LINKS = [
  { label: 'Platform', href: '#features' },
  { label: 'Projects', href: '#showcase' },
  { label: 'Industries', href: '#industries' },
  { label: 'Resources', href: '#testimonials' },
  { label: 'Pricing', href: '/pricing' },
]

const TRUST_COMPANIES = [
  'Turner Construction', 'Bechtel Group', 'AECOM', 'Skanska',
  'Komatsu', 'Volvo CE', 'Siemens', 'Caterpillar',
]

const PROJECTS = [
  { img: IMG.project1, title: 'Meridian Tower', location: 'Kuala Lumpur, Malaysia', value: '$340M', status: 'In Progress', team: 42, type: 'High-Rise Residential' },
  { img: IMG.project2, title: 'North-South Expressway Extension', location: 'Johor, Malaysia', value: '$1.2B', status: 'On Track', team: 128, type: 'Infrastructure' },
  { img: IMG.project3, title: 'Penang General Hospital', location: 'Penang, Malaysia', value: '$280M', status: 'Completed', team: 65, type: 'Healthcare' },
  { img: IMG.project4, title: 'KL Financial District', location: 'Kuala Lumpur, Malaysia', value: '$520M', status: 'In Progress', team: 89, type: 'Commercial' },
  { img: IMG.project5, title: 'Sarawak Power Station', location: 'Sarawak, Malaysia', value: '$890M', status: 'Commissioning', team: 54, type: 'Energy' },
]

const FEATURES = [
  { icon: Building2, title: 'Project Management', desc: 'Plan, schedule, and execute projects with full visibility across portfolios. WBS, milestones, and critical path tracking.' },
  { icon: CalendarDays, title: 'Scheduling', desc: 'Gantt charts, resource-loaded schedules, and real-time progress tracking. Primavera-compatible imports.' },
  { icon: ClipboardList, title: 'Tender Management', desc: 'End-to-end tender lifecycle — from RFP to award. Automated evaluation, bid comparison, and compliance.' },
  { icon: Wrench, title: 'Maintenance', desc: 'Preventive, corrective, and condition-based maintenance. Work orders, asset tracking, and SLA management.' },
  { icon: DollarSign, title: 'Finance & Cost', desc: 'Budget tracking, cost forecasting, progress claims, variations, and financial reporting in real-time.' },
  { icon: Users, title: 'HR & Workforce', desc: 'Attendance, payroll, certifications, competency matrices, and labor allocation across sites.' },
  { icon: Package, title: 'Inventory', desc: 'Material tracking, warehouse management, issuance, returns, and automated reorder points.' },
  { icon: Truck, title: 'Procurement', desc: 'Purchase orders, vendor management, delivery tracking, and three-way matching for cost control.' },
  { icon: Cpu, title: 'Asset Management', desc: 'Equipment lifecycle, maintenance schedules, utilization rates, and depreciation tracking.' },
  { icon: Zap, title: 'AI Assistant', desc: 'Predictive analytics, risk scoring, document intelligence, and natural-language project queries.' },
]

const STATS = [
  { value: '2,400+', label: 'Active Projects' },
  { value: '180+', label: 'Companies' },
  { value: '48,000+', label: 'Employees Managed' },
  { value: '12,000+', label: 'Assets Tracked' },
  { value: '85,000+', label: 'Work Orders / Year' },
  { value: '16', label: 'Countries' },
]

const TESTIMONIALS = [
  {
    img: IMG.portrait1,
    name: 'Rajesh Kumar',
    role: 'Director of Operations',
    company: 'Gamuda Engineering',
    text: 'SmartBuild replaced three separate systems we were using. Our project reporting time dropped from days to hours, and we finally have real-time visibility across all active sites.',
  },
  {
    img: IMG.portrait2,
    name: 'Sarah Chen',
    role: 'VP of Project Controls',
    company: 'AECOM Asia Pacific',
    text: 'The scheduling module alone justified our investment. We imported our Primavera data seamlessly and the AI-driven risk alerts have caught potential delays weeks before they became critical.',
  },
  {
    img: IMG.portrait3,
    name: 'Mohamed Ismail',
    role: 'Head of Facilities',
    company: 'Petronas Group',
    text: 'Our maintenance turnaround time improved by 40% after deploying SmartBuild. The work order system and asset tracking give us complete control over our facility operations.',
  },
]

const CASE_STUDY = {
  img: IMG.hero,
  company: 'UEM Sunrise',
  industry: 'Mixed-Use Development',
  challenge: 'Managing 14 concurrent projects across 3 countries with disparate systems, no real-time visibility, and a 23% average schedule overrun.',
  solution: 'Deployed SmartBuild as a unified platform replacing 5 legacy tools. Migrated all scheduling, cost, and document management into a single integrated system with AI-powered risk monitoring.',
  results: [
    { label: 'Schedule Overrun', before: '23%', after: '7%' },
    { label: 'Cost Variance', before: '18%', after: '4%' },
    { label: 'Reporting Time', before: '5 days', after: '2 hours' },
    { label: 'Document Retrieval', before: '45 min', after: '30 sec' },
  ],
  roi: '340%',
}

const FOOTER_LINKS = {
  Products: ['Project Management', 'Scheduling', 'Tender Management', 'Maintenance', 'Finance & Cost', 'HR & Workforce', 'Asset Management', 'AI Assistant'],
  Industries: ['Construction', 'Oil & Gas', 'Manufacturing', 'Healthcare', 'Infrastructure', 'Government', 'Facility Management', 'Energy'],
  Resources: ['Documentation', 'API Reference', 'Case Studies', 'Blog', 'Webinars', 'Release Notes'],
  Company: ['About Us', 'Careers', 'Contact', 'Partners', 'Press'],
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════

// ─── Header ───
function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
    )}>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B2345]">
              <HardHat className="h-4.5 w-4.5 text-white" />
            </div>
            <span className={cn('text-lg font-bold tracking-tight transition-colors', scrolled ? 'text-[#0B2345]' : 'text-white')}>SmartBuild</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white/85 hover:text-white hover:bg-white/10'
                )}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className={cn('px-3 py-2 text-sm font-medium transition-colors', scrolled ? 'text-slate-700 hover:text-[#0B2345]' : 'text-white/85 hover:text-white')}>
              Sign In
            </a>
            <Link href="/register">
              <Button size="sm" className="bg-[#E87722] hover:bg-[#d06a1d] text-white rounded-lg">
                Request Demo
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className={cn('h-5 w-5', scrolled ? 'text-slate-900' : 'text-white')} /> : <Menu className={cn('h-5 w-5', scrolled ? 'text-slate-900' : 'text-white')} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-5 py-4 space-y-1">
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t mt-3 flex flex-col gap-2">
              <a href="/login" className="px-3 py-2.5 text-sm font-medium text-slate-700">Sign In</a>
              <Link href="/register"><Button className="w-full bg-[#E87722] hover:bg-[#d06a1d] text-white rounded-lg">Request Demo</Button></Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// ─── Hero ───
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image src={IMG.hero} alt="Construction engineers on site" fill className="object-cover" priority sizes="100vw" quality={85} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B2345]/90 via-[#0B2345]/70 to-[#0B2345]/40" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-32 md:py-40">
        <div className="max-w-2xl">
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-medium text-white/90 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E87722]" />
              Enterprise Construction Platform
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight">
              Manage Construction, Maintenance, and Operations from One Platform
            </h1>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-xl">
              SmartBuild helps construction companies manage projects, maintenance, teams, finances, assets, and operations from a single enterprise platform.
            </p>
          </FadeUp>
          <FadeUp delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-[#E87722] hover:bg-[#d06a1d] text-white rounded-lg h-12 px-6 text-sm font-semibold">
                  Request Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-lg h-12 px-6 text-sm font-semibold">
                  Explore Platform
                </Button>
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── Trusted By ───
function TrustedBy() {
  return (
    <section className="bg-white border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-12">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">Trusted by leading construction and engineering companies</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {TRUST_COMPANIES.map(name => (
            <span key={name} className="text-lg font-bold text-slate-300 hover:text-slate-400 transition-colors select-none">{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Project Showcase ───
function ProjectShowcase() {
  return (
    <Section id="showcase" className="bg-slate-50">
      <FadeUp>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E87722]">Real Projects</span>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2345] tracking-tight">Delivering Complex Projects Worldwide</h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">From high-rise towers to infrastructure megaprojects, SmartBuild powers the world's most demanding construction programs.</p>
        </div>
      </FadeUp>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((p, i) => (
          <FadeUp key={p.title} delay={i * 0.08}>
            <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-56 overflow-hidden">
                <Image src={p.img} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
                    p.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    p.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                    p.status === 'Commissioning' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  )}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{p.type}</p>
                <h3 className="mt-1 text-base font-bold text-[#0B2345]">{p.title}</h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{p.team}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-[#0B2345]">{p.value}</span>
                  <span className="text-xs text-[#E87722] font-medium flex items-center gap-0.5">View Details <ChevronRight className="h-3 w-3" /></span>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </Section>
  )
}

// ─── Platform Features ───
function PlatformFeatures() {
  const [activeFeature, setActiveFeature] = useState(0)
  const featureImages = [IMG.architect, IMG.team1, IMG.heroDash, IMG.maintenance1, IMG.safety, IMG.maintenance2, IMG.project4, IMG.project2, IMG.project5, IMG.team2]

  return (
    <Section id="features" className="bg-white">
      <FadeUp>
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E87722]">Platform</span>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2345] tracking-tight">One Platform. Every Operation.</h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">Ten integrated modules designed for the construction and engineering industry. No more switching between disconnected tools.</p>
        </div>
      </FadeUp>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Feature List */}
        <div className="space-y-1">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <button
                key={f.title}
                onClick={() => setActiveFeature(i)}
                className={cn(
                  'w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200',
                  activeFeature === i
                    ? 'bg-[#0B2345] text-white'
                    : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
                  activeFeature === i ? 'bg-white/15 text-white' : 'bg-slate-100 text-[#0B2345]'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={cn('text-sm font-bold', activeFeature === i ? 'text-white' : 'text-[#0B2345]')}>{f.title}</h3>
                  <p className={cn('mt-1 text-xs leading-relaxed', activeFeature === i ? 'text-white/70' : 'text-slate-500')}>{f.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
        {/* Feature Image */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-lg">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="ml-3 text-[11px] text-slate-400 font-medium">smartbuild.app — {FEATURES[activeFeature].title.toLowerCase()}</span>
            </div>
            <div className="relative h-[320px] md:h-[420px]">
              <Image
                src={featureImages[activeFeature]}
                alt={FEATURES[activeFeature].title}
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── Team Collaboration ───
function TeamCollaboration() {
  return (
    <section id="industries" className="bg-[#0B2345] relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={IMG.team1} alt="Engineers in a meeting" fill className="object-cover opacity-20" sizes="100vw" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <FadeUp>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#E87722]">Collaboration</span>
              <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                Built for Teams That Build the World
              </h2>
              <p className="mt-5 text-white/65 leading-relaxed">
                From site supervisors to C-suite executives, SmartBuild gives every team member the tools they need. Real-time updates, document sharing, and communication — all in context of the project.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: 'Role-Based Access' },
                  { icon: FileText, label: 'Document Control' },
                  { icon: Globe, label: 'Multi-Language' },
                  { icon: Shield, label: 'Audit Trail' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-3">
                    <item.icon className="h-4 w-4 text-[#E87722] shrink-0" />
                    <span className="text-sm font-medium text-white/85">{item.label}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
          <FadeUp delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image src={IMG.team2} alt="Team reviewing drawings" width={640} height={470} className="w-full h-auto rounded-2xl" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── Maintenance Management ───
function MaintenanceSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Image src={IMG.maintenance1} alt="HVAC technician at work" width={640} height={480} className="w-full h-auto rounded-2xl" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
          </FadeUp>
          <div>
            <FadeUp>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#E87722]">Maintenance</span>
              <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2345] tracking-tight leading-tight">
                Keep Every Asset Running at Peak Performance
              </h2>
              <p className="mt-5 text-slate-500 leading-relaxed">
                From HVAC systems to electrical panels, SmartBuild maintenance management covers every aspect of facility operations. Preventive schedules, corrective work orders, and condition-based monitoring — all unified in one system.
              </p>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="mt-8 space-y-4">
                {[
                  'Preventive, corrective, and predictive maintenance workflows',
                  'Automated work order generation and assignment',
                  'Asset lifecycle tracking with depreciation schedules',
                  'SLA compliance monitoring and escalation rules',
                  'Mobile-first interface for field technicians',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Statistics ───
function StatisticsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="text-center"
            >
              <p className="text-2xl md:text-3xl font-bold text-[#0B2345] tracking-tight">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ───
function TestimonialsSection() {
  return (
    <Section id="testimonials" className="bg-white">
      <FadeUp>
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#E87722]">Testimonials</span>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2345] tracking-tight">Trusted by Industry Leaders</h2>
        </div>
      </FadeUp>
      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <FadeUp key={t.name} delay={i * 0.1}>
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-full overflow-hidden bg-slate-100 shrink-0">
                  <Image src={t.img} alt={t.name} fill className="object-cover" sizes="44px" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B2345]">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}, {t.company}</p>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </Section>
  )
}

// ─── Case Study ───
function CaseStudySection() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 lg:py-28">
        <FadeUp>
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#E87722]">Case Study</span>
            <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B2345] tracking-tight">How UEM Sunrise Reduced Schedule Overruns by 70%</h2>
          </div>
        </FadeUp>
        <div className="grid lg:grid-cols-5 gap-8">
          <FadeUp className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden h-full min-h-[300px]">
              <Image src={CASE_STUDY.img} alt={CASE_STUDY.company} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-bold text-lg">{CASE_STUDY.company}</p>
                <p className="text-white/70 text-sm">{CASE_STUDY.industry}</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.1} className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white border border-slate-100 p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Challenge</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{CASE_STUDY.challenge}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Solution</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{CASE_STUDY.solution}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#0B2345] p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CASE_STUDY.results.map(r => (
                  <div key={r.label}>
                    <p className="text-xs text-white/50 mb-1">{r.label}</p>
                    <p className="text-sm font-bold text-red-400 line-through">{r.before}</p>
                    <p className="text-lg font-bold text-emerald-400">{r.after}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#E87722]/10 border border-[#E87722]/20 p-5">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#E87722]">{CASE_STUDY.roi}</p>
                <p className="text-xs font-medium text-[#E87722]/80">Return on Investment</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">Full platform ROI achieved within 14 months of deployment across 14 active projects.</p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ───
function CTASection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={IMG.ctaBg} alt="Construction site at sunset" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[#0B2345]/85" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-5 md:px-8 py-20 md:py-28 text-center">
        <FadeUp>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
            Ready to Modernize Your Construction Operations?
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Join 180+ construction and engineering companies already using SmartBuild to deliver projects on time and on budget.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-[#E87722] hover:bg-[#d06a1d] text-white rounded-lg h-12 px-8 text-sm font-semibold">
                Request Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="/register">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-lg h-12 px-8 text-sm font-semibold">
                Contact Sales
              </Button>
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── Footer ───
function Footer() {
  return (
    <footer className="bg-[#0B2345] text-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <HardHat className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold">SmartBuild</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              Enterprise construction management platform for projects, maintenance, and operations.
            </p>
            <div className="flex items-center gap-3">
              {[Linkedin, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-3 text-white/90">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-white/45 hover:text-white/80 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35">&copy; {new Date().getFullYear()} SmartBuild Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white/35 hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-white/35 hover:text-white/60 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-white/35 hover:text-white/60 transition-colors">Cookie Policy</a>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/35">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />info@smartbuild.app</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />+60 3-1234 5678</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <TrustedBy />
      <ProjectShowcase />
      <PlatformFeatures />
      <TeamCollaboration />
      <MaintenanceSection />
      <StatisticsSection />
      <TestimonialsSection />
      <CaseStudySection />
      <CTASection />
      <Footer />
    </div>
  )
}
