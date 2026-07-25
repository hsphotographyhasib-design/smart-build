'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Layers,
  Headphones,
  Sparkles,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Plan {
  id: string
  name: string
  description: string
  priceMonthly: number | null
  priceAnnual: number | null
  maxUsers: number
  maxProjects: number
  maxStorage: number
  maxBranches: number
  features: string
  sortOrder: number
  active: boolean
}

interface FieldErrors {
  companyName?: string
  slug?: string
  adminName?: string
  adminEmail?: string
  adminPassword?: string
  confirmPassword?: string
  planId?: string
  terms?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/

/* Fallback plans when API is unavailable (unauthenticated) */
const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    description: 'Get started with core EPPM features',
    priceMonthly: 0,
    priceAnnual: 0,
    maxUsers: 5,
    maxProjects: 3,
    maxStorage: 500,
    maxBranches: 1,
    features: '["portfolio","project","gantt","resource","risk","document","report"]',
    sortOrder: 0,
    active: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small construction teams',
    priceMonthly: 49,
    priceAnnual: 470,
    maxUsers: 15,
    maxProjects: 10,
    maxStorage: 5000,
    maxBranches: 3,
    features: '["portfolio","project","gantt","resource","risk","document","report","maintenance","hr"]',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing construction companies',
    priceMonthly: 149,
    priceAnnual: 1430,
    maxUsers: 50,
    maxProjects: 50,
    maxStorage: 50000,
    maxBranches: 10,
    features: '["portfolio","project","gantt","resource","risk","document","report","maintenance","hr","finance","procurement","equipment","inventory","work-order","complaint"]',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large construction enterprises',
    priceMonthly: 399,
    priceAnnual: 3830,
    maxUsers: 200,
    maxProjects: 200,
    maxStorage: 500000,
    maxBranches: 50,
    features: '["portfolio","project","gantt","resource","risk","document","report","maintenance","hr","finance","procurement","equipment","inventory","work-order","complaint","ai-planner","analytics","api"]',
    sortOrder: 3,
    active: true,
  },
]

/* ------------------------------------------------------------------ */
/*  Left Panel Branding (Desktop Only)                                */
/* ------------------------------------------------------------------ */

function LeftBrandPanel() {
  const benefits = [
    { icon: Layers, label: 'Full EPPM Suite' },
    { icon: ShieldCheck, label: 'Multi-Tenant Isolation' },
    { icon: Sparkles, label: 'RBAC Permissions' },
    { icon: Headphones, label: '24/7 Support' },
  ]

  return (
    <div className='hidden lg:flex lg:flex-col lg:justify-between lg:p-12'>
      {/* Top logo */}
      <div className='relative flex items-center gap-3'>
        <Image
          src='/brand/smartbuild-app-dark.svg'
          alt='SmartBuild'
          width={44}
          height={44}
          className='h-11 w-11'
        />
        <div>
          <div className='text-lg font-bold tracking-tight text-white font-heading'>
            SmartBuild
          </div>
          <div className='text-[11px] text-white/60 font-body'>
            Enterprise Multi-Tenant SaaS Platform
          </div>
        </div>
      </div>

      {/* Center messaging */}
      <div className='relative space-y-8'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='max-w-md text-3xl font-bold leading-tight text-white font-heading'
        >
          Start your{' '}
          <span className='text-gradient'>14-day free trial</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='max-w-sm text-sm text-slate-300 font-body leading-relaxed'
        >
          Get your construction workspace up and running in minutes. No credit
          card required for the free trial.
        </motion.p>

        <motion.ul
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='space-y-4'
        >
          {benefits.map((item, i) => (
            <motion.li
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + i * 0.08 }}
              className='flex items-center gap-3 text-sm text-white/85 font-body'
            >
              <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/15'>
                <item.icon className='h-4 w-4 text-[#F5A623]' />
              </div>
              <span>{item.label}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>

      {/* Bottom testimonial */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className='relative'
      >
        <div className='glass rounded-xl p-5'>
          <Quote className='mb-2 h-5 w-5 text-[#F5A623]/60' />
          <p className='text-sm leading-relaxed text-white/80 font-body italic'>
            &ldquo;SmartBuild transformed how we manage 200+ construction
            projects. The multi-tenant setup lets each division operate
            independently while keeping leadership informed.&rdquo;
          </p>
          <div className='mt-3 flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-[#F5A623]/20 text-xs font-bold text-[#F5A623]'>
              AR
            </div>
            <div>
              <p className='text-xs font-semibold text-white/90 font-body'>
                Ahmad Ridzuan
              </p>
              <p className='text-[11px] text-white/50 font-body'>
                COO, Gamuda Construction
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Plan Selector                                                      */
/* ------------------------------------------------------------------ */

function PlanSelector({
  plans,
  selectedPlanId,
  onSelect,
  loading,
}: {
  plans: Plan[]
  selectedPlanId: string
  onSelect: (id: string) => void
  loading: boolean
}) {
  if (loading) {
    return (
      <div className='space-y-3'>
        <Label className='text-xs font-body'>Select a Plan</Label>
        <div className='flex gap-3 overflow-x-auto pb-2 scroll-thin'>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className='h-24 w-36 shrink-0 rounded-xl'
            />
          ))}
        </div>
      </div>
    )
  }

  if (plans.length === 0) return null

  return (
    <div className='space-y-3'>
      <Label className='text-xs font-body'>Select a Plan</Label>
      <div className='flex gap-3 overflow-x-auto pb-2 scroll-thin'>
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id
          return (
            <motion.button
              type='button'
              key={plan.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(plan.id)}
              className={cn(
                'relative flex shrink-0 flex-col items-start gap-1 rounded-xl border-2 p-3.5 text-left transition-colors',
                isSelected
                  ? 'border-[#F5A623] bg-[#F5A623]/5 shadow-sm'
                  : 'border-border bg-card hover:border-[#F5A623]/40',
              )}
              style={{ width: 150 }}
            >
              {plan.priceMonthly === 0 && (
                <Badge
                  variant='secondary'
                  className='absolute -top-2 right-2 bg-[#F5A623] text-[#0B2345] text-[10px] px-1.5 py-0 font-bold font-body'
                >
                  FREE
                </Badge>
              )}
              <span className='text-sm font-semibold font-heading text-[#0B2345]'>
                {plan.name}
              </span>
              <div className='flex items-baseline gap-0.5'>
                <span className='text-lg font-bold font-heading text-[#0B2345]'>
                  {plan.priceMonthly === 0
                    ? '$0'
                    : `$${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly !== 0 && (
                  <span className='text-[10px] text-muted-foreground font-body'>
                    /mo
                  </span>
                )}
              </div>
              <span className='text-[10px] text-muted-foreground font-body leading-tight'>
                {plan.description}
              </span>
              {isSelected && (
                <motion.div
                  layoutId='plan-check'
                  className='absolute -top-1.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F5A623] text-white'
                >
                  <Check className='h-3 w-3' strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Success Screen                                                     */
/* ------------------------------------------------------------------ */

function SuccessScreen({ companyName, slug }: { companyName: string; slug: string }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='flex flex-col items-center justify-center py-12 text-center'
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5A623]/10'
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
          className='flex h-14 w-14 items-center justify-center rounded-full bg-[#F5A623]'
        >
          <Check className='h-7 w-7 text-white' strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className='text-2xl font-bold font-heading text-[#0B2345]'>
          Welcome to SmartBuild!
        </h2>
        <p className='mt-2 text-sm text-muted-foreground font-body'>
          Your workspace <strong className='text-[#0B2345]'>{companyName}</strong> has
          been created successfully.
        </p>
        <div className='mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B2345]/5 px-4 py-2 text-xs font-body text-[#0B2345]'>
          <Globe className='h-3.5 w-3.5' />
          smartbuild.app/{slug}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className='mt-8'
      >
        <Button
          onClick={() => router.push('/app')}
          size='lg'
          className='gap-2 rounded-xl bg-[#0B2345] px-8 font-body text-white hover:bg-[#132D52]'
        >
          Go to Dashboard
          <ArrowRight className='h-4 w-4' />
        </Button>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Registration Page                                             */
/* ------------------------------------------------------------------ */

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  /* ---- State ---- */
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState({ companyName: '', slug: '' })
  const [errors, setErrors] = useState<FieldErrors>({})

  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [phone, setPhone] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  /* ---- Fetch plans ---- */
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch('/api/platform/plans')
        if (res.ok) {
          const data = await res.json()
          const activePlans = (data.plans ?? []).filter(
            (p: Plan) => p.active,
          )
          setPlans(activePlans.length > 0 ? activePlans : FALLBACK_PLANS)
          const free = activePlans.find(
            (p: Plan) => p.priceMonthly === 0 || p.name === 'Free Trial',
          )
          if (free) setSelectedPlanId(free.id)
          return
        }
      } catch {
        /* fall through */
      }
      // Fallback plans
      setPlans(FALLBACK_PLANS)
      setSelectedPlanId('free-trial')
    }
    fetchPlans().finally(() => setPlansLoading(false))
  }, [])

  /* ---- Pre-select plan from URL ---- */
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && plans.length > 0) {
      const match = plans.find(
        (p) =>
          p.id === planParam ||
          p.name.toLowerCase() === planParam.toLowerCase(),
      )
      if (match) setSelectedPlanId(match.id)
    }
  }, [searchParams, plans])

  /* ---- Auto-generate slug from company name ---- */
  const handleCompanyNameChange = useCallback(
    (value: string) => {
      setCompanyName(value)
      // Only auto-generate if slug hasn't been manually edited
      const generated = generateSlug(value)
      if (!slug || generateSlug(companyName) === slug) {
        setSlug(generated)
      }
    },
    [companyName, slug],
  )

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
  }, [])

  /* ---- Validation ---- */
  const validate = useCallback((): boolean => {
    const errs: FieldErrors = {}

    if (!companyName.trim()) errs.companyName = 'Company name is required'
    if (!slug.trim()) errs.slug = 'Company URL is required'
    else if (!SLUG_RE.test(slug))
      errs.slug = 'Only lowercase letters, numbers, and hyphens'
    else if (slug.length < 2) errs.slug = 'Slug must be at least 2 characters'

    if (!adminName.trim()) errs.adminName = 'Full name is required'
    if (!adminEmail.trim()) errs.adminEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim()))
      errs.adminEmail = 'Invalid email format'

    if (!adminPassword) errs.adminPassword = 'Password is required'
    else if (adminPassword.length < 6)
      errs.adminPassword = 'Password must be at least 6 characters'

    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== adminPassword)
      errs.confirmPassword = 'Passwords do not match'

    if (!selectedPlanId) errs.planId = 'Please select a plan'

    if (!termsAccepted) errs.terms = 'You must accept the terms'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [
    companyName,
    slug,
    adminName,
    adminEmail,
    adminPassword,
    confirmPassword,
    selectedPlanId,
    termsAccepted,
  ])

  /* ---- Clear field error on change ---- */
  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!validate()) return

      setSubmitting(true)
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyName.trim(),
            slug: slug.trim(),
            adminName: adminName.trim(),
            adminEmail: adminEmail.trim().toLowerCase(),
            adminPassword,
            phone: phone.trim() || undefined,
            planId: selectedPlanId,
          }),
        })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? 'Registration failed. Please try again.')
          if (data.error?.toLowerCase().includes('slug') || data.error?.toLowerCase().includes('url') || data.error?.toLowerCase().includes('taken')) {
            setErrors((prev) => ({ ...prev, slug: data.error }))
          }
          return
        }

        // Success
        setSuccessData({
          companyName: data.tenant?.name ?? companyName.trim(),
          slug: data.tenant?.slug ?? slug.trim(),
        })
        setSuccess(true)
        toast.success('Workspace created successfully!')
      } catch {
        toast.error('Network error. Please check your connection and try again.')
      } finally {
        setSubmitting(false)
      }
    },
    [
      validate,
      companyName,
      slug,
      adminName,
      adminEmail,
      adminPassword,
      phone,
      selectedPlanId,
    ],
  )

  /* ---- Computed ---- */
  const slugPreview = slug
    ? `smartbuild.app/${slug}`
    : 'smartbuild.app/your-company'

  /* ---- Render ---- */
  return (
    <div className='min-h-screen w-full flex flex-col overflow-hidden bg-[#F8FAFC]'>
      {/* Background layers */}
      <div className='absolute inset-0 bg-navy-gradient' />
      <div className='absolute inset-0 opacity-20 [background:radial-gradient(circle_at_25%_25%,rgba(245,166,35,0.3),transparent_50%),radial-gradient(circle_at_75%_70%,rgba(245,166,35,0.15),transparent_55%)]' />

      {/* Main grid */}
      <div className='relative grid flex-1 min-h-screen w-full lg:grid-cols-2'>
        {/* Left panel */}
        <LeftBrandPanel />

        {/* Right panel — form */}
        <div className='flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:p-12'>
          <AnimatePresence mode='wait'>
            {success ? (
              <motion.div
                key='success'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white p-8 shadow-2xl lg:bg-white/95 lg:backdrop-blur-xl'
              >
                <SuccessScreen
                  companyName={successData.companyName}
                  slug={successData.slug}
                />
              </motion.div>
            ) : (
              <motion.div
                key='form'
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className='relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8 lg:bg-white/95 lg:backdrop-blur-xl'
              >
                {/* Top accent bar */}
                <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F5A623] via-[#F7B84E] to-[#F5A623]' />

                {/* Mobile-only logo */}
                <div className='mb-6 flex flex-col items-center gap-3 lg:hidden'>
                  <div className='relative'>
                    <Image
                      src='/brand/smartbuild-app-dark.svg'
                      alt='SmartBuild'
                      width={56}
                      height={56}
                      className='h-14 w-14 drop-shadow-lg'
                    />
                    <div className='absolute -inset-2 rounded-full bg-[#F5A623]/10 blur-xl' />
                  </div>
                  <div className='text-center'>
                    <div className='text-lg font-bold tracking-tight text-[#0B2345] font-heading'>
                      SmartBuild
                    </div>
                    <div className='text-[11px] text-[#6B7280] font-body'>
                      Enterprise EPPM Platform
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className='mb-6'>
                  <h1 className='text-2xl font-bold tracking-tight text-[#0B2345] font-heading'>
                    Create your workspace
                  </h1>
                  <p className='mt-1 text-sm text-muted-foreground font-body'>
                    Fill in the details below to get started with your free trial.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* ---- Plan Selector ---- */}
                  <PlanSelector
                    plans={plans}
                    selectedPlanId={selectedPlanId}
                    onSelect={(id) => {
                      setSelectedPlanId(id)
                      clearFieldError('planId')
                    }}
                    loading={plansLoading}
                  />
                  {errors.planId && (
                    <p className='text-xs text-red-500 font-body'>{errors.planId}</p>
                  )}

                  {/* ---- Company Information ---- */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Building2 className='h-4 w-4 text-[#F5A623]' />
                      <h3 className='text-sm font-semibold text-[#0B2345] font-heading'>
                        Company Information
                      </h3>
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='companyName' className='text-xs font-body'>
                        Company Name <span className='text-red-500'>*</span>
                      </Label>
                      <div className='relative'>
                        <Building2 className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                        <Input
                          id='companyName'
                          required
                          value={companyName}
                          onChange={(e) => {
                            handleCompanyNameChange(e.target.value)
                            clearFieldError('companyName')
                          }}
                          placeholder='e.g. Acme Construction Sdn. Bhd.'
                          className={cn(
                            'pl-9 font-body',
                            errors.companyName && 'border-red-400 focus:ring-red-400',
                          )}
                        />
                      </div>
                      {errors.companyName && (
                        <p className='text-xs text-red-500 font-body'>{errors.companyName}</p>
                      )}
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='slug' className='text-xs font-body'>
                        Company URL <span className='text-red-500'>*</span>
                      </Label>
                      <div className='relative'>
                        <Globe className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                        <Input
                          id='slug'
                          required
                          value={slug}
                          onChange={(e) => {
                            const val = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '')
                              .replace(/-+/g, '-')
                            handleSlugChange(val)
                            clearFieldError('slug')
                          }}
                          placeholder='your-company'
                          className={cn(
                            'pl-9 pr-28 font-body font-mono text-sm',
                            errors.slug && 'border-red-400 focus:ring-red-400',
                          )}
                        />
                        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-md border-l border-border bg-muted/50 px-3'>
                          <span className='text-[11px] text-muted-foreground font-body truncate max-w-[120px]'>
                            smartbuild.app/
                          </span>
                        </div>
                      </div>
                      {/* Slug preview */}
                      {slug && !errors.slug && (
                        <p className='text-[11px] text-muted-foreground font-body'>
                          Your workspace URL:{' '}
                          <span className='font-medium text-[#0B2345]'>{slugPreview}</span>
                        </p>
                      )}
                      {errors.slug && (
                        <p className='text-xs text-red-500 font-body'>{errors.slug}</p>
                      )}
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='phone' className='text-xs font-body'>
                        Phone{' '}
                        <span className='text-muted-foreground'>(optional)</span>
                      </Label>
                      <div className='relative'>
                        <Phone className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                        <Input
                          id='phone'
                          type='tel'
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder='+60 12-345 6789'
                          className='pl-9 font-body'
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className='opacity-60' />

                  {/* ---- Admin Account ---- */}
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-[#F5A623]' />
                      <h3 className='text-sm font-semibold text-[#0B2345] font-heading'>
                        Admin Account
                      </h3>
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='adminName' className='text-xs font-body'>
                        Full Name <span className='text-red-500'>*</span>
                      </Label>
                      <div className='relative'>
                        <User className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                        <Input
                          id='adminName'
                          required
                          value={adminName}
                          onChange={(e) => {
                            setAdminName(e.target.value)
                            clearFieldError('adminName')
                          }}
                          placeholder='John Doe'
                          className={cn(
                            'pl-9 font-body',
                            errors.adminName && 'border-red-400 focus:ring-red-400',
                          )}
                        />
                      </div>
                      {errors.adminName && (
                        <p className='text-xs text-red-500 font-body'>{errors.adminName}</p>
                      )}
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='adminEmail' className='text-xs font-body'>
                        Email Address <span className='text-red-500'>*</span>
                      </Label>
                      <div className='relative'>
                        <Mail className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                        <Input
                          id='adminEmail'
                          type='email'
                          required
                          value={adminEmail}
                          onChange={(e) => {
                            setAdminEmail(e.target.value)
                            clearFieldError('adminEmail')
                          }}
                          placeholder='john@your-company.com'
                          className={cn(
                            'pl-9 font-body',
                            errors.adminEmail && 'border-red-400 focus:ring-red-400',
                          )}
                          autoComplete='email'
                        />
                      </div>
                      {errors.adminEmail && (
                        <p className='text-xs text-red-500 font-body'>{errors.adminEmail}</p>
                      )}
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                      <div className='space-y-1.5'>
                        <Label htmlFor='adminPassword' className='text-xs font-body'>
                          Password <span className='text-red-500'>*</span>
                        </Label>
                        <div className='relative'>
                          <Lock className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                          <Input
                            id='adminPassword'
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={adminPassword}
                            onChange={(e) => {
                              setAdminPassword(e.target.value)
                              clearFieldError('adminPassword')
                            }}
                            placeholder='Min. 6 characters'
                            className={cn(
                              'pl-9 pr-9 font-body',
                              errors.adminPassword && 'border-red-400 focus:ring-red-400',
                            )}
                            autoComplete='new-password'
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-2.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors'
                            tabIndex={-1}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                        {errors.adminPassword && (
                          <p className='text-xs text-red-500 font-body'>{errors.adminPassword}</p>
                        )}
                      </div>

                      <div className='space-y-1.5'>
                        <Label htmlFor='confirmPassword' className='text-xs font-body'>
                          Confirm Password <span className='text-red-500'>*</span>
                        </Label>
                        <div className='relative'>
                          <Lock className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60' />
                          <Input
                            id='confirmPassword'
                            type={showConfirm ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value)
                              clearFieldError('confirmPassword')
                            }}
                            placeholder='Re-enter password'
                            className={cn(
                              'pl-9 pr-9 font-body',
                              errors.confirmPassword && 'border-red-400 focus:ring-red-400',
                            )}
                            autoComplete='new-password'
                          />
                          <button
                            type='button'
                            onClick={() => setShowConfirm(!showConfirm)}
                            className='absolute right-3 top-2.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors'
                            tabIndex={-1}
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          >
                            {showConfirm ? (
                              <EyeOff className='h-4 w-4' />
                            ) : (
                              <Eye className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className='text-xs text-red-500 font-body'>{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---- Terms ---- */}
                  <div className='space-y-2'>
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        id='terms'
                        checked={termsAccepted}
                        onCheckedChange={(checked) => {
                          setTermsAccepted(checked === true)
                          clearFieldError('terms')
                        }}
                        className='mt-0.5 data-[state=checked]:bg-[#0B2345] data-[state=checked]:border-[#0B2345]'
                      />
                      <Label
                        htmlFor='terms'
                        className='text-xs leading-relaxed text-muted-foreground font-body cursor-pointer'
                      >
                        I agree to the{' '}
                        <Link
                          href='/terms'
                          className='font-medium text-[#0B2345] underline underline-offset-2 hover:text-[#F5A623]'
                        >
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                          href='/privacy'
                          className='font-medium text-[#0B2345] underline underline-offset-2 hover:text-[#F5A623]'
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.terms && (
                      <p className='text-xs text-red-500 font-body'>{errors.terms}</p>
                    )}
                  </div>

                  {/* ---- Submit ---- */}
                  <Button
                    type='submit'
                    disabled={submitting}
                    size='lg'
                    className='w-full gap-2 rounded-xl bg-[#0B2345] px-6 py-5 text-sm font-semibold text-white font-body hover:bg-[#132D52] transition-colors'
                  >
                    {submitting ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Creating your workspace...
                      </>
                    ) : (
                      <>
                        Create My Workspace
                        <ArrowRight className='h-4 w-4' />
                      </>
                    )}
                  </Button>
                </form>

                {/* Login link */}
                <p className='mt-6 text-center text-sm text-muted-foreground font-body'>
                  Already have an account?{' '}
                  <Link
                    href='/login'
                    className='font-medium text-[#0B2345] underline underline-offset-2 hover:text-[#F5A623] transition-colors'
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className='relative mt-auto px-4 py-4 text-center lg:px-8'>
        <p className='text-[11px] text-white/40 font-body'>
          © {new Date().getFullYear()} SmartBuild · Enterprise Multi-Tenant SaaS Platform v5.0.0
        </p>
      </footer>
    </div>
  )
}
