'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, User, Lock, Building2, Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

const fieldVariants = {
  initial: { opacity: 0, y: 15 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.15 + i * 0.06 },
  }),
}

function AuthFooter() {
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Protected by SmartBuild Security</span>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
        <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms-of-service" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
      </div>
      <p className="text-center text-[10px] text-gray-300">
        © {new Date().getFullYear()} SmartBuild. All rights reserved.
      </p>
    </div>
  )
}

function InviteAcceptanceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const inviteEmail = searchParams.get('email')
    const inviteCompany = searchParams.get('company')
    if (inviteEmail) setEmail(inviteEmail)
    if (inviteCompany) setCompanyName(inviteCompany)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/invite-accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          company: companyName,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login')
        }, 2500)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heading */}
      <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate" className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Accept Your Invitation</h1>
        <p className="text-sm text-gray-500">
          You&apos;ve been invited to join a team on SmartBuild
        </p>
      </motion.div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm w-full">
            <p className="font-semibold mb-1 text-center">Account Created!</p>
            <p className="text-emerald-600 text-center">
              Your account has been set up successfully. Redirecting you to sign in...
            </p>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
              {error}
            </motion.div>
          )}

          {/* Full Name */}
          <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="invite-name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="invite-name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError('') }}
                required
                className="h-12 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="invite-email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="invite-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                required
                className="h-12 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>
          </motion.div>

          {/* Company Name (read-only if from query params) */}
          {companyName && (
            <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
              <Label htmlFor="invite-company" className="text-sm font-medium text-gray-700">
                Company
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="invite-company"
                  type="text"
                  value={companyName}
                  readOnly
                  className="h-12 pl-11 rounded-xl border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </motion.div>
          )}

          {/* Password */}
          <motion.div custom={companyName ? 4 : 3} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="invite-password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="invite-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                required
                className="h-12 pl-11 pr-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Confirm Password */}
          <motion.div custom={companyName ? 5 : 4} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="invite-confirm-password" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="invite-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                required
                className="h-12 pl-11 pr-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Terms checkbox */}
          <motion.div custom={companyName ? 6 : 5} variants={fieldVariants} initial="initial" animate="animate">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(v) => setAgreedToTerms(!!v)}
                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded mt-0.5"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-snug">
                I agree to the{' '}
                <Link href="/terms-of-service" className="text-orange-600 hover:text-orange-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-orange-600 hover:text-orange-700 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </motion.div>

          {/* Submit button */}
          <motion.div custom={companyName ? 7 : 6} variants={fieldVariants} initial="initial" animate="animate">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Accept Invitation & Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </motion.div>
        </form>
      )}

      <AuthFooter />
    </motion.div>
  )
}

export default function InviteAcceptancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    }>
      <InviteAcceptanceForm />
    </Suspense>
  )
}