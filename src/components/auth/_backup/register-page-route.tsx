'use client'

import { useState } from 'react'
import { useFormat } from '@/hooks/use-format'
import { useRegion } from '@/components/providers/regional-provider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Building2,
  HardHat,
  ArrowRight,
} from 'lucide-react'

// ──────── Animation Variants ────────
const formVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.1 } },
  exit: { opacity: 0, x: 30, transition: { duration: 0.3 } },
}

const fieldVariants = {
  initial: { opacity: 0, y: 15 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.15 + i * 0.06 },
  }),
}

export default function RegisterPage() {
  const router = useRouter()
  const { getCallingCode, getPhonePlaceholder } = useFormat()
  const { country } = useRegion()

  // Register state
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regPosition, setRegPosition] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regShowPassword, setRegShowPassword] = useState(false)
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match')
      return
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters')
      return
    }
    setRegLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${regFirstName} ${regLastName}`.trim(),
          email: regEmail,
          password: regPassword,
          phone: regPhone ? `${getCallingCode()} ${regPhone}` : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/login')
      } else {
        setRegError(data.error || 'Registration failed. Please try again.')
      }
    } catch {
      setRegError('Network error. Please check your connection.')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
      {/* Desktop heading */}
      <div className="hidden lg:block mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h2>
        <p className="text-sm text-gray-500">
          Fill in your details to get started. Free 14-day trial included.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {regError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span className="text-red-500 text-xs font-bold">!</span>
            </div>
            {regError}
          </motion.div>
        )}

        {/* Name row */}
        <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-first" className="text-sm font-medium text-gray-700">First Name</Label>
            <Input
              id="reg-first"
              placeholder="John"
              value={regFirstName}
              onChange={(e) => { setRegFirstName(e.target.value); setRegError('') }}
              required
              className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-last" className="text-sm font-medium text-gray-700">Last Name</Label>
            <Input
              id="reg-last"
              placeholder="Doe"
              value={regLastName}
              onChange={(e) => { setRegLastName(e.target.value); setRegError('') }}
              required
              className="h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
            />
          </div>
        </motion.div>

        {/* Email */}
        <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
          <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              id="reg-email"
              type="email"
              placeholder="john@company.com"
              value={regEmail}
              onChange={(e) => { setRegEmail(e.target.value); setRegError('') }}
              required
              className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
            />
          </div>
        </motion.div>

        {/* Phone */}
        <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
          <Label htmlFor="reg-phone" className="text-sm font-medium text-gray-700">
            Phone Number
          </Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-600 shrink-0 font-medium">
              <span>{country?.flagEmoji ?? '🇧🇳'}</span>
              <span>{getCallingCode()}</span>
            </div>
            <Input
              id="reg-phone"
              type="tel"
              placeholder={getPhonePlaceholder()}
              value={regPhone}
              onChange={(e) => { setRegPhone(e.target.value); setRegError('') }}
              className="flex-1 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
            />
          </div>
        </motion.div>

        {/* Company & Position */}
        <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-company" className="text-sm font-medium text-gray-700">Company</Label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="reg-company"
                placeholder="Company Name"
                value={regCompany}
                onChange={(e) => setRegCompany(e.target.value)}
                className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-position" className="text-sm font-medium text-gray-700">Position</Label>
            <div className="relative">
              <HardHat className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="reg-position"
                placeholder="Project Manager"
                value={regPosition}
                onChange={(e) => setRegPosition(e.target.value)}
                className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={4} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
          <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">Password</Label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <Input
              id="reg-password"
              type={regShowPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={regPassword}
              onChange={(e) => { setRegPassword(e.target.value); setRegError('') }}
              required
              className="h-11 pl-11 pr-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
            />
            <button
              type="button"
              onClick={() => setRegShowPassword(!regShowPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Confirm Password */}
        <motion.div custom={5} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
          <Label htmlFor="reg-confirm" className="text-sm font-medium text-gray-700">Confirm Password</Label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <Input
              id="reg-confirm"
              type={regShowPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={regConfirmPassword}
              onChange={(e) => { setRegConfirmPassword(e.target.value); setRegError('') }}
              required
              className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
            />
          </div>
        </motion.div>

        {/* Terms */}
        <motion.div custom={6} variants={fieldVariants} initial="initial" animate="animate">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded mt-0.5" />
            <span className="text-xs text-gray-500 leading-relaxed">
              I agree to the{' '}
              <Link href="/terms-of-service" className="text-orange-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</Link>
            </span>
          </label>
        </motion.div>

        {/* Submit button */}
        <motion.div custom={7} variants={fieldVariants} initial="initial" animate="animate">
          <Button
            type="submit"
            disabled={regLoading}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            {regLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Switch to login */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  )
}