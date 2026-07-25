'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
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
/*  Fallback plans (used when API is unavailable)                      */
/* ------------------------------------------------------------------ */

const FALLBACK_PLANS: Plan[] = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    description: '14-day free trial with basic features',
    priceMonthly: 0,
    priceAnnual: 0,
    maxUsers: 5,
    maxProjects: 3,
    maxStorage: 500,
    maxBranches: 1,
    features: JSON.stringify(['dashboard', 'projects', 'maintenance', 'complaints']),
    sortOrder: 0,
    active: true,
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started',
    priceMonthly: 99,
    priceAnnual: 948,
    maxUsers: 15,
    maxProjects: 10,
    maxStorage: 5000,
    maxBranches: 3,
    features: JSON.stringify([]),
    sortOrder: 1,
    active: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing construction companies',
    priceMonthly: 299,
    priceAnnual: 2868,
    maxUsers: 50,
    maxProjects: 50,
    maxStorage: 25000,
    maxBranches: 10,
    features: JSON.stringify([]),
    sortOrder: 2,
    active: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large enterprises with advanced needs',
    priceMonthly: 799,
    priceAnnual: 7670,
    maxUsers: 500,
    maxProjects: 500,
    maxStorage: 100000,
    maxBranches: 50,
    features: JSON.stringify([]),
    sortOrder: 3,
    active: true,
  },
]

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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
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
        setPlans(sorted)
      })
      .catch(() => {
        setPlans(FALLBACK_PLANS.sort((a, b) => a.sortOrder - b.sortOrder))
      })
      .finally(() => setPlansLoading(false))
  }, [])

  /* Handle ?plan= URL param */
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam) setSelectedPlanId(planParam)
  }, [searchParams])

  /* Auto-select first plan when loaded */
  useEffect(() => {
    if (!plansLoading && plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id)
    }
  }, [plansLoading, plans, selectedPlanId])

  /* Auto-generate slug from company name */
  useEffect(() => {
    if (!slugEdited && companyName) {
      setSlug(slugify(companyName))
    }
  }, [companyName, slugEdited])

  /* Validate form */
  const validate = useCallback((): FieldErrors => {
    const errs: FieldErrors = {}

    if (!companyName.trim()) errs.companyName = 'Company name is required'
    if (!slug.trim()) errs.slug = 'Company URL is required'
    else if (!/^[a-z0-9-]+$/.test(slug)) errs.slug = 'Only lowercase letters, numbers, and hyphens allowed'
    else if (slug.length < 3) errs.slug = 'URL must be at least 3 characters'

    if (!adminName.trim()) errs.adminName = 'Full name is required'

    if (!adminEmail.trim()) errs.adminEmail = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) errs.adminEmail = 'Please enter a valid email address'

    if (!adminPassword) errs.adminPassword = 'Password is required'
    else if (adminPassword.length < 6) errs.adminPassword = 'Password must be at least 6 characters'

    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (adminPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match'

    if (!tosAccepted) errs.tos = 'You must accept the Terms of Service'

    return errs
  }, [companyName, slug, adminName, adminEmail, adminPassword, confirmPassword, tosAccepted])

  /* Submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the errors below')
      return
    }

    setLoading(true)
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
        toast.error(data.error || 'Registration failed')
        return
      }
      setSuccess({ companyName: companyName.trim(), slug: slug.trim() })
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------ */
  /*  Success state                                                */
  /* ------------------------------------------------------------ */

  if (success) {
    return (
      <div className="min-h-dvh flex flex-col bg-background">
        <header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur">
          <div className="max-w-[1600px] mx-auto flex h-full items-center justify-between px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/brand/smartbuild-app-light.svg"
                alt="SmartBuild"
                width={36}
                height={36}
                className="h-9 w-9 rounded-[22%]"
              />
              <span className="font-heading text-lg font-bold text-primary">SmartBuild</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Home</Link>
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Pricing</Link>
              <Link href="/register" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Register</Link>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <SectionFadeIn className="w-full max-w-lg mx-auto px-4">
            <Card className="rounded-xl">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                >
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold font-heading">Workspace Created!</h2>
                <p className="text-sm text-muted-foreground font-body">
                  Your workspace <span className="font-semibold text-foreground">{success.companyName}</span> has been set up successfully.
                </p>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-body">smartbuild.app/</span>
                  <span className="font-semibold">{success.slug}</span>
                </div>
                <Button className="w-full gap-2" asChild>
                  <Link href="/app">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </SectionFadeIn>
        </main>

        <BrandFooter />
      </div>
    )
  }

  /* ------------------------------------------------------------ */
  /*  Registration form                                            */
  /* ------------------------------------------------------------ */

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

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

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Pricing
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-primary transition-colors"
            >
              Register
            </Link>
          </nav>

          {/* Sign In */}
          <Button size="sm" variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  Main Content                                                 */}
      {/* ============================================================ */}
      <main className="flex-1 flex justify-center">
        <section className="w-full max-w-lg mx-auto px-4 py-8">
          <SectionFadeIn className="space-y-6">
            {/* Title */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold font-heading">
                Create your workspace
              </h1>
              <p className="text-sm text-muted-foreground font-body">
                Fill in the details to get started
              </p>
            </div>

            {/* Form Card */}
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ------------------------------------------------ */}
                  {/*  Plan Selector                                     */}
                  {/* ------------------------------------------------ */}
                  <div className="space-y-2">
                    <Label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Select Plan
                    </Label>
                    {plansLoading ? (
                      <div className="flex gap-3">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-16 flex-1 rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {plans.map((plan) => {
                          const isSelected = plan.id === selectedPlanId
                          const price = plan.priceMonthly ?? 0
                          return (
                            <button
                              type="button"
                              key={plan.id}
                              onClick={() => setSelectedPlanId(plan.id)}
                              className={cn(
                                'flex-shrink-0 flex flex-col items-center justify-center rounded-lg border-2 px-4 py-3 text-center transition-all min-w-[100px] cursor-pointer',
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-transparent bg-muted/50 hover:bg-muted'
                              )}
                            >
                              <span className={cn(
                                'text-sm font-bold font-heading',
                                isSelected ? 'text-primary' : 'text-foreground'
                              )}>
                                {plan.name}
                              </span>
                              <span className="text-xs text-muted-foreground font-body">
                                {price === 0 ? 'Free' : `$${price}/mo`}
                              </span>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                >
                                  <Check className="h-3.5 w-3.5 text-primary mt-1" />
                                </motion.div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {selectedPlan && (
                      <p className="text-xs text-muted-foreground font-body">
                        {selectedPlan.description}
                      </p>
                    )}
                  </div>

                  {/* ------------------------------------------------ */}
                  {/*  Company Information                               */}
                  {/* ------------------------------------------------ */}
                  <div className="space-y-4">
                    <p className="text-sm font-bold font-heading">Company Information</p>

                    {/* Company Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName" className="text-xs font-body">
                        Company Name <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Construction"
                          className={cn('pl-9 h-9', errors.companyName && 'border-rose-500')}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-xs text-rose-500 font-body">{errors.companyName}</p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <Label htmlFor="slug" className="text-xs font-body">
                        Company URL <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative flex items-center">
                        <Globe className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="slug"
                          value={slug}
                          onChange={(e) => {
                            setSlug(e.target.value)
                            setSlugEdited(true)
                          }}
                          placeholder="acme-construction"
                          className={cn('pl-9 h-9', errors.slug && 'border-rose-500')}
                        />
                        <span className="absolute right-3 text-xs text-muted-foreground font-body pointer-events-none select-none">
                          smartbuild.app/
                        </span>
                      </div>
                      {slug && !errors.slug && (
                        <p className="text-xs text-muted-foreground font-body">
                          Your workspace: <span className="font-medium text-foreground">smartbuild.app/{slug}</span>
                        </p>
                      )}
                      {errors.slug && (
                        <p className="text-xs text-rose-500 font-body">{errors.slug}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-body">
                        Phone <span className="text-muted-foreground text-[10px]">(optional)</span>
                      </Label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="pl-9 h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ------------------------------------------------ */}
                  {/*  Admin Account                                     */}
                  {/* ------------------------------------------------ */}
                  <div className="space-y-4">
                    <p className="text-sm font-bold font-heading">Admin Account</p>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="adminName" className="text-xs font-body">
                        Full Name <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="adminName"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="John Smith"
                          className={cn('pl-9 h-9', errors.adminName && 'border-rose-500')}
                        />
                      </div>
                      {errors.adminName && (
                        <p className="text-xs text-rose-500 font-body">{errors.adminName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="adminEmail" className="text-xs font-body">
                        Email <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="adminEmail"
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="john@company.com"
                          autoComplete="email"
                          className={cn('pl-9 h-9', errors.adminEmail && 'border-rose-500')}
                        />
                      </div>
                      {errors.adminEmail && (
                        <p className="text-xs text-rose-500 font-body">{errors.adminEmail}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="adminPassword" className="text-xs font-body">
                        Password <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="adminPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className={cn('pl-9 pr-9 h-9', errors.adminPassword && 'border-rose-500')}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.adminPassword && (
                        <p className="text-xs text-rose-500 font-body">{errors.adminPassword}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-body">
                        Confirm Password <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className={cn('pl-9 pr-9 h-9', errors.confirmPassword && 'border-rose-500')}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-rose-500 font-body">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* ------------------------------------------------ */}
                  {/*  Terms of Service                                  */}
                  {/* ------------------------------------------------ */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="tos"
                        checked={tosAccepted}
                        onCheckedChange={(checked) => setTosAccepted(checked === true)}
                        className={cn('mt-0.5', errors.tos && 'border-rose-500')}
                      />
                      <Label htmlFor="tos" className="text-xs font-body leading-relaxed cursor-pointer">
                        I agree to the{' '}
                        <Link href="/terms" className="text-primary underline underline-offset-2 hover:text-primary/80">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.tos && (
                      <p className="text-xs text-rose-500 font-body">{errors.tos}</p>
                    )}
                  </div>

                  {/* ------------------------------------------------ */}
                  {/*  Submit                                            */}
                  {/* ------------------------------------------------ */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Create My Workspace
                  </Button>

                  {/* ------------------------------------------------ */}
                  {/*  Sign in link                                      */}
                  {/* ------------------------------------------------ */}
                  <p className="text-center text-sm text-muted-foreground font-body">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </SectionFadeIn>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  Footer                                                       */}
      {/* ============================================================ */}
      <BrandFooter />
    </div>
  )
}
