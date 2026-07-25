'use client'

import { useEffect, useState, useCallback } from 'react'
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
  CheckCircle,
  Layers,
  ShieldCheck,
  Headphones,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BrandFooter } from '@/components/brand'
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
  tos?: string
}

/* ------------------------------------------------------------------ */
/*  Fallback plans (same as pricing page)                              */
/* ------------------------------------------------------------------ */

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
    features: JSON.stringify([]),
    sortOrder: 0,
    active: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started',
    priceMonthly: 49,
    priceAnnual: 39,
    maxUsers: 15,
    maxProjects: 10,
    maxStorage: 5000000000,
    maxBranches: 3,
    features: JSON.stringify([]),
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
    features: JSON.stringify([]),
    sortOrder: 2,
    active: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    priceMonthly: 399,
    priceAnnual: 319,
    maxUsers: 200,
    maxProjects: 200,
    maxStorage: 100000000000,
    maxBranches: 50,
    features: JSON.stringify([]),
    sortOrder: 3,
    active: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Tailored enterprise solutions',
    priceMonthly: 0,
    priceAnnual: 0,
    maxUsers: 99999,
    maxProjects: 99999,
    maxStorage: 1000000000000,
    maxBranches: 999,
    features: JSON.stringify([]),
    sortOrder: 4,
    active: true,
  },
]

/* ------------------------------------------------------------------ */
/*  Stagger animation variants                                          */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

const formCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatPlanPrice(plan: Plan): string {
  if (plan.id === 'custom') return 'Custom'
  if ((plan.priceMonthly ?? 0) === 0) return 'Free'
  return `$${plan.priceMonthly}/mo`
}

/* ------------------------------------------------------------------ */
/*  Left Branding Panel (desktop only)                                 */
/* ------------------------------------------------------------------ */

function BrandingPanel() {
  const benefits = [
    {
      icon: Layers,
      title: 'Full EPPM Suite',
      desc: '25+ modules for complete project lifecycle management',
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tenant Isolation',
      desc: 'Your data is fully isolated and secure',
    },
    {
      icon: Lock,
      title: 'RBAC Permissions',
      desc: 'Granular access control at every level',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Dedicated support team always available',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative flex h-full flex-col justify-between overflow-hidden p-8 lg:p-12"
    >
      {/* Decorative gold glow orbs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#F5A623]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#F5A623]/5 blur-[120px]" />

      {/* Logo */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <Image
            src="/brand/smartbuild-app-dark.svg"
            alt="SmartBuild"
            width={44}
            height={44}
            className="h-11 w-11"
          />
          <span className="font-heading text-lg font-bold text-white">
            SmartBuild
          </span>
        </div>
      </motion.div>

      {/* Hero headline */}
      <motion.div variants={itemVariants} className="mt-12 space-y-4">
        <h1 className="font-heading text-3xl font-bold leading-tight text-white lg:text-4xl xl:text-5xl">
          Start your{' '}
          <span className="text-gradient">14-day free trial</span>
        </h1>
        <p className="max-w-md font-body text-base leading-relaxed text-white/70 lg:text-lg">
          SmartBuild is the enterprise EPPM platform trusted by leading
          construction companies to manage projects from concept to completion.
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div variants={itemVariants} className="mt-10 space-y-5">
        {benefits.map((b) => (
          <div key={b.title} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5A623]/15">
              <b.icon className="h-5 w-5 text-[#F5A623]" />
            </div>
            <div>
              <p className="font-heading text-sm font-semibold text-white">
                {b.title}
              </p>
              <p className="font-body text-sm text-white/60">{b.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Testimonial */}
      <motion.div
        variants={itemVariants}
        className="mt-10 rounded-xl glass p-5"
      >
        <Quote className="mb-3 h-5 w-5 text-[#F5A623]/60" />
        <p className="font-body text-sm leading-relaxed text-white/80 italic">
          &ldquo;SmartBuild transformed how we manage our entire project
          portfolio. The multi-tenant architecture gives us complete isolation
          while maintaining enterprise-grade collaboration.&rdquo;
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623]/20 font-heading text-sm font-bold text-[#F5A623]">
            AF
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-white">
              Ahmad Faiz
            </p>
            <p className="font-body text-xs text-white/50">
              COO at Gamuda Berhad
            </p>
            <p className="font-body text-xs text-white/40">
              Leading Malaysian construction company
            </p>
          </div>
        </div>
      </motion.div>

      {/* Copyright */}
      <motion.p
        variants={itemVariants}
        className="mt-8 font-body text-xs text-white/30"
      >
        © 2025 SmartBuild · Enterprise Multi-Tenant SaaS Platform
      </motion.p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Plan Selector Skeleton                                             */
/* ------------------------------------------------------------------ */

function PlanSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-20 w-32 shrink-0 rounded-xl"
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Register Page                                                       */
/* ------------------------------------------------------------------ */

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  /* Plans state */
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)

  /* Form state */
  const [companyName, setCompanyName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [phone, setPhone] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tosAccepted, setTosAccepted] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState<{ companyName: string; slug: string } | null>(null)

  /* Fetch plans */
  useEffect(() => {
    fetch('/api/platform/plans')
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((data) => {
        const sorted = (data.plans || data || [])
          .filter((p: Plan) => p.active)
          .sort((a: Plan, b: Plan) => a.sortOrder - b.sortOrder)
        setPlans(sorted.length > 0 ? sorted : FALLBACK_PLANS)
      })
      .catch(() => {
        setPlans(FALLBACK_PLANS)
      })
      .finally(() => {
        setPlansLoading(false)
      })
  }, [])

  /* Pre-select plan from URL param */
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam) {
      setSelectedPlanId(planParam)
    }
  }, [searchParams])

  /* Auto-generate slug from company name */
  useEffect(() => {
    if (!slugEdited && companyName) {
      setSlug(slugify(companyName))
    }
  }, [companyName, slugEdited])

  /* Clear field error on input change */
  const clearError = useCallback((field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  /* Validation */
  const validate = useCallback((): boolean => {
    const e: FieldErrors = {}

    if (!companyName.trim()) e.companyName = 'Company name is required'
    if (!slug.trim()) {
      e.slug = 'URL slug is required'
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      e.slug = 'Only lowercase letters, numbers, and hyphens allowed'
    } else if (slug.length < 3) {
      e.slug = 'Slug must be at least 3 characters'
    }
    if (!adminName.trim()) e.adminName = 'Full name is required'
    if (!adminEmail.trim()) {
      e.adminEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      e.adminEmail = 'Please enter a valid email address'
    }
    if (!adminPassword) {
      e.adminPassword = 'Password is required'
    } else if (adminPassword.length < 6) {
      e.adminPassword = 'Password must be at least 6 characters'
    }
    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your password'
    } else if (adminPassword !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }
    if (!tosAccepted) {
      e.tos = 'You must accept the Terms of Service'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }, [companyName, slug, adminName, adminEmail, adminPassword, confirmPassword, tosAccepted])

  /* Submit handler */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          slug,
          phone: phone || undefined,
          adminName,
          adminEmail,
          adminPassword,
          planId: selectedPlanId || 'free-trial',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.field === 'slug') {
          setErrors({ slug: data.message || 'This workspace URL is already taken' })
        } else {
          toast.error(data.message || data.error || 'Registration failed. Please try again.')
        }
        return
      }

      setSuccess({ companyName: companyName.trim(), slug: slug.trim() })
    } catch {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  /* Input classes for desktop dark styling vs mobile light styling */
  const inputClasses = cn(
    'h-11 w-full rounded-lg text-sm font-body transition-colors',
    'placeholder:text-muted-foreground/60',
    'focus-visible:ring-[#F5A623]/50 focus-visible:border-[#F5A623]/50',
    'bg-white/95 text-[#0B2345] border border-[#E2E8F0]',
    'lg:bg-white/10 lg:text-white lg:border-white/10 lg:placeholder:text-white/40',
    errors.companyName && 'border-red-400 lg:border-red-400',
  )

  const fieldLabelClasses = 'font-heading text-sm font-medium text-[#0B2345] lg:text-white/80'

  /* ---------------------------------------------------------------- */
  /*  Success state                                                     */
  /* ---------------------------------------------------------------- */

  if (success) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-2xl glass p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
            className="mx-auto flex h-16 w-16 items-center justify-center"
          >
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 space-y-3"
          >
            <h2 className="font-heading text-2xl font-bold text-white">
              Workspace Created!
            </h2>
            <p className="font-body text-white/70">
              Your workspace <span className="font-semibold text-white">{success.companyName}</span> is ready.
            </p>

            <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="font-body text-xs text-white/50 mb-1">Your workspace URL</p>
              <p className="font-heading text-lg font-bold text-gradient">
                smartbuild.app/{success.slug}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                onClick={() => router.push('/app')}
                className="w-full h-11 bg-[#F5A623] text-[#0B2345] hover:bg-[#F7B84E] font-heading font-semibold rounded-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="font-body text-xs text-white/40">
                Check your email for login credentials and next steps.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Registration form                                                */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ---- Left Branding Panel (desktop only) ---- */}
      <div className="relative hidden lg:block bg-navy-gradient">
        <BrandingPanel />
      </div>

      {/* ---- Right Panel: Form ---- */}
      <div className="relative flex flex-col items-center justify-start px-4 py-8 lg:justify-center lg:px-6 bg-[#F8FAFC] lg:bg-[#0B2345]">
        {/* Mobile-only logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-3 lg:hidden"
        >
          <Image
            src="/brand/smartbuild-app-dark.svg"
            alt="SmartBuild"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <div>
            <p className="font-heading text-sm font-bold text-[#0B2345]">
              SmartBuild
            </p>
            <p className="font-body text-xs text-[#6B7280]">
              Enterprise EPPM Platform
            </p>
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div
          variants={formCardVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-lg"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl lg:bg-white/10 lg:backdrop-blur-2xl">
            {/* Gold top accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#F5A623] via-[#F7B84E] to-[#F5A623]" />

            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="mb-6 text-center lg:text-left">
                <h1 className="font-heading text-2xl font-bold text-[#0B2345] lg:text-white">
                  Create your workspace
                </h1>
                <p className="mt-1 font-body text-sm text-[#6B7280] lg:text-white/60">
                  Get started in minutes — no credit card required
                </p>
              </div>

              {/* Plan Selector */}
              <div className="mb-6">
                <Label className={cn(fieldLabelClasses, 'mb-3 block')}>
                  Select your plan
                </Label>
                {plansLoading ? (
                  <PlanSkeleton />
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 scroll-thin">
                    {plans.map((plan) => {
                      const isSelected = selectedPlanId === plan.id
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={cn(
                            'flex shrink-0 flex-col items-center rounded-xl border-2 p-3 transition-all min-w-[120px]',
                            'hover:scale-[1.02]',
                            isSelected
                              ? 'border-[#F5A623] bg-[#F5A623]/10 shadow-sm'
                              : 'border-white/10 lg:border-white/10 border-[#E2E8F0] bg-white lg:bg-white/5 hover:border-[#F5A623]/40',
                          )}
                        >
                          <span
                            className={cn(
                              'font-heading text-sm font-semibold',
                              isSelected
                                ? 'text-[#F5A623]'
                                : 'text-[#0B2345] lg:text-white',
                            )}
                          >
                            {plan.name}
                          </span>
                          <span
                            className={cn(
                              'font-body text-xs mt-1',
                              isSelected
                                ? 'text-[#F5A623]/80'
                                : 'text-[#6B7280] lg:text-white/50',
                            )}
                          >
                            {formatPlanPrice(plan)}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="mt-1.5"
                            >
                              <Check className="h-3.5 w-3.5 text-[#F5A623]" />
                            </motion.div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ---- Company Information ---- */}
                <div>
                  <h2 className="font-heading text-sm font-bold text-[#0B2345] lg:text-white mb-4">
                    Company Information
                  </h2>
                  <div className="space-y-4">
                    {/* Company Name */}
                    <div>
                      <Label htmlFor="companyName" className={fieldLabelClasses}>
                        Company Name <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value)
                            clearError('companyName')
                          }}
                          placeholder="e.g. Gamuda Berhad"
                          className={cn(inputClasses, 'pl-10')}
                          aria-invalid={!!errors.companyName}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="mt-1 font-body text-xs text-red-400">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    {/* Company URL Slug */}
                    <div>
                      <Label htmlFor="slug" className={fieldLabelClasses}>
                        Company URL Slug <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                        <Input
                          id="slug"
                          value={slug}
                          onChange={(e) => {
                            const val = e.target.value
                            if (/^[a-z0-9-]*$/.test(val)) {
                              setSlug(val)
                              setSlugEdited(true)
                              clearError('slug')
                            }
                          }}
                          placeholder="your-company"
                          className={cn(inputClasses, 'pl-10')}
                          aria-invalid={!!errors.slug}
                        />
                      </div>
                      {slug && !errors.slug && (
                        <p className="mt-1.5 font-body text-xs text-[#6B7280] lg:text-white/50">
                          Your workspace URL:{' '}
                          <span className="font-semibold text-[#F5A623]">
                            smartbuild.app/{slug}
                          </span>
                        </p>
                      )}
                      {errors.slug && (
                        <p className="mt-1 font-body text-xs text-red-400">
                          {errors.slug}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className={fieldLabelClasses}>
                        Phone{' '}
                        <span className="font-body text-xs font-normal text-[#6B7280] lg:text-white/40">
                          (optional)
                        </span>
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+60 12-345 6789"
                          className={cn(inputClasses, 'pl-10')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- Admin Account ---- */}
                <div>
                  <h2 className="font-heading text-sm font-bold text-[#0B2345] lg:text-white mb-4">
                    Admin Account
                  </h2>
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="adminName" className={fieldLabelClasses}>
                        Full Name <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                        <Input
                          id="adminName"
                          value={adminName}
                          onChange={(e) => {
                            setAdminName(e.target.value)
                            clearError('adminName')
                          }}
                          placeholder="Ahmad Faiz"
                          className={cn(inputClasses, 'pl-10')}
                          aria-invalid={!!errors.adminName}
                        />
                      </div>
                      {errors.adminName && (
                        <p className="mt-1 font-body text-xs text-red-400">
                          {errors.adminName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="adminEmail" className={fieldLabelClasses}>
                        Email <span className="text-red-400">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                        <Input
                          id="adminEmail"
                          type="email"
                          value={adminEmail}
                          onChange={(e) => {
                            setAdminEmail(e.target.value)
                            clearError('adminEmail')
                          }}
                          placeholder="admin@company.com"
                          className={cn(inputClasses, 'pl-10')}
                          aria-invalid={!!errors.adminEmail}
                        />
                      </div>
                      {errors.adminEmail && (
                        <p className="mt-1 font-body text-xs text-red-400">
                          {errors.adminEmail}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="adminPassword" className={fieldLabelClasses}>
                          Password <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                          <Input
                            id="adminPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => {
                              setAdminPassword(e.target.value)
                              clearError('adminPassword')
                            }}
                            placeholder="Min. 6 characters"
                            className={cn(inputClasses, 'pl-10 pr-10')}
                            aria-invalid={!!errors.adminPassword}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B2345] lg:text-white/40 lg:hover:text-white/70 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.adminPassword && (
                          <p className="mt-1 font-body text-xs text-red-400">
                            {errors.adminPassword}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <Label htmlFor="confirmPassword" className={fieldLabelClasses}>
                          Confirm Password <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative mt-1">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] lg:text-white/40" />
                          <Input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value)
                              clearError('confirmPassword')
                            }}
                            placeholder="Re-enter password"
                            className={cn(inputClasses, 'pl-10 pr-10')}
                            aria-invalid={!!errors.confirmPassword}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0B2345] lg:text-white/40 lg:hover:text-white/70 transition-colors"
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 font-body text-xs text-red-400">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---- Terms ---- */}
                <div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="tos"
                      checked={tosAccepted}
                      onCheckedChange={(checked) => {
                        setTosAccepted(checked === true)
                        clearError('tos')
                      }}
                      className="mt-0.5 border-[#E2E8F0] data-[state=checked]:bg-[#F5A623] data-[state=checked]:border-[#F5A623] lg:border-white/20"
                    />
                    <Label htmlFor="tos" className="font-body text-sm text-[#6B7280] lg:text-white/60 leading-relaxed cursor-pointer">
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-[#F5A623] underline underline-offset-2 hover:text-[#F7B84E] transition-colors"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-[#F5A623] underline underline-offset-2 hover:text-[#F7B84E] transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {errors.tos && (
                    <p className="mt-1 font-body text-xs text-red-400 ml-7">
                      {errors.tos}
                    </p>
                  )}
                </div>

                {/* ---- Submit ---- */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F5A623] text-[#0B2345] hover:bg-[#F7B84E] font-heading font-semibold rounded-lg text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Workspace…
                    </>
                  ) : (
                    <>
                      Create My Workspace
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {/* ---- Sign In Link ---- */}
                <p className="text-center font-body text-sm text-[#6B7280] lg:text-white/50">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#F5A623] hover:text-[#F7B84E] transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>

          {/* Footer (mobile only) */}
          <div className="mt-6 text-center lg:hidden">
            <p className="font-body text-xs text-[#6B7280]">
              © 2025 SmartBuild · Enterprise Multi-Tenant SaaS Platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
