'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowRight, Check, ChevronDown, Star, Play, Menu, X, Search,
  LayoutDashboard, Workflow, BrainCircuit, ShieldCheck, FolderKanban, CalendarRange,
  GanttChart, FileText, Wrench, Settings2, Database, DollarSign, Users,
  Package, ShoppingCart, Building, QrCode, Globe, HardHat, Sparkles,
  Home, Zap, Route, BarChart3, GitBranch, FileCheck, ShieldAlert, Target,
  TriangleAlert, MessageSquareWarning, UserCheck, ClipboardList, CheckCircle,
  Receipt, CreditCard, FileBarChart, CalendarClock, MessageCircle, LineChart,
  Quote, ExternalLink, ChevronRight, Mail, Phone, MapPin, Send, Sun, Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { FadeIn, StaggerGroup, StaggerItem, useCountUp } from '@/components/eppm/motion'
import { useTheme } from 'next-themes'

/* ================================================================== */
/*  Types                                                                */
/* ================================================================== */
interface Section { type: string; name: string; order: number; visible: boolean; config: any }
interface Testimonial { name: string; position: string; company: string; content: string; rating: number }
interface Faq { question: string; answer: string; category: string }
interface Partner { name: string; logo: string; category: string }
interface Plan { name: string; description: string; priceMonthly: number; priceAnnual: number; maxUsers: number; maxProjects: number; maxStorage: number; features: string; sortOrder: number; active: boolean; aiCredits: number; mobileAccess: boolean; apiAccess: boolean; integrations: boolean; customDomain: boolean; prioritySupport: boolean }
interface MenuItem { label: string; url: string; type: string; children?: MenuItem[] }
interface BlogPost { title: string; slug: string; excerpt: string; authorName: string; readingTime: number; publishedAt: string; featured: boolean }
interface CaseStudy { title: string; slug: string; client: string; industry: string; summary: string; results: string; coverImage: string }

interface LandingData {
  page: { sections: Section[] } | null
  testimonials: Testimonial[]; faqs: Faq[]; partners: Partner[]
  plans: Plan[]; menu: MenuItem[]; blogPosts: BlogPost[]; caseStudies: CaseStudy[]
}

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Workflow, BrainCircuit, ShieldCheck, FolderKanban, CalendarRange,
  GanttChart, FileText, Wrench, Settings2, Database, DollarSign, Users,
  Package, ShoppingCart, Building, QrCode, Globe, HardHat, Sparkles,
  Home, Zap, Route, BarChart3, GitBranch, FileCheck, ShieldAlert, Target,
  Home, Zap, Route, BarChart3, GitBranch, FileCheck, ShieldAlert, Target,
  TriangleAlert, MessageSquareWarning, UserCheck, ClipboardList, CheckCircle,
  Receipt, CreditCard, FileBarChart, CalendarClock, MessageCircle, LineChart,
}

function getIcon(name: string) { return ICON_MAP[name] || LayoutDashboard }

/* ================================================================== */
/*  Animated Number                                                      */
/* ================================================================== */
function AnimatedStat({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const count = useCountUp(inView ? value : 0, 2000)
  const display = value >= 1000 ? (count / 1000).toFixed(count >= 1000 ? 1 : 0) + 'K' : value % 1 !== 0 ? count.toFixed(1) : Math.floor(count)
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-bold text-gradient">{display}{suffix}</div>
      <div className="text-sm text-white/70 mt-1">{label}</div>
    </div>
  )
}

/* ================================================================== */
/*  Auto-Scrolling Logos                                                  */
/* ================================================================== */
function LogoCarousel({ items }: { items: { name: string }[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      <motion.div className="flex gap-16 w-max" animate={{ x: ['0%', '-50%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex-shrink-0 flex items-center gap-2 text-muted-foreground/50 font-semibold text-lg hover:text-foreground/70 transition-colors">
            <Building className="w-6 h-6" /> {item.name}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ================================================================== */
/*  MAIN PAGE                                                            */
/* ================================================================== */
export default function LandingPage() {
  const [data, setData] = useState<LandingData | null>(null)
  const [annual, setAnnual] = useState(false)
  const [faqSearch, setFaqSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    fetch('/api/cms/landing').then(r => r.json()).then(setData).catch(() => setData(null))
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    if (!data?.testimonials?.length) return
    const iv = setInterval(() => setTestimonialIdx(i => (i + 1) % data.testimonials.length), 5000)
    return () => clearInterval(iv)
  }, [data?.testimonials?.length])

  const sections = data?.page?.sections || []
  const getSection = (type: string) => sections.find(s => s.type === type)
  const cfg = (type: string, key: string, fallback: any = '') => getSection(type)?.config?.[key] ?? fallback

  const testimonials = data?.testimonials || []
  const faqs = data?.faqs || []
  const plans = data?.plans || []
  const partners = data?.partners || []
  const menu = data?.menu || []
  const blogPosts = data?.blogPosts || []
  const caseStudies = data?.caseStudies || []

  const heroConfig = getSection('hero')?.config || {}
  const trustedConfig = getSection('trusted-by')?.config || { logos: [] }
  const overviewConfig = getSection('platform-overview')?.config || { cards: [] }
  const featuresConfig = getSection('features')?.config || { modules: [] }
  const industriesConfig = getSection('industries')?.config || { items: [] }
  const enterpriseConfig = getSection('enterprise-modules')?.config || { modules: [] }
  const workflowConfig = getSection('workflow')?.config || { steps: [] }
  const aiConfig = getSection('ai-features')?.config || { features: [] }
  const statsConfig = getSection('statistics')?.config || { stats: [] }
  const newsConfig = getSection('news')?.config || { items: [] }
  const ctaConfig = getSection('cta')?.config || {}
  const footerConfig = getSection('footer')?.config || {}

  const filteredFaqs = faqSearch
    ? faqs.filter(f => f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase()))
    : faqs

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ============ 1. HEADER ============ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-dark shadow-lg' : 'bg-transparent'}`}>
        <div className="container-brand flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/brand/smartbuild-primary-logo.svg" alt="SmartBuild" className="h-8" />
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {menu.map((item) => (
              item.children?.length ? (
                <div key={item.label} className="relative group">
                  <button className="px-3 py-2 text-sm text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                    {item.label} <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 glass-dark rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {item.children.map(c => (
                      <a key={c.label} href={c.url || '#'} className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors">{c.label}</a>
                    ))}
                  </div>
                </div>
              ) : (
                <a key={item.label} href={item.url || '#'} className="px-3 py-2 text-sm text-white/80 hover:text-white transition-colors">{item.label}</a>
              )
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-white/70 hover:text-white transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login"><Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">Login</Button></Link>
            <Link href="/register"><Button className="bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345] font-semibold">Register</Button></Link>
            <a href="#contact"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Request Demo</Button></a>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="p-2 text-white"><Menu className="w-6 h-6" /></button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-[#0B2345] border-white/10">
              <SheetHeader><SheetTitle className="text-white">SmartBuild</SheetTitle></SheetHeader>
              <nav className="flex flex-col gap-1 mt-6">
                {menu.map(item => (
                  <div key={item.label}>
                    <a href={item.url || '#'} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{item.label}</a>
                    {item.children?.map(c => (
                      <a key={c.label} href={c.url || '#'} onClick={() => setMobileOpen(false)} className="block px-8 py-2 text-sm text-white/60 hover:text-white transition-colors">{c.label}</a>
                    ))}
                  </div>
                ))}
                <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full border-white/20 text-white">Login</Button></Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}><Button className="w-full bg-[#F5A623] text-[#0B2345]">Register</Button></Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ============ 2. HERO ============ */}
      <section id="hero" className="relative bg-brand-hero min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,166,35,0.08),transparent_50%)]" />
        <div className="container-brand relative z-10 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <FadeIn><Badge variant="outline" className="border-[#F5A623]/30 bg-[#F5A623]/10 text-[#F5A623] mb-6">{heroConfig.badge || '🚀 Enterprise Platform v3.0'}</Badge></FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight font-heading">
                {heroConfig.headline || 'Build Smarter. Manage Better. Deliver Faster.'}
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
                {heroConfig.subheadline || 'The all-in-one enterprise platform for construction, facility management, EPPM, ERP, and CMMS — powered by AI.'}
              </p>
            </FadeIn>
            <FadeIn delay={0.3} className="flex flex-wrap gap-4 justify-center mt-8">
              <Link href="/register"><Button size="lg" className="bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345] font-semibold text-base px-8 h-12">{(heroConfig.primaryCta as any)?.label || 'Start Free Trial'} <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
              <a href="#demo"><Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-12"><Play className="mr-2 w-4 h-4" /> {(heroConfig.secondaryCta as any)?.label || 'Watch Demo'}</Button></a>
            </FadeIn>
            <FadeIn delay={0.5} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
              {(heroConfig.stats || [
                { value: '2,500+', label: 'Projects' }, { value: '150+', label: 'Clients' },
                { value: '35+', label: 'Countries' }, { value: '99.9%', label: 'Uptime' },
              ]).map((s: any, i: number) => (
                <div key={i} className="glass rounded-xl p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-gradient">{s.value}</div>
                  <div className="text-xs text-white/60 mt-1">{s.label}</div>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ============ 3. TRUSTED BY ============ */}
      <section id="trusted-by" className="section-padding bg-background">
        <div className="container-brand">
          <FadeIn className="text-center mb-8">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Trusted by Industry Leaders Worldwide</h2>
          </FadeIn>
          <LogoCarousel items={trustedConfig.logos?.length ? trustedConfig.logos : partners.slice(0, 8)} />
        </div>
      </section>

      {/* ============ 4. PLATFORM OVERVIEW ============ */}
      <section id="platform-overview" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">{overviewConfig.headline || 'One Platform. Unlimited Possibilities.'}</h2>
            <p className="mt-4 text-muted-foreground">{overviewConfig.subheadline || 'SmartBuild unifies your entire project lifecycle in a single intelligent platform.'}</p>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(overviewConfig.cards || [
              { icon: 'LayoutDashboard', title: 'Real-Time Dashboards', desc: 'Live KPIs, EVM metrics, and executive reports.' },
              { icon: 'Workflow', title: 'Automated Workflows', desc: 'Configurable approval chains and business rules.' },
              { icon: 'BrainCircuit', title: 'AI-Powered Insights', desc: 'Predictive analytics and smart scheduling.' },
              { icon: 'ShieldCheck', title: 'Enterprise Security', desc: 'Role-based access and audit trails.' },
            ]).map((c: any, i: number) => {
              const Icon = getIcon(c.icon)
              return (
                <StaggerItem key={i}>
                  <Card className="glass border-white/10 hover:border-[#F5A623]/30 transition-all duration-300 h-full group">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-4 group-hover:bg-[#F5A623]/20 transition-colors">
                        <Icon className="w-6 h-6 text-[#F5A623]" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 5. CORE FEATURES ============ */}
      <section id="features" className="section-padding bg-navy-gradient">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">{featuresConfig.headline || 'Comprehensive Feature Set'}</h2>
            <p className="mt-4 text-white/60">{featuresConfig.subheadline || 'Every tool your enterprise needs, integrated into one powerful platform.'}</p>
          </FadeIn>
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(featuresConfig.modules || [
              { icon: 'FolderKanban', title: 'Projects', desc: 'Full project lifecycle management' },
              { icon: 'CalendarRange', title: 'Scheduling', desc: 'Gantt charts and lookahead planning' },
              { icon: 'GanttChart', title: 'Gantt', desc: 'Interactive Gantt with dependencies' },
              { icon: 'FileText', title: 'Tender & Bid', desc: 'Tender management and contracts' },
              { icon: 'Wrench', title: 'Maintenance', desc: 'Preventive & corrective maintenance' },
              { icon: 'Settings2', title: 'CMMS', desc: 'Maintenance management system' },
              { icon: 'Database', title: 'ERP', desc: 'Enterprise resource planning' },
              { icon: 'DollarSign', title: 'Finance', desc: 'Budget tracking and cost control' },
              { icon: 'Users', title: 'HR', desc: 'Workforce management' },
              { icon: 'Package', title: 'Inventory', desc: 'Material and warehouse management' },
              { icon: 'ShoppingCart', title: 'Procurement', desc: 'Purchase orders and vendors' },
              { icon: 'Building', title: 'Assets', desc: 'Asset registry and QR tagging' },
              { icon: 'QrCode', title: 'QR', desc: 'QR code generation' },
              { icon: 'Globe', title: 'Customer Portal', desc: 'Client self-service portal' },
              { icon: 'HardHat', title: 'Technician Portal', desc: 'Mobile-first field interface' },
              { icon: 'Sparkles', title: 'AI Assistant', desc: 'Conversational AI' },
            ]).map((m: any, i: number) => {
              const Icon = getIcon(m.icon)
              return (
                <StaggerItem key={i}>
                  <Card className="glass border-white/5 hover:border-[#F5A623]/20 transition-all duration-300 h-full group cursor-pointer">
                    <CardContent className="p-5">
                      <Icon className="w-8 h-8 text-[#F5A623] mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-white text-sm mb-1">{m.title}</h3>
                      <p className="text-xs text-white/50">{m.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 6. INDUSTRIES ============ */}
      <section id="industries" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">{industriesConfig.headline || 'Built for Every Industry'}</h2>
            <p className="mt-4 text-muted-foreground">{industriesConfig.subheadline || 'From construction sites to hospital corridors — SmartBuild adapts.'}</p>
          </FadeIn>
          <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(industriesConfig.items || [
              { icon: 'Building', title: 'Construction', desc: 'Commercial, residential, infrastructure' },
              { icon: 'Building', title: 'Facility Mgmt', desc: 'Integrated workplace management' },
              { icon: 'Cog', title: 'Engineering', desc: 'MEP and multidisciplinary projects' },
              { icon: 'Fuel', title: 'Oil & Gas', desc: 'Upstream, downstream, pipelines' },
              { icon: 'Factory', title: 'Manufacturing', desc: 'Production and quality control' },
              { icon: 'Landmark', title: 'Government', desc: 'Public infrastructure delivery' },
              { icon: 'HeartPulse', title: 'Healthcare', desc: 'Hospital facility management' },
              { icon: 'GraduationCap', title: 'Education', desc: 'Campus management' },
              { icon: 'Hotel', title: 'Hospitality', desc: 'Hotel and resort operations' },
              { icon: 'Home', title: 'Real Estate', desc: 'Property development' },
              { icon: 'Zap', title: 'Utilities', desc: 'Power and utility infrastructure' },
              { icon: 'Route', title: 'Infrastructure', desc: 'Roads, bridges, rail, transport' },
            ]).map((item: any, i: number) => {
              const Icon = getIcon(item.icon)
              return (
                <StaggerItem key={i}>
                  <Card className="h-full group hover:shadow-lg hover:border-[#F5A623]/20 transition-all duration-300 cursor-pointer">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#0B2345]/5 flex items-center justify-center mb-3 group-hover:bg-[#F5A623]/10 transition-colors">
                        <Icon className="w-7 h-7 text-[#0B2345]" />
                      </div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 7. ENTERPRISE MODULES ============ */}
      <section id="enterprise-modules" className="section-padding bg-muted/50">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">{enterpriseConfig.headline || 'Enterprise-Grade Modules'}</h2>
            <p className="mt-4 text-muted-foreground">{enterpriseConfig.subheadline || 'Deep functionality for complex project environments.'}</p>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(enterpriseConfig.modules || [
              { icon: 'BarChart3', title: 'EVM & Cost Control', desc: 'Earned Value Management with CPI, SPI, and forecast analytics for precise project financial oversight.' },
              { icon: 'GitBranch', title: 'Program Management', desc: 'Multi-project portfolio coordination with resource sharing and cross-project dependencies.' },
              { icon: 'FileCheck', title: 'Document Control', desc: 'Transmittals, submittals, drawing management with revision tracking and approval workflows.' },
              { icon: 'ShieldAlert', title: 'HSE Management', desc: 'Health, Safety & Environment compliance with incident tracking and safety inspections.' },
              { icon: 'Target', title: 'Quality Assurance', desc: 'Inspection workflows, punch lists, non-conformance reports, and quality metrics.' },
              { icon: 'TriangleAlert', title: 'Risk Management', desc: 'Risk registers, mitigation plans, Monte Carlo simulation, and risk scoring.' },
            ]).map((m: any, i: number) => {
              const Icon = getIcon(m.icon)
              return (
                <StaggerItem key={i}>
                  <Card className="h-full border-l-4 border-l-[#F5A623] hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <Icon className="w-8 h-8 text-[#0B2345] mb-3" />
                      <h3 className="font-semibold text-lg mb-2">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 8. WORKFLOW SHOWCASE ============ */}
      <section id="workflow" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">{workflowConfig.headline || 'Streamlined Workflows'}</h2>
            <p className="mt-4 text-muted-foreground">{workflowConfig.subheadline || 'From complaint to payment — every process automated and trackable.'}</p>
          </FadeIn>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-3 md:gap-0 overflow-x-auto pb-4">
            {(workflowConfig.steps || [
              { icon: 'MessageSquareWarning', title: 'Complaint', desc: 'Issue reported' },
              { icon: 'UserCheck', title: 'Assignment', desc: 'Auto-assigned' },
              { icon: 'ClipboardList', title: 'Work Order', desc: 'Generated' },
              { icon: 'CheckCircle', title: 'Completion', desc: 'Photo evidence' },
              { icon: 'Receipt', title: 'Invoice', desc: 'Auto-generated' },
              { icon: 'CreditCard', title: 'Payment', desc: 'Processed' },
              { icon: 'BarChart3', title: 'Reports', desc: 'Real-time' },
            ]).map((step: any, i: number, arr: any[]) => {
              const Icon = getIcon(step.icon)
              return (
                <FadeIn key={i} delay={i * 0.1} className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-center text-center w-28">
                    <div className="w-14 h-14 rounded-2xl bg-[#0B2345] flex items-center justify-center mb-2">
                      <Icon className="w-7 h-7 text-[#F5A623]" />
                    </div>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="w-5 h-5 text-[#F5A623] flex-shrink-0 hidden md:block" />}
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ 9. AI FEATURES ============ */}
      <section id="ai-features" className="section-padding bg-navy-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.08),transparent_70%)]" />
        <div className="container-brand relative z-10">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/20 mb-4">AI-Powered</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">{aiConfig.headline || 'AI-Powered Intelligence'}</h2>
            <p className="mt-4 text-white/60">{aiConfig.subheadline || 'Leverage AI to make smarter, faster decisions.'}</p>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(aiConfig.features || [
              { icon: 'BrainCircuit', title: 'AI Dashboard', desc: 'Predictive KPIs and anomaly detection across all modules.' },
              { icon: 'FileBarChart', title: 'AI Reports', desc: 'Natural language report generation and automated insights.' },
              { icon: 'CalendarClock', title: 'AI Scheduling', desc: 'Intelligent resource allocation and schedule optimization.' },
              { icon: 'Search', title: 'AI Search', desc: 'Semantic search across documents and knowledge base.' },
              { icon: 'MessageCircle', title: 'AI Assistant', desc: 'Conversational AI for queries and recommendations.' },
              { icon: 'LineChart', title: 'AI Analytics', desc: 'Trend prediction, risk scoring, and forecasting.' },
            ]).map((f: any, i: number) => {
              const Icon = getIcon(f.icon)
              return (
                <StaggerItem key={i}>
                  <Card className="glass border-[#F5A623]/10 hover:border-[#F5A623]/30 transition-all duration-300 h-full group relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-24 h-24 bg-[#F5A623]/5 rounded-full blur-2xl group-hover:bg-[#F5A623]/10 transition-colors" />
                    <CardContent className="p-6 relative">
                      <Icon className="w-10 h-10 text-[#F5A623] mb-4" />
                      <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                      <p className="text-sm text-white/50">{f.desc}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 10. SCREENSHOTS ============ */}
      <section id="screenshots" className="section-padding bg-muted/30">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">See SmartBuild in Action</h2>
            <p className="mt-4 text-muted-foreground">Explore the powerful interface designed for enterprise teams.</p>
          </FadeIn>
          <FadeIn className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Executive Dashboard', 'Project Gantt', 'Cost Management', 'Mobile App'].map((title, i) => (
              <Card key={i} className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-[#0B2345] to-[#132D52] flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(245,166,35,0.15),transparent_50%)]" />
                  <div className="glass rounded-xl p-4 w-3/4">
                    <div className="h-2 w-1/2 bg-white/20 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-[#F5A623]/30 rounded mb-3" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-white/10 rounded" />
                      <div className="h-8 bg-white/10 rounded" />
                      <div className="h-8 bg-white/10 rounded" />
                      <div className="h-8 bg-white/10 rounded" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Click to explore</p>
                </CardContent>
              </Card>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ============ 11. TESTIMONIALS ============ */}
      <section id="testimonials" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">What Our Clients Say</h2>
            <p className="mt-4 text-muted-foreground">Trusted by leading enterprises across the globe.</p>
          </FadeIn>
          {testimonials.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div key={testimonialIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <Card className="p-8 md:p-12 relative">
                    <Quote className="absolute top-6 left-6 w-10 h-10 text-[#F5A623]/20" />
                    <p className="text-lg md:text-xl text-foreground/90 italic relative z-10">&ldquo;{testimonials[testimonialIdx]?.content}&rdquo;</p>
                    <div className="flex items-center gap-4 mt-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B2345] to-[#132D52] flex items-center justify-center text-white font-bold text-lg">
                        {testimonials[testimonialIdx]?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonials[testimonialIdx]?.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonials[testimonialIdx]?.position}, {testimonials[testimonialIdx]?.company}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5 mt-4">
                      {Array.from({ length: testimonials[testimonialIdx]?.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === testimonialIdx ? 'bg-[#F5A623] w-8' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============ 12. CASE STUDIES ============ */}
      <section id="case-studies" className="section-padding bg-muted/50">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Success Stories</h2>
            <p className="mt-4 text-muted-foreground">Real results from real projects.</p>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-3 gap-6">
            {caseStudies.length > 0 ? caseStudies.map((cs, i) => {
              const results = typeof cs.results === 'string' ? JSON.parse(cs.results) : cs.results || []
              return (
                <StaggerItem key={i}>
                  <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-[#0B2345] to-[#1a3a5c] flex items-center justify-center">
                      <Building className="w-12 h-12 text-white/20" />
                    </div>
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3">{cs.industry}</Badge>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-[#F5A623] transition-colors">{cs.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{cs.summary}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {results.slice(0, 4).map((r: any, j: number) => (
                          <div key={j} className="text-center p-2 bg-muted rounded-lg">
                            <div className="font-bold text-[#0B2345] text-sm">{r.metric}</div>
                            <div className="text-xs text-muted-foreground">{r.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            }) : (
              <p className="col-span-full text-center text-muted-foreground">Case studies coming soon.</p>
            )}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 13. STATISTICS ============ */}
      <section id="statistics" className="section-padding bg-navy-gradient">
        <div className="container-brand">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">SmartBuild by the Numbers</h2>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-5xl mx-auto">
            {(statsConfig.stats?.length ? statsConfig.stats : [
              { value: 2500, suffix: '+', label: 'Projects Managed' },
              { value: 150, suffix: '+', label: 'Enterprise Clients' },
              { value: 35, suffix: '+', label: 'Countries' },
              { value: 50000, suffix: '+', label: 'Active Users' },
              { value: 12, suffix: 'M+', label: 'Work Orders' },
              { value: 99.9, suffix: '%', label: 'Uptime' },
            ]).map((s: any, i: number) => (
              <AnimatedStat key={i} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ 14. PRICING ============ */}
      <section id="pricing" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-4">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Plans for Every Enterprise</h2>
            <p className="mt-4 text-muted-foreground">Start free, scale as you grow. No hidden fees.</p>
          </FadeIn>
          <FadeIn className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm ${!annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <span className={`text-sm ${annual ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Annual <Badge variant="outline" className="text-[#F5A623] border-[#F5A623]/30 text-xs ml-1">Save 20%</Badge></span>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {plans.filter(p => p.active).map((plan, i) => {
              const features: string[] = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features || []
              const price = annual ? plan.priceAnnual / 12 : plan.priceMonthly
              const isHighlighted = plan.name === 'Professional'
              const isCustom = plan.priceMonthly < 0
              return (
                <StaggerItem key={i}>
                  <Card className={`h-full flex flex-col relative ${isHighlighted ? 'border-2 border-[#F5A623] shadow-lg shadow-[#F5A623]/10' : 'border'}`}>
                    {isHighlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5A623] text-[#0B2345] text-xs font-bold px-3 py-1 rounded-full">Most Popular</div>}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-4">
                        {isCustom ? (
                          <span className="text-3xl font-bold">Custom</span>
                        ) : (
                          <div><span className="text-3xl font-bold">${price.toFixed(0)}</span><span className="text-muted-foreground text-sm">/mo</span></div>
                        )}
                      </div>
                      <ul className="space-y-2 flex-1 mb-6">
                        {features.map((f: string, j: number) => (
                          <li key={j} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" /> {f}</li>
                        ))}
                      </ul>
                      <Link href="/register">
                        <Button className={`w-full ${isHighlighted ? 'bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345]' : ''}`} variant={isHighlighted ? 'default' : 'outline'}>
                          {isCustom ? 'Contact Sales' : 'Get Started'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 15. FAQ ============ */}
      <section id="faq" className="section-padding bg-muted/30">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Frequently Asked Questions</h2>
            <p className="mt-4 text-muted-foreground">Everything you need to know about SmartBuild.</p>
          </FadeIn>
          <FadeIn className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search FAQs..." value={faqSearch} onChange={e => setFaqSearch(e.target.value)} className="pl-10" />
            </div>
          </FadeIn>
          <FadeIn className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card rounded-lg border px-4">
                  <AccordionTrigger className="text-left text-sm hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              )) : <p className="text-center text-muted-foreground py-8">No FAQs found.</p>}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* ============ 16. LATEST NEWS ============ */}
      <section id="news" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Latest News & Updates</h2>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-3 gap-6">
            {(newsConfig.items?.length ? newsConfig.items : [
              { title: 'SmartBuild v3.0 Launched with AI Analytics', date: '2025-01-15', excerpt: 'Introducing AI-powered dashboards and predictive scheduling.' },
              { title: 'Partnership with Top Construction Firms', date: '2025-01-08', excerpt: 'Selected as preferred EPPM platform for major developers.' },
              { title: 'New CMMS Module for Facility Management', date: '2024-12-20', excerpt: 'Comprehensive maintenance with QR-based work orders.' },
            ]).map((item: any, i: number) => (
              <StaggerItem key={i}>
                <Card className="h-full group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <Badge variant="outline" className="text-xs mb-3">{item.date}</Badge>
                    <h3 className="font-semibold group-hover:text-[#F5A623] transition-colors mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                    <div className="flex items-center gap-1 mt-4 text-sm text-[#F5A623] font-medium">Read more <ArrowRight className="w-3.5 h-3.5" /></div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 17. BLOG ============ */}
      <section id="blog" className="section-padding bg-muted/50">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Insights & Resources</h2>
            <p className="mt-4 text-muted-foreground">Expert perspectives on construction and facility management.</p>
          </FadeIn>
          <StaggerGroup className="grid md:grid-cols-3 gap-6">
            {blogPosts.length > 0 ? blogPosts.slice(0, 3).map((post, i) => (
              <StaggerItem key={i}>
                <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-[#0B2345]/80 to-[#132D52] flex items-center justify-center">
                    <FileText className="w-10 h-10 text-white/20" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold group-hover:text-[#F5A623] transition-colors mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.authorName}</span>
                      <span>{post.readingTime} min read</span>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            )) : <p className="col-span-full text-center text-muted-foreground">Blog posts coming soon.</p>}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ 18. PARTNERS ============ */}
      <section id="partners" className="section-padding">
        <div className="container-brand">
          <FadeIn className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Our Partners</h2>
            <p className="mt-4 text-muted-foreground">Technology partners and industry leaders.</p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {partners.length > 0 ? partners.map((p, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border hover:border-[#F5A623]/30 hover:shadow-md transition-all duration-300 bg-card">
                  <Building className="w-8 h-8 text-muted-foreground/50 mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">{p.name}</span>
                  <Badge variant="outline" className="mt-2 text-[10px]">{p.category}</Badge>
                </div>
              </FadeIn>
            )) : <p className="col-span-full text-center text-muted-foreground">Partners coming soon.</p>}
          </div>
        </div>
      </section>

      {/* ============ 19. CTA ============ */}
      <section id="contact" className="section-padding bg-navy-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,166,35,0.12),transparent_60%)]" />
        <div className="container-brand relative z-10 text-center">
          <FadeIn className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">{ctaConfig.headline || 'Ready to Transform Your Operations?'}</h2>
            <p className="mt-4 text-white/60 text-lg">{ctaConfig.subheadline || 'Join 150+ enterprises already using SmartBuild.'}</p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Link href="/register"><Button size="lg" className="bg-[#F5A623] hover:bg-[#e6961a] text-[#0B2345] font-semibold text-base px-8 h-12">{(ctaConfig.primaryCta as any)?.label || 'Start Free Trial'} <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
              <a href="#demo"><Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-8 h-12">{(ctaConfig.secondaryCta as any)?.label || 'Schedule Demo'}</Button></a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#060D18] text-white/70 pt-16 pb-8 mt-auto">
        <div className="container-brand">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            <div className="col-span-2">
              <img src="/brand/smartbuild-primary-logo.svg" alt="SmartBuild" className="h-8 mb-4 brightness-200" />
              <p className="text-sm text-white/50 mb-4">{footerConfig.tagline || 'Build Smarter. Manage Better. Deliver Faster.'}</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {footerConfig.address || 'Kuala Lumpur, Malaysia'}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {footerConfig.email || 'info@smartbuild.com'}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {footerConfig.phone || '+60 3-1234 5678'}</div>
              </div>
            </div>
            {(footerConfig.columns?.length ? footerConfig.columns : [
              { title: 'Products', links: [{ label: 'EPPM', url: '#' }, { label: 'CMMS', url: '#' }, { label: 'ERP', url: '#' }, { label: 'AI Assistant', url: '#' }] },
              { title: 'Solutions', links: [{ label: 'Construction', url: '#' }, { label: 'Facility Management', url: '#' }, { label: 'Oil & Gas', url: '#' }, { label: 'Government', url: '#' }] },
              { title: 'Resources', links: [{ label: 'Documentation', url: '#' }, { label: 'Blog', url: '#' }, { label: 'Case Studies', url: '#' }, { label: 'API', url: '#' }] },
              { title: 'Company', links: [{ label: 'About', url: '#' }, { label: 'Careers', url: '#' }, { label: 'Contact', url: '#' }, { label: 'Partners', url: '#' }] },
            ]).map((col: any, i: number) => (
              <div key={i}>
                <h4 className="font-semibold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links?.map((link: any, j: number) => (
                    <li key={j}><a href={link.url} className="text-sm hover:text-white transition-colors">{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/40">{footerConfig.copyright || `© ${new Date().getFullYear()} SmartBuild Enterprise. All rights reserved.`}</p>
            <div className="flex gap-4 text-white/40">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(link => (
                <a key={link} href="#" className="text-sm hover:text-white/70 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
