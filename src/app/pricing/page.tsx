'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Building2,
  Users,
  Zap,
  Shield,
  Crown,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Menu,
  Star,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { BrandFooter } from '@/components/brand'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface Plan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  maxUsers: number
  maxProjects: number
  maxStorage: number
  maxBranches: number
  mobileAccess: boolean
  apiAccess: boolean
  integrations: boolean
  customDomain: boolean
  prioritySupport: boolean
  aiCredits: number
  features: string
  sortOrder: number
  active: boolean
}

/* ================================================================== */
/*  Fallback Data                                                      */
/* ================================================================== */
const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    description: 'Explore SmartBuild with limited features',
    priceMonthly: 0,
    priceAnnual: 0,
    maxUsers: 5,
    maxProjects: 3,
    maxStorage: 500000000,
    maxBranches: 1,
    mobileAccess: false,
    apiAccess: false,
    integrations: false,
    customDomain: false,
    prioritySupport: false,
    aiCredits: 0,
    features:
      'Basic dashboard, Gantt charts, Up to 3 projects',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started with EPPM',
    priceMonthly: 49,
    priceAnnual: 39,
    maxUsers: 15,
    maxProjects: 10,
    maxStorage: 5000000000,
    maxBranches: 3,
    mobileAccess: true,
    apiAccess: false,
    integrations: false,
    customDomain: false,
    prioritySupport: false,
    aiCredits: 50,
    features:
      'Everything in Free + Mobile app, Resource management, 10 projects',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing construction companies',
    priceMonthly: 149,
    priceAnnual: 119,
    maxUsers: 50,
    maxProjects: 50,
    maxStorage: 25000000000,
    maxBranches: 10,
    mobileAccess: true,
    apiAccess: true,
    integrations: true,
    customDomain: false,
    prioritySupport: true,
    aiCredits: 200,
    features:
      'Everything in Starter + API access, Integrations, Priority support, AI assistant',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    priceMonthly: 399,
    priceAnnual: 319,
    maxUsers: 200,
    maxProjects: 200,
    maxStorage: 100000000000,
    maxBranches: 50,
    mobileAccess: true,
    apiAccess: true,
    integrations: true,
    customDomain: true,
    prioritySupport: true,
    aiCredits: 1000,
    features:
      'Everything in Professional + Custom domain, Advanced analytics, Dedicated support',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Tailored solutions for enterprise requirements',
    priceMonthly: 0,
    priceAnnual: 0,
    maxUsers: 99999,
    maxProjects: 99999,
    maxStorage: 1000000000000,
    maxBranches: 999,
    mobileAccess: true,
    apiAccess: true,
    integrations: true,
    customDomain: true,
    prioritySupport: true,
    aiCredits: 99999,
    features:
      'Everything in Enterprise + Unlimited everything, Custom integrations, On-premise option, SLA guarantee',
    sortOrder: 4,
    active: true,
  },
]

/* ================================================================== */
/*  FAQ Data                                                           */
/* ================================================================== */
const FAQ_ITEMS = [
  {
    question: 'Can I change my plan later?',
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. When upgrading, you'll be prorated for the remaining billing period. When downgrading, the change takes effect at the end of your current billing cycle.",
  },
  {
    question: 'What happens when my 14-day free trial ends?',
    answer:
      "After your 14-day trial expires, you can choose any paid plan to continue. All your data will be preserved for 30 days, so you won't lose any work. We'll send you reminders before the trial ends.",
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes! When you choose annual billing, you save up to 20% compared to the monthly rate. Annual billing is paid upfront for the full year and includes all the same features.',
  },
  {
    question: 'What kind of support is included?',
    answer:
      'Free Trial includes community support. Starter plans get email support within 24 hours. Professional and above include priority support with guaranteed response times. Enterprise plans include a dedicated account manager.',
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer:
      'Absolutely. Our Custom plan is designed for large construction organizations with specific requirements, including custom integrations, on-premise deployment options, SLA guarantees, and dedicated support teams.',
  },
]

/* ================================================================== */
/*  Animation Helpers                                                  */
/* ================================================================== */
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
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const }}
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
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
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

/* ================================================================== */
/*  Plan Helpers                                                       */
/* ================================================================== */
function formatStorage(bytes: number): string {
  if (bytes >= 1000000000000) return `${bytes / 1000000000000} TB`
  if (bytes >= 1000000000) return `${bytes / 1000000000} GB`
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(0)} MB`
  return `${bytes} KB`
}

function getSavings(monthly: number, annual: number): number {
  if (monthly === 0 || annual === 0) return 0
  const monthlyTotal = monthly * 12
  const annualTotal = annual * 12
  return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100)
}

function isCustomPlan(plan: Plan): boolean {
  return plan.id === 'custom'
}

function isFreePlan(plan: Plan): boolean {
  return plan.id === 'free-trial'
}

function isProfessionalPlan(plan: Plan): boolean {
  return plan.id === 'professional'
}

function getPlanIconName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('free') || lower.includes('trial')) return 'zap'
  if (lower.includes('starter')) return 'shield'
  if (lower.includes('professional') || lower.includes('pro')) return 'crown'
  if (lower.includes('enterprise')) return 'building'
  if (lower.includes('custom')) return 'star'
  return 'users'
}

const PLAN_ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap,
  shield: Shield,
  crown: Crown,
  building: Building2,
  star: Star,
  users: Users,
}

function parseFeatureList(featuresStr: string): string[] {
  return featuresStr
    .split(', ')
    .map((f) => f.trim())
    .filter(Boolean)
}

/* ================================================================== */
/*  Nav Links                                                          */
/* ================================================================== */
const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Register', href: '/register' },
]

/* ================================================================== */
/*  Mobile Nav Sheet                                                   */
/* ================================================================== */
function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-72 bg-[#0B2345] border-white/10 p-0"
      >
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

/* ================================================================== */
/*  Skeleton Loader                                                    */
/* ================================================================== */
function PlanCardSkeleton() {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/*  Plan Card                                                          */
/* ================================================================== */
function PlanCard({
  plan,
  annual,
  index,
}: {
  plan: Plan
  annual: boolean
  index: number
}) {
  const price = annual ? plan.priceAnnual : plan.priceMonthly
  const savings = getSavings(plan.priceMonthly, plan.priceAnnual)
  const isPro = isProfessionalPlan(plan)
  const isCustom = isCustomPlan(plan)
  const isFree = isFreePlan(plan)
  const iconName = getPlanIconName(plan.name)
  const features = parseFeatureList(plan.features)

  const ctaLabel = isCustom
    ? 'Contact Sales'
    : isFree
      ? 'Start Free Trial'
      : 'Get Started'
  const ctaHref = isCustom ? '#' : `/register?plan=${plan.id}`
  const ctaVariant: 'default' | 'outline' =
    isCustom ? 'outline' : isFree || isPro ? 'default' : 'outline'

  return (
    <StaggerItem>
      <Card
        className={`rounded-xl h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative ${
          isPro
            ? 'border-2 border-[#F5A623] shadow-lg shadow-[#F5A623]/10'
            : ''
        }`}
      >
        {/* Most Popular Badge */}
        {isPro && (
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F5A623] text-[#0B2345] text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10">
            <Sparkles className="mr-1 h-3 w-3" />
            Most Popular
          </Badge>
        )}

        <CardContent className="p-6 flex flex-col flex-1 gap-5">
          {/* Plan Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isPro
                    ? 'bg-[#F5A623]/10'
                    : 'bg-[#0B2345]/5'
                }`}
              >
                {(() => {
                  const PlanIconComp = PLAN_ICON_MAP[iconName] || Users
                  return <PlanIconComp className={`h-5 w-5 ${isPro ? 'text-[#F5A623]' : 'text-[#0B2345]'}`} />
                })()}
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-[#0B2345]">
                  {plan.name}
                </h3>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] font-body leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-1">
              {isCustom ? (
                <span className="text-3xl font-bold font-heading text-[#0B2345]">
                  Custom
                </span>
              ) : price === 0 ? (
                <span className="text-3xl font-bold font-heading text-[#0B2345]">
                  Free
                </span>
              ) : (
                <>
                  <span className="text-lg font-medium text-[#6B7280]">$</span>
                  <span className="text-3xl font-bold font-heading text-[#0B2345]">
                    {price}
                  </span>
                  <span className="text-sm text-[#6B7280] font-body">
                    /mo
                  </span>
                </>
              )}
            </div>
            {annual && savings > 0 && (
              <p className="text-xs font-semibold text-emerald-600">
                Save {savings}% — ${(price * 12).toLocaleString()}/year
              </p>
            )}
            {annual && isCustom && (
              <p className="text-xs text-[#6B7280]">Contact for pricing</p>
            )}
            {annual && isFree && (
              <p className="text-xs text-[#6B7280]">14-day trial, then choose a plan</p>
            )}
          </div>

          {/* Key Limits */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Users</span>
              <span className="font-semibold text-[#0B2345]">
                {plan.maxUsers >= 9999 ? 'Unlimited' : plan.maxUsers}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Projects</span>
              <span className="font-semibold text-[#0B2345]">
                {plan.maxProjects >= 9999 ? 'Unlimited' : plan.maxProjects}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280]">Storage</span>
              <span className="font-semibold text-[#0B2345]">
                {formatStorage(plan.maxStorage)}
              </span>
            </div>
          </div>

          {/* Features list */}
          <ul className="space-y-2 flex-1">
            {features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm text-[#6B7280] font-body">{f}</span>
              </li>
            ))}
            {features.length > 5 && (
              <li className="text-sm text-[#6B7280] font-medium">
                +{features.length - 5} more features
              </li>
            )}
          </ul>

          {/* CTA Button */}
          <Button
            className={`w-full mt-auto ${
              ctaVariant === 'default' && !isPro
                ? 'bg-[#0B2345] text-white hover:bg-[#132D52]'
                : ctaVariant === 'default' && isPro
                  ? 'bg-[#F5A623] text-[#0B2345] font-bold hover:bg-[#F7B84E] shadow-md shadow-[#F5A623]/20'
                  : 'border-[#0B2345]/20 text-[#0B2345] hover:bg-[#0B2345] hover:text-white'
            }`}
            variant={ctaVariant}
            size="lg"
            asChild
          >
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </StaggerItem>
  )
}

/* ================================================================== */
/*  Feature Comparison Table                                           */
/* ================================================================== */
function ComparisonTable({ plans }: { plans: Plan[] }) {
  const comparisonRows = [
    {
      label: 'Users',
      getValue: (p: Plan) =>
        p.maxUsers >= 9999 ? 'Unlimited' : String(p.maxUsers),
      isBoolean: false,
    },
    {
      label: 'Projects',
      getValue: (p: Plan) =>
        p.maxProjects >= 9999 ? 'Unlimited' : String(p.maxProjects),
      isBoolean: false,
    },
    {
      label: 'Storage',
      getValue: (p: Plan) => formatStorage(p.maxStorage),
      isBoolean: false,
    },
    {
      label: 'Branches',
      getValue: (p: Plan) =>
        p.maxBranches >= 999 ? 'Unlimited' : String(p.maxBranches),
      isBoolean: false,
    },
    {
      label: 'AI Credits / mo',
      getValue: (p: Plan) =>
        p.aiCredits === 0
          ? '-'
          : p.aiCredits >= 9999
            ? 'Unlimited'
            : String(p.aiCredits),
      isBoolean: false,
    },
    {
      label: 'Mobile Access',
      getValue: (p: Plan) => p.mobileAccess,
      isBoolean: true,
    },
    {
      label: 'API Access',
      getValue: (p: Plan) => p.apiAccess,
      isBoolean: true,
    },
    {
      label: 'Integrations',
      getValue: (p: Plan) => p.integrations,
      isBoolean: true,
    },
    {
      label: 'Custom Domain',
      getValue: (p: Plan) => p.customDomain,
      isBoolean: true,
    },
    {
      label: 'Priority Support',
      getValue: (p: Plan) => p.prioritySupport,
      isBoolean: true,
    },
  ]

  return (
    <Card className="rounded-2xl overflow-hidden border-[#E2E8F0]">
      <div className="p-6 pb-0">
        <p className="text-xs font-medium uppercase tracking-widest text-[#6B7280] mb-1">
          Compare plans
        </p>
        <h3 className="text-xl font-bold font-heading text-[#0B2345]">
          Feature Comparison
        </h3>
      </div>
      <CardContent className="p-6 pt-4">
        <div className="overflow-x-auto scroll-thin">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0]">
                <TableHead className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] sticky left-0 bg-white min-w-[120px]">
                  Feature
                </TableHead>
                {plans.map((plan) => (
                  <TableHead
                    key={plan.id}
                    className={`text-[11px] font-medium uppercase tracking-wide text-center min-w-[110px] ${
                      isProfessionalPlan(plan)
                        ? 'bg-[#F5A623]/5 text-[#0B2345]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {plan.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row, rowIdx) => (
                <TableRow
                  key={row.label}
                  className={
                    rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'
                  }
                >
                  <TableCell className="text-sm font-medium text-[#0B2345] sticky left-0 bg-inherit">
                    {row.label}
                  </TableCell>
                  {plans.map((plan) => {
                    const value = row.getValue(plan)
                    const isPro = isProfessionalPlan(plan)
                    if (row.isBoolean) {
                      return (
                        <TableCell
                          key={plan.id}
                          className={`text-center ${isPro ? 'bg-[#F5A623]/5' : ''}`}
                        >
                          {value ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-300 mx-auto" />
                          )}
                        </TableCell>
                      )
                    }
                    return (
                      <TableCell
                        key={plan.id}
                        className={`text-sm text-center font-medium ${
                          isPro ? 'bg-[#F5A623]/5 text-[#0B2345]' : 'text-[#6B7280]'
                        }`}
                      >
                        {String(value)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

/* ================================================================== */
/*  Pricing Page                                                       */
/* ================================================================== */
export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [annual, setAnnual] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/platform/plans')
      .then((res) => {
        if (!res.ok) throw new Error('Not authorized')
        return res.json()
      })
      .then((data) => {
        const sorted = (data.plans || data || [])
          .filter((p: Plan) => p.active)
          .sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder)
        setPlans(sorted)
      })
      .catch(() => {
        setPlans(FALLBACK_PLANS.sort((a, b) => a.sortOrder - b.sortOrder))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* ============================================================ */}
      {/*  Sticky Navbar                                                */}
      {/* ============================================================ */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-dark shadow-lg' : 'bg-[#0B2345]'
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
                className={`text-sm font-medium transition-colors ${
                  link.href === '/pricing'
                    ? 'text-[#F5A623]'
                    : 'text-white/70 hover:text-[#F5A623]'
                }`}
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
        {/*  Hero Header — Navy Gradient                                */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-navy-gradient relative overflow-hidden">
          {/* Subtle background glow orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-[#F5A623] opacity-[0.07] blur-[120px]" />
            <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-[#132D52] opacity-20 blur-[100px]" />
          </div>

          <div className="relative max-w-[1600px] mx-auto px-4 lg:px-6 py-16 lg:py-24">
            <SectionFadeIn className="text-center space-y-6">
              {/* Badge */}
              <Badge
                variant="secondary"
                className="bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20 px-3 py-1.5 text-xs font-semibold mx-auto"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Flexible Plans for Every Team
              </Badge>

              {/* Heading */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-white">
                Simple,{' '}
                <span className="text-gradient">Transparent</span> Pricing
              </h1>

              {/* Subtitle */}
              <p className="text-base lg:text-lg text-white/60 font-body max-w-2xl mx-auto leading-relaxed">
                Choose the plan that fits your team size and project complexity.
                Start free and scale as you grow.
              </p>

              {/* Monthly / Annual Toggle */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <span
                  className={`text-sm font-medium font-body transition-colors ${
                    !annual ? 'text-white' : 'text-white/50'
                  }`}
                >
                  Monthly
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={annual}
                    onCheckedChange={setAnnual}
                    className="data-[state=checked]:bg-[#F5A623]"
                  />
                  <span
                    className={`text-sm font-medium font-body transition-colors ${
                      annual ? 'text-white' : 'text-white/50'
                    }`}
                  >
                    Annual
                  </span>
                </div>
                <AnimatePresence>
                  {annual && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge className="bg-[#F5A623] text-[#0B2345] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                        Save up to 20%
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Plan Cards — Light Background                              */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </div>
            ) : plans.length > 0 ? (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {plans.map((plan, i) => (
                  <PlanCard key={plan.id} plan={plan} annual={annual} index={i} />
                ))}
              </StaggerContainer>
            ) : (
              <Card className="rounded-xl">
                <CardContent className="p-8 text-center">
                  <p className="text-sm text-[#6B7280]">
                    Unable to load plans. Please refresh the page.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Feature Comparison Table                                    */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-12 lg:pb-16">
            <SectionFadeIn>
              <ComparisonTable plans={plans} />
            </SectionFadeIn>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  FAQ Section                                                */}
        {/* ---------------------------------------------------------- */}
        <section className="bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-12 lg:pb-16">
            <SectionFadeIn>
              <div className="max-w-3xl mx-auto">
                <div className="text-center space-y-3 mb-8">
                  <p className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">
                    Support
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#0B2345]">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-sm text-[#6B7280] font-body max-w-lg mx-auto leading-relaxed">
                    Everything you need to know about SmartBuild pricing and plans.
                  </p>
                </div>

                <Card className="rounded-2xl border-[#E2E8F0]">
                  <CardContent className="p-4 sm:p-6">
                    <Accordion type="single" collapsible className="w-full">
                      {FAQ_ITEMS.map((item, i) => (
                        <AccordionItem
                          key={i}
                          value={`faq-${i}`}
                          className="border-b-[#E2E8F0]"
                        >
                          <AccordionTrigger className="text-sm font-semibold font-heading text-[#0B2345] hover:text-[#F5A623] hover:no-underline transition-colors py-5">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-[#6B7280] font-body leading-relaxed pb-5">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </SectionFadeIn>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  CTA Section — Navy Gradient                                */}
        {/* ---------------------------------------------------------- */}
        <section className="max-w-[1600px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <SectionFadeIn>
            <div className="bg-navy-gradient rounded-2xl p-8 lg:p-12 text-center relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#F5A623] opacity-[0.08] blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#132D52] opacity-20 blur-[80px]" />
              </div>

              <div className="relative space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white">
                  Ready to Get Started?
                </h2>
                <p className="text-base text-white/60 font-body max-w-lg mx-auto leading-relaxed">
                  Start your 14-day free trial today. No credit card required.
                  Set up your workspace in minutes.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-4">
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
                    <Link href="#">Contact Sales</Link>
                  </Button>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-white/50">
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
            </div>
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
