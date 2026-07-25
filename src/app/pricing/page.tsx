'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  Building2,
  Users,
  Zap,
  Shield,
  Crown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  HardDrive,
  GitBranch,
  Code2,
  Brain,
  Smartphone,
  Globe,
  Headphones,
  Puzzle,
  Linkedin,
  Twitter,
  Github,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
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
  maxApiCalls: number
  aiCredits: number
  mobileAccess: boolean
  apiAccess: boolean
  integrations: boolean
  customDomain: boolean
  prioritySupport: boolean
  features: string
  sortOrder: number
  active: boolean
}

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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatStorage(mb: number): string {
  if (mb >= 1000000) return `${(mb / 1000000).toFixed(0)} TB`
  if (mb >= 1000) return `${(mb / 1000).toFixed(0)} GB`
  return `${mb} MB`
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n === 0 ? '0' : n.toLocaleString()
}

function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return `$${price.toLocaleString()}`
}

function getSavings(monthly: number, annual: number): number {
  if (monthly === 0 || annual === 0) return 0
  const annualTotal = annual * 12
  const monthlyTotal = monthly * 12
  return Math.round(((monthlyTotal - annualTotal) / monthlyTotal) * 100)
}

function getPlanIconKey(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('free') || lower.includes('trial')) return 'zap'
  if (lower.includes('starter')) return 'shield'
  if (lower.includes('professional') || lower.includes('pro')) return 'crown'
  if (lower.includes('enterprise')) return 'building'
  return 'users'
}

function getCTALabel(name: string): { label: string; variant: 'default' | 'outline' | 'ghost'; href: string } {
  const lower = name.toLowerCase()
  if (lower.includes('enterprise') || lower.includes('custom')) {
    return { label: 'Contact Sales', variant: 'outline', href: '#' }
  }
  if (lower.includes('professional') || lower.includes('pro')) {
    return { label: 'Get Started', variant: 'default', href: '/register' }
  }
  return { label: 'Start Free Trial', variant: 'outline', href: '/register' }
}

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */
const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Integrations', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '/' },
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

const FAQ_ITEMS = [
  {
    question: 'Can I change my plan later?',
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. When upgrading, you'll be prorated for the remaining billing period. When downgrading, the change takes effect at the end of your current billing cycle.",
  },
  {
    question: 'What happens when my 14-day free trial ends?',
    answer:
      "After your 14-day trial, you'll need to select a paid plan to continue using SmartBuild. Your data will be preserved for 30 days. If you don't choose a plan, your account will be automatically downgraded to the Free Trial tier with limited features.",
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes! When you choose annual billing, you save up to 20% compared to monthly billing. Annual billing is paid upfront for the full year and includes all the same features as the monthly plan.',
  },
  {
    question: 'Do you offer custom enterprise solutions?',
    answer:
      'Absolutely. Our Enterprise and Custom plans are designed for large construction organizations with specific needs. This includes custom integrations, dedicated infrastructure, SLA guarantees, and on-premise deployment options. Contact our sales team for a tailored proposal.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and purchase orders for Enterprise plans. All payments are processed securely through our payment gateway.',
  },
]

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                   */
/* ------------------------------------------------------------------ */
function PlanCardSkeleton() {
  return (
    <Card className="flex flex-col rounded-2xl">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-20 mt-4" />
        <Skeleton className="h-3 w-16 mt-1" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Separator className="my-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="mt-auto pt-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Plan Card                                                         */
/* ------------------------------------------------------------------ */
function PlanCard({
  plan,
  isAnnual,
  isRecommended,
  index,
}: {
  plan: Plan
  isAnnual: boolean
  isRecommended: boolean
  index: number
}) {
  const iconKey = getPlanIconKey(plan.name)
  const cta = getCTALabel(plan.name)
  const savings = getSavings(plan.priceMonthly, plan.priceAnnual)
  const displayPrice = isAnnual ? plan.priceAnnual : plan.priceMonthly
  const parsedFeatures: string[] = (() => {
    try {
      return JSON.parse(plan.features)
    } catch {
      return []
    }
  })()

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={`flex-shrink-0 w-[300px] md:w-auto md:flex-1 ${isRecommended ? 'md:-mt-4 md:mb-0' : ''}`}
    >
      <Card
        className={`relative flex flex-col h-full rounded-2xl transition-shadow duration-300 ${
          isRecommended
            ? 'border-2 border-brand-gold shadow-[0_0_40px_rgba(245,166,35,0.12)] hover:shadow-[0_0_50px_rgba(245,166,35,0.2)]'
            : 'border border-gray-200 hover:shadow-lg'
        }`}
      >
        {isRecommended && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
            <Badge className="bg-brand-gold text-brand-navy font-semibold px-4 py-1 text-xs shadow-md">
              <Sparkles className="size-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3 pt-6 px-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                isRecommended ? 'bg-brand-gold/10 text-brand-gold' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {iconKey == "zap" && <Zap className="size-5" />}
              {iconKey == "shield" && <Shield className="size-5" />}
              {iconKey == "crown" && <Crown className="size-5" />}
              {iconKey == "building" && <Building2 className="size-5" />}
              {iconKey == "users" && <Users className="size-5" />}
            </div>
            <div>
              <CardTitle className="font-heading text-lg font-semibold text-gray-900">
                {plan.name}
              </CardTitle>
            </div>
          </div>
          <p className="font-body text-sm text-gray-500 leading-relaxed">{plan.description}</p>

          <div className="mt-4">
            <div className="flex items-end gap-1.5">
              <span
                className={`font-heading text-4xl font-bold ${isRecommended ? 'text-brand-navy' : 'text-gray-900'}`}
              >
                {formatPrice(displayPrice)}
              </span>
              {displayPrice > 0 && <span className="font-body text-sm text-gray-400 mb-1.5">/month</span>}
            </div>
            {isAnnual && savings > 0 && (
              <Badge
                variant="secondary"
                className="mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs"
              >
                Save {savings}%
              </Badge>
            )}
            {displayPrice === 0 && <p className="font-body text-xs text-gray-400 mt-1">No credit card required</p>}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col px-6 pb-6">
          {/* Key Limits */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-gray-500 flex items-center gap-2">
                <Users className="size-3.5" /> Users
              </span>
              <span className={`font-body font-medium ${plan.maxUsers === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {plan.maxUsers === 0 ? 'Unlimited' : plan.maxUsers}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-gray-500 flex items-center gap-2">
                <Building2 className="size-3.5" /> Projects
              </span>
              <span className={`font-body font-medium ${plan.maxProjects === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {plan.maxProjects === 0 ? 'Unlimited' : plan.maxProjects}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-gray-500 flex items-center gap-2">
                <HardDrive className="size-3.5" /> Storage
              </span>
              <span className={`font-body font-medium ${plan.maxStorage === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {plan.maxStorage === 0 ? 'Unlimited' : formatStorage(plan.maxStorage)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-gray-500 flex items-center gap-2">
                <GitBranch className="size-3.5" /> Branches
              </span>
              <span className={`font-body font-medium ${plan.maxBranches === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {plan.maxBranches === 0 ? 'Unlimited' : plan.maxBranches}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-gray-500 flex items-center gap-2">
                <Code2 className="size-3.5" /> API Calls
              </span>
              <span className={`font-body font-medium ${plan.maxApiCalls === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {plan.maxApiCalls === 0 ? 'Unlimited' : formatNumber(plan.maxApiCalls) + '/mo'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-body text-gray-500 flex items-center gap-2">
                <Brain className="size-3.5" /> AI Credits
              </span>
              <span className={`font-body font-medium ${plan.aiCredits === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                {plan.aiCredits === 0 ? '\u2014' : formatNumber(plan.aiCredits) + '/mo'}
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Feature list */}
          <div className="space-y-2 mb-5">
            {parsedFeatures.slice(0, 5).map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-body text-sm text-gray-600">{f}</span>
              </div>
            ))}
            {parsedFeatures.length > 5 && (
              <p className="font-body text-xs text-gray-400 pl-6">+{parsedFeatures.length - 5} more features</p>
            )}
          </div>

          {/* Capability badges */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {plan.mobileAccess && (
              <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                <Smartphone className="size-3 mr-1" /> Mobile
              </Badge>
            )}
            {plan.apiAccess && (
              <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                <Code2 className="size-3 mr-1" /> API
              </Badge>
            )}
            {plan.integrations && (
              <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                <Puzzle className="size-3 mr-1" /> Integrations
              </Badge>
            )}
            {plan.customDomain && (
              <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                <Globe className="size-3 mr-1" /> Custom Domain
              </Badge>
            )}
            {plan.prioritySupport && (
              <Badge variant="secondary" className="text-xs font-normal bg-gray-100 text-gray-600">
                <Headphones className="size-3 mr-1" /> Priority
              </Badge>
            )}
          </div>

          {/* CTA */}
          <div className="mt-auto">
            <Button
              className={`w-full h-11 text-sm font-semibold rounded-xl transition-all ${
                isRecommended
                  ? 'bg-brand-gold text-brand-navy hover:bg-brand-gold-light shadow-md hover:shadow-lg'
                  : cta.variant === 'default'
                    ? 'bg-brand-navy text-white hover:bg-brand-navy/90'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              variant={isRecommended ? 'default' : cta.variant}
              asChild
            >
              <Link href={`${cta.href}?plan=${plan.id}`}>
                {cta.label}
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Comparison Table                                                  */
/* ------------------------------------------------------------------ */
const COMPARISON_ROWS = [
  { key: 'maxUsers', label: 'Max Users', type: 'number' as const },
  { key: 'maxProjects', label: 'Max Projects', type: 'number' as const },
  { key: 'maxStorage', label: 'Storage', type: 'storage' as const },
  { key: 'maxBranches', label: 'Branches', type: 'number' as const },
  { key: 'maxApiCalls', label: 'API Calls / mo', type: 'api' as const },
  { key: 'aiCredits', label: 'AI Credits / mo', type: 'number' as const },
  { key: 'mobileAccess', label: 'Mobile Access', type: 'boolean' as const },
  { key: 'apiAccess', label: 'API Access', type: 'boolean' as const },
  { key: 'integrations', label: 'Third-Party Integrations', type: 'boolean' as const },
  { key: 'customDomain', label: 'Custom Domain', type: 'boolean' as const },
  { key: 'prioritySupport', label: 'Priority Support', type: 'boolean' as const },
]

function formatCellValue(plan: Plan, row: (typeof COMPARISON_ROWS)[number]) {
  if (row.type === 'boolean') {
    const val = plan[row.key as keyof Plan] as boolean
    return val ? (
      <Check className="size-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="size-5 text-gray-300 mx-auto" />
    )
  }
  if (row.type === 'storage') {
    const val = plan[row.key as keyof Plan] as number
    return <span className="font-body text-sm text-gray-700">{val === 0 ? 'Unlimited' : formatStorage(val)}</span>
  }
  if (row.key === 'maxApiCalls') {
    const val = plan[row.key as keyof Plan] as number
    return <span className="font-body text-sm text-gray-700">{val === 0 ? 'Unlimited' : formatNumber(val)}</span>
  }
  const val = plan[row.key as keyof Plan] as number
  return <span className="font-body text-sm text-gray-700">{val === 0 ? 'Unlimited' : val.toLocaleString()}</span>
}

function ComparisonTable({ plans }: { plans: Plan[] }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="w-full overflow-x-auto"
    >
      <table className="w-full min-w-[700px]">
        <thead>
          <tr>
            <th className="text-left font-body text-sm font-semibold text-gray-500 pb-4 pr-4 min-w-[180px]">
              Features
            </th>
            {plans.map((plan) => {
              const isRecommended = plan.name.toLowerCase().includes('professional') || plan.name.toLowerCase().includes('pro')
              return (
                <th
                  key={plan.id}
                  className={`text-center font-heading text-sm font-semibold pb-4 px-3 ${
                    isRecommended ? 'text-brand-gold' : 'text-gray-700'
                  }`}
                >
                  {plan.name}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, idx) => (
            <tr key={row.key} className={idx % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}>
              <td className="font-body text-sm text-gray-600 py-3.5 pr-4">{row.label}</td>
              {plans.map((plan) => (
                <td key={plan.id} className="text-center py-3.5 px-3">
                  {formatCellValue(plan, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnnual, setIsAnnual] = useState(false)

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/platform/plans')
        if (res.ok) {
          const data = await res.json()
          const activePlans = (Array.isArray(data) ? data : []).filter(
            (p: Plan) => p.active !== false
          )
          activePlans.sort((a: Plan, b: Plan) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          setPlans(activePlans)
        }
      } catch {
        // Silently fail \u2014 skeletons remain
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ==================== NAV ==================== */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="container-brand flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/brand/smartbuild-app-dark.svg"
              alt="SmartBuild"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="font-body text-sm text-gray-500 hover:text-brand-navy transition-colors"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="font-body text-sm font-semibold text-brand-navy"
            >
              Pricing
            </Link>
            <Button
              size="sm"
              className="bg-brand-navy text-white hover:bg-brand-navy/90 font-semibold"
              asChild
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </nav>
          <Link
            href="/"
            className="md:hidden flex items-center gap-1.5 font-body text-sm text-gray-500 hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1">
        {/* ---------- HEADER ---------- */}
        <section className="section-padding pt-20 pb-8">
          <div className="container-brand text-center">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Badge variant="secondary" className="bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-medium mb-6 px-4">
                <Crown className="size-3.5 mr-1.5" />
                Pricing
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              initial="hidden"
              animate="visible"
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 text-balance max-w-3xl mx-auto leading-tight"
            >
              Simple, Transparent{' '}
              <span className="text-gradient">Pricing</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="font-body text-lg text-gray-500 mt-5 max-w-xl mx-auto leading-relaxed"
            >
              Choose the plan that fits your team. All plans include a 14-day free trial.
            </motion.p>

            {/* Billing toggle */}
            <motion.div
              variants={fadeUp}
              custom={3}
              initial="hidden"
              animate="visible"
              className="mt-10 flex items-center justify-center gap-3"
            >
              <span
                className={`font-body text-sm font-medium transition-colors ${
                  !isAnnual ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-brand-gold"
              />
              <span
                className={`font-body text-sm font-medium transition-colors ${
                  isAnnual ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                Annual
              </span>
              {isAnnual && (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                  Save up to 20%
                </Badge>
              )}
            </motion.div>
          </div>
        </section>

        {/* ---------- PLAN CARDS ---------- */}
        <section className="section-padding py-8">
          <div className="container-brand">
            {loading ? (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </div>
            ) : plans.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible">
                {plans.map((plan, idx) => {
                  const isRecommended =
                    plan.name.toLowerCase().includes('professional') ||
                    plan.name.toLowerCase().includes('pro')
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isAnnual={isAnnual}
                      isRecommended={isRecommended}
                      index={idx}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-body text-gray-400">No plans available at this time.</p>
              </div>
            )}
          </div>
        </section>

        {/* ---------- COMPARISON TABLE ---------- */}
        <section className="section-padding py-12 bg-gray-50/50">
          <div className="container-brand">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="text-center mb-10"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">Compare All Plans</h2>
              <p className="font-body text-gray-500 mt-3 max-w-lg mx-auto">
                A detailed breakdown of features and limits across every plan.
              </p>
            </motion.div>

            {plans.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm overflow-x-auto">
                <ComparisonTable plans={plans} />
              </div>
            )}
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="section-padding py-16">
          <div className="container-brand max-w-3xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="text-center mb-10"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="font-body text-gray-500 mt-3">
                Everything you need to know about SmartBuild pricing.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="border-gray-200"
                  >
                    <AccordionTrigger className="font-body text-sm md:text-base font-medium text-gray-800 hover:text-brand-navy hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="font-body text-sm text-gray-500 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* ---------- CTA BANNER ---------- */}
        <section className="section-padding py-20 bg-navy-gradient">
          <div className="container-brand text-center">
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <MessageCircle className="size-12 text-brand-gold mx-auto mb-6" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white text-balance max-w-xl mx-auto">
                Still not sure?
              </h2>
              <p className="font-body text-white/60 mt-4 max-w-lg mx-auto leading-relaxed">
                Our team is here to help you find the right plan for your organization. Get a personalized recommendation and a live demo.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-brand-gold text-brand-navy hover:bg-brand-gold-light font-semibold text-base px-8 h-12"
                  asChild
                >
                  <Link href="#">
                    <MessageCircle className="size-4" />
                    Talk to Sales
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-white text-base px-8 h-12"
                  asChild
                >
                  <Link href="/register">
                    <Zap className="size-4" />
                    Start Free Trial
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

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
