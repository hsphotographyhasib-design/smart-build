'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormat } from '@/hooks/use-format'
import { useRegion } from '@/components/providers/regional-provider'
import { useAppStore } from '@/lib/store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  ArrowRight,
  CheckCircle2,
  Building2,
  HardHat,
  Shield,
  BarChart3,
  Users,
  Construction,
  Wrench,
  SquareIcon,
  UserPlus,
  LogIn,
  ChevronRight,
  Lock,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════
// ওভারলে বিষয়বস্তু ডেটা
// ═══════════════════════════════════════════════════════════════════

const features = [
  { icon: Building2, label: 'Project Management' },
  { icon: Wrench, label: 'Maintenance Management' },
  { icon: Construction, label: 'Facility Management' },
  { icon: Users, label: 'Resource Management' },
]

// ═══════════════════════════════════════════════════════════════════
// অ্যানিমেশন ভ্যারিয়্যান্টসমূহ
// ═══════════════════════════════════════════════════════════════════

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const formSlideVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
    filter: 'blur(4px)',
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -60 : 60,
    filter: 'blur(4px)',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
}

// ওভারলে বিষয়বস্তু ভ্যারিয়্যান্টসমূহ
const overlayContentVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
    scale: 0.95,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
    scale: 0.95,
    transition: { duration: 0.3 },
  }),
}

// ═══════════════════════════════════════════════════════════════════
// অ্যানিমেটেড ইনপুট র‍্যাপার — আইকন ও ফোকাস ইফেক্ট সহ ভাসমান লেবেল
// ═══════════════════════════════════════════════════════════════════

function AnimatedInput({
  id,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  required,
  className = '',
  onClearError,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  icon?: React.ElementType
  value: string
  onChange: (val: string) => void
  required?: boolean
  className?: string
  onClearError?: () => void
}) {
  const [isFocused, setIsFocused] = useState(false)
  const isFloating = isFocused || value.length > 0
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <motion.div
        className="relative"
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          {Icon && (
            <motion.div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
              animate={{ color: isFocused ? '#f59e0b' : '#94a3b8' }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-4 h-4" />
            </motion.div>
          )}
          <Input
            id={id}
            type={type}
            placeholder={isFloating ? '' : (placeholder || label)}
            value={value}
            onChange={(e) => { onChange(e.target.value); onClearError?.() }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            required={required}
            className={`h-11 ${Icon ? 'pl-11' : 'pl-4'} rounded-xl border-slate-200 bg-slate-50/50 transition-all duration-300 text-sm ${
              isFocused
                ? 'bg-white border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]'
                : hasValue
                ? 'bg-white border-slate-300'
                : 'bg-slate-50/50'
            } ${className}`}
          />
        </div>
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// লগইন ফর্ম (সকল বিদ্যমান ব্যবসায়িক যুক্তি সংরক্ষিত)
// ═══════════════════════════════════════════════════════════════════

function LoginFormContent() {
  const router = useRouter()
  const { getCallingCode, getPhonePlaceholder } = useFormat()
  const { country } = useRegion()
  const { setToken, setUser } = useAppStore()

  // লগইন ট্যাব অবস্থা: 'email' অথবা 'whatsapp'
  const [loginTab, setLoginTab] = useState<'email' | 'whatsapp'>('email')

  // ইমেইল লগইন অবস্থা
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // WhatsApp OTP অবস্থা
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [otpError, setOtpError] = useState('')

  const resendInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (resendTimer > 0) {
      resendInterval.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            if (resendInterval.current) clearInterval(resendInterval.current)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => {
      if (resendInterval.current) clearInterval(resendInterval.current)
    }
  }, [resendTimer])

  // ──────── প্রমাণীকরণ হ্যান্ডলার (মূল থেকে সংরক্ষিত) ────────

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        toast.success('Welcome back!', {
          description: `Logged in as ${data.data.user?.name || data.data.user?.email}`,
        })
        window.location.href = '/'
      } else {
        setLoginError(data.error || 'Login failed. Please try again.')
      }
    } catch {
      setLoginError('Network error. Please check your connection.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSendOtp = () => {
    if (!phoneNumber.trim()) {
      setOtpError('Please enter your phone number')
      return
    }
    setOtpLoading(true)
    setOtpError('')
    setTimeout(() => {
      setOtpSent(true)
      setOtpLoading(false)
      setResendTimer(60)
    }, 1500)
  }

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter the complete 6-digit code')
      return
    }
    setOtpVerifyLoading(true)
    setOtpError('')
    setTimeout(() => {
      setOtpVerifyLoading(false)
      setOtpError('WhatsApp OTP login is coming soon. Please use email login.')
    }, 1500)
  }

  const handleResendOtp = () => {
    setResendTimer(60)
    setOtpValue('')
    setOtpError('')
  }

  return (
    <div className="space-y-1">
      {/* লোগো */}
      <motion.div
        className="flex items-center gap-2.5 mb-5"
        variants={staggerItem}
      >
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <SquareIcon className="w-5 h-5 text-white fill-white" strokeWidth={0} />
        </motion.div>
        <div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">SmartBuild</span>
          <span className="block text-[9px] font-medium tracking-[0.2em] uppercase text-amber-600">Construction ERP</span>
        </div>
      </motion.div>

      <motion.h2 className="text-[22px] font-bold text-slate-900 mb-0.5" variants={staggerItem}>
        Welcome Back
      </motion.h2>
      <motion.p className="text-sm text-slate-500 mb-5" variants={staggerItem}>
        Sign in to your account to continue
      </motion.p>

      {/* ট্যাব সুইচার */}
      <motion.div
        className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4"
        variants={staggerItem}
      >
        <button
          onClick={() => setLoginTab('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            loginTab === 'email'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
        <button
          onClick={() => setLoginTab('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            loginTab === 'whatsapp'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp OTP
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {loginTab === 'email' ? (
          <motion.form
            key="email-login"
            onSubmit={handleEmailLogin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3.5"
          >
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-red-500 text-xs font-bold">!</span>
                </motion.div>
                {loginError}
              </motion.div>
            )}

            {/* ইমেইল ফিল্ড */}
            <div className="space-y-1.5">
              <Label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <AnimatedInput
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                icon={Mail}
                value={email}
                onChange={setEmail}
                required
                onClearError={() => setLoginError('')}
              />
            </div>

            {/* পাসওয়ার্ড ফিল্ড */}
            <div className="space-y-1.5">
              <Label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <AnimatedInput
                  id="login-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={Lock}
                  value={password}
                  onChange={setPassword}
                  required
                  onClearError={() => setLoginError('')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.div>
                </button>
              </div>
            </div>

            {/* আমাকে মনে রাখুন ও পাসওয়ার্ড ভুলে গেছি */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(!!v)}
                  className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* জমা বাটন */}
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-[15px]"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.form>
        ) : (
          <motion.div
            key="whatsapp-login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3.5"
          >
            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-xs font-bold">!</span>
                </div>
                {otpError}
              </div>
            )}

            {!otpSent ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp-phone" className="text-sm font-medium text-slate-700">
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-600 shrink-0 font-medium">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{getCallingCode()}</span>
                    </div>
                    <Input
                      id="whatsapp-phone"
                      type="tel"
                      placeholder={getPhonePlaceholder()}
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setOtpError('') }}
                      className="flex-1 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors"
                    />
                  </div>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-[15px]"
                  >
                    {otpLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Send OTP Code
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <div className="text-center space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm text-slate-500">Enter the 6-digit code sent to</p>
                  <p className="text-sm font-semibold text-slate-900">{getCallingCode()} {phoneNumber}</p>
                </div>

                <div className="flex justify-center py-2">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(val) => { setOtpValue(val); setOtpError('') }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-14 w-12 rounded-lg" />
                      <InputOTPSlot index={1} className="h-14 w-12 rounded-lg" />
                      <InputOTPSlot index={2} className="h-14 w-12 rounded-lg" />
                    </InputOTPGroup>
                    <div className="w-3 flex items-center justify-center text-slate-300 text-xl font-bold">-</div>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-14 w-12 rounded-lg" />
                      <InputOTPSlot index={4} className="h-14 w-12 rounded-lg" />
                      <InputOTPSlot index={5} className="h-14 w-12 rounded-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otpVerifyLoading}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-[15px]"
                  >
                    {otpVerifyLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Verify & Login
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-slate-500">
                      Resend code in <span className="font-semibold text-amber-600">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer"
                    >
                      Resend OTP Code
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* বিভাজক */}
      <div className="relative my-5">
        <Separator className="bg-slate-200" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-400 uppercase tracking-wider">
          or continue with
        </span>
      </div>

      {/* সোশ্যাল লগইন */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full h-11 gap-2 font-medium text-sm rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            type="button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            className="w-full h-11 gap-2 font-medium text-sm rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            type="button"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
            Microsoft
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// নিবন্ধন ফর্ম (সকল বিদ্যমান ব্যবসায়িক যুক্তি সংরক্ষিত)
// ═══════════════════════════════════════════════════════════════════

function RegisterFormContent() {
  const router = useRouter()
  const { getCallingCode, getPhonePlaceholder } = useFormat()
  const { country } = useRegion()

  // নিবন্ধন অবস্থা
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
    <div className="space-y-1">
      {/* লোগো */}
      <motion.div
        className="flex items-center gap-2.5 mb-5"
        variants={staggerItem}
      >
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25"
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <SquareIcon className="w-5 h-5 text-white fill-white" strokeWidth={0} />
        </motion.div>
        <div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">SmartBuild</span>
          <span className="block text-[9px] font-medium tracking-[0.2em] uppercase text-amber-600">Construction ERP</span>
        </div>
      </motion.div>

      <motion.h2 className="text-[22px] font-bold text-slate-900 mb-0.5" variants={staggerItem}>
        Create Account
      </motion.h2>
      <motion.p className="text-sm text-slate-500 mb-4" variants={staggerItem}>
        Fill in your details to get started
      </motion.p>

      <form onSubmit={handleRegister} className="space-y-2.5">
        {regError && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-red-500 text-xs font-bold">!</span>
            </motion.div>
            {regError}
          </motion.div>
        )}

        {/* নামের সারি */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="reg-first" className="text-xs font-medium text-slate-700">First Name</Label>
            <Input
              id="reg-first"
              placeholder="John"
              value={regFirstName}
              onChange={(e) => { setRegFirstName(e.target.value); setRegError('') }}
              required
              className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 focus:bg-white transition-all duration-300 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-last" className="text-xs font-medium text-slate-700">Last Name</Label>
            <Input
              id="reg-last"
              placeholder="Doe"
              value={regLastName}
              onChange={(e) => { setRegLastName(e.target.value); setRegError('') }}
              required
              className="h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 focus:bg-white transition-all duration-300 text-sm"
            />
          </div>
        </div>

        {/* ইমেইল */}
        <div className="space-y-1">
          <Label htmlFor="reg-email" className="text-xs font-medium text-slate-700">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              id="reg-email"
              type="email"
              placeholder="john@company.com"
              value={regEmail}
              onChange={(e) => { setRegEmail(e.target.value); setRegError('') }}
              required
              className="h-10 pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 focus:bg-white transition-all duration-300 text-sm"
            />
          </div>
        </div>

        {/* ফোন */}
        <div className="space-y-1">
          <Label htmlFor="reg-phone" className="text-xs font-medium text-slate-700">Phone Number</Label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 px-2.5 h-10 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-600 shrink-0 font-medium">
              <span>{country?.flagEmoji ?? '🇧🇳'}</span>
              <span>{getCallingCode()}</span>
            </div>
            <Input
              id="reg-phone"
              type="tel"
              placeholder={getPhonePlaceholder()}
              value={regPhone}
              onChange={(e) => { setRegPhone(e.target.value); setRegError('') }}
              className="flex-1 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors text-sm"
            />
          </div>
        </div>

        {/* কোম্পানি ও পদবি */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="reg-company" className="text-xs font-medium text-slate-700">Company</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input
                id="reg-company"
                placeholder="Company Name"
                value={regCompany}
                onChange={(e) => setRegCompany(e.target.value)}
                className="h-10 pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-position" className="text-xs font-medium text-slate-700">Position</Label>
            <div className="relative">
              <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input
                id="reg-position"
                placeholder="Project Manager"
                value={regPosition}
                onChange={(e) => setRegPosition(e.target.value)}
                className="h-10 pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors text-sm"
              />
            </div>
          </div>
        </div>

        {/* পাসওয়ার্ড */}
        <div className="space-y-1">
          <Label htmlFor="reg-password" className="text-xs font-medium text-slate-700">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              id="reg-password"
              type={regShowPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={regPassword}
              onChange={(e) => { setRegPassword(e.target.value); setRegError('') }}
              required
              className="h-10 pl-9 pr-9 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setRegShowPassword(!regShowPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {regShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* পাসওয়ার্ড নিশ্চিতকরণ */}
        <div className="space-y-1">
          <Label htmlFor="reg-confirm" className="text-xs font-medium text-slate-700">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <Input
              id="reg-confirm"
              type={regShowPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={regConfirmPassword}
              onChange={(e) => { setRegConfirmPassword(e.target.value); setRegError('') }}
              required
              className="h-10 pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:border-amber-400 focus:ring-amber-400/20 transition-colors text-sm"
            />
          </div>
        </div>

        {/* শর্তাবলী */}
        <label className="flex items-start gap-2 cursor-pointer">
          <Checkbox className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded mt-0.5" />
          <span className="text-xs text-slate-500 leading-relaxed">
            I agree to the{' '}
            <Link href="/terms-of-service" className="text-amber-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy-policy" className="text-amber-600 hover:underline">Privacy Policy</Link>
          </span>
        </label>

        {/* জমা বাটন */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            disabled={regLoading}
            className="w-full h-11 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
          >
            {regLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create Account
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// ওভারলে প্যানেল বিষয়বস্তু — স্লাইডিং প্যানেলে প্রদর্শিত ব্র্যান্ডেড বিষয়বস্তু
// ═══════════════════════════════════════════════════════════════════

function OverlayContent({
  mode,
  direction,
}: {
  mode: 'login' | 'register'
  direction: number
}) {
  return (
    <motion.div
      key={mode}
      custom={direction}
      variants={overlayContentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 flex flex-col items-center justify-center px-10 xl:px-16 text-center"
    >
      {/* লোগো */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 mb-4 mx-auto"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <SquareIcon className="w-9 h-9 text-white fill-white" strokeWidth={0} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight"
        >
          SmartBuild
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-white/50 text-[10px] font-medium tracking-[0.25em] uppercase mt-1"
        >
          Construction ERP
        </motion.p>
      </motion.div>

      {/* শিরোনাম */}
      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-xl xl:text-2xl font-bold text-white mb-2"
      >
        {mode === 'login' ? 'Welcome to SmartBuild' : 'Welcome Back'}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="text-white/70 text-sm leading-relaxed max-w-xs mb-8"
      >
        {mode === 'login'
          ? 'Manage Projects, Maintenance, Assets, Resources and Finance from a single platform.'
          : 'Already have an account? Sign in to continue managing your operations.'}
      </motion.p>

      {/* বৈশিষ্ট্যসমূহ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="space-y-3 mb-8 w-full max-w-[220px]"
      >
        {features.map((feat, i) => {
          const Icon = feat.icon
          return (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-3 text-white/80"
            >
              <motion.div
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className="text-sm">{feat.label}</span>
            </motion.div>
          )
        })}
      </motion.div>

      {/* CTA বাটন */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        {/* এই বাটনটি একটি নো-অপ প্লেসহোল্ডার; প্রকৃত সুইচ প্যারেন্ট দ্বারা পরিচালিত হয় */}
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// মোবাইল ভিউ — স্ট্যাকড একক কার্ড লেআউট
// ═══════════════════════════════════════════════════════════════════

function MobileAuthCard({ initialMode = 'login' }: { initialMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const direction = mode === 'login' ? -1 : 1

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait" custom={direction}>
        {mode === 'login' ? (
          <motion.div
            key="mobile-login"
            custom={direction}
            variants={formSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LoginFormContent />
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-amber-600 hover:text-amber-700 font-semibold transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mobile-register"
            custom={direction}
            variants={formSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <RegisterFormContent />
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-amber-600 hover:text-amber-700 font-semibold transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// প্রধান প্রিমিয়াম প্রমাণীকরণ কার্ড — ডেস্কটপ স্লাইডিং প্যানেল + মোবাইল স্ট্যাকড
// ═══════════════════════════════════════════════════════════════════

interface PremiumAuthCardProps {
  initialMode?: 'login' | 'register'
}

export function PremiumAuthCard({ initialMode = 'login' }: PremiumAuthCardProps) {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login')
  // দিক: -1 = প্যানেল বামে সরছে (লগইন -> নিবন্ধন), 1 = প্যানেল ডানে সরছে (নিবন্ধন -> লগইন)
  const [direction, setDirection] = useState(0)

  const switchMode = () => {
    const newDirection = isLoginMode ? -1 : 1
    setDirection(newDirection)
    setIsLoginMode(!isLoginMode)
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 lg:py-0 relative">
      {/* ডেস্কটপ: স্লাইডিং প্যানেল কার্ড */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[1100px] h-[700px] rounded-3xl overflow-hidden"
          style={{
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.06), 0 0 120px -20px rgba(245, 158, 11, 0.15)',
          }}
        >
          {/* ═════ গ্লাস ইফেক্ট বেস ═══════ */}
          <div className="absolute inset-0 bg-white/[0.97] backdrop-blur-2xl" />

          {/* ═════ বাম প্যানেল — লগইন ফর্ম (isLoginMode সক্রিয় থাকলে দৃশ্যমান) ═══════ */}
          <div className="absolute inset-y-0 left-0 w-1/2 z-10 flex items-center justify-center px-10 xl:px-14">
            <div className="w-full max-w-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                {isLoginMode && (
                  <motion.div
                    key="left-login"
                    custom={direction}
                    variants={formSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <motion.div variants={staggerContainer} initial="initial" animate="animate">
                      <LoginFormContent />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ═════ ডান প্যানেল — নিবন্ধন ফর্ম (isLoginMode নিষ্ক্রিয় থাকলে দৃশ্যমান) ═══════ */}
          <div className="absolute inset-y-0 right-0 w-1/2 z-10 flex items-center justify-center px-10 xl:px-14 overflow-hidden">
            <div className="w-full max-w-[380px]">
              <AnimatePresence mode="wait" custom={direction}>
                {!isLoginMode && (
                  <motion.div
                    key="right-register"
                    custom={direction}
                    variants={formSlideVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <motion.div variants={staggerContainer} initial="initial" animate="animate">
                      <RegisterFormContent />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ═════ স্লাইডিং ওভারলে প্যানেল — Framer Motion পরিচালিত ═══════ */}
          <motion.div
            className="absolute inset-y-0 w-1/2 z-30 overflow-hidden"
            animate={{ left: isLoginMode ? '50%' : '0%' }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 22,
              mass: 1.2,
            }}
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)',
              willChange: 'left',
            }}
          >
            {/* ওভারলের ভেতরে আলংকারিক আকৃতিসমূহ */}
            <div className="absolute inset-0 overflow-hidden">
              {/* গ্রিড প্যাটার্ন */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px),
                    repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)
                  `,
                }}
              />

              {/* Framer Motion সহ ভাসমান বৃত্তসমূহ */}
              <motion.div
                className="absolute w-40 h-40 rounded-full bg-white/[0.04]"
                style={{ top: '8%', right: '8%' }}
                animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-28 h-28 rounded-full bg-amber-500/[0.06]"
                style={{ bottom: '12%', left: '12%' }}
                animate={{ y: [0, 15, 0], x: [0, -8, 0], scale: [1, 0.9, 1] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <motion.div
                className="absolute w-20 h-20 rounded-full bg-white/[0.05]"
                style={{ top: '45%', left: '50%' }}
                animate={{ y: [0, -12, 0], x: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              />
              <motion.div
                className="absolute w-16 h-16 rounded-full bg-amber-400/[0.04]"
                style={{ top: '20%', left: '25%' }}
                animate={{ y: [0, 8, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
              />

              {/* রেডিয়াল ঝলক */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

              {/* নিচের ঝলক */}
              <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-white/[0.03] to-transparent pointer-events-none" />
            </div>

            {/* ═════ ওভারলে বিষয়বস্তু — সুইচিংয়ের সময় ক্রস-ফেড ═══════ */}
            <AnimatePresence mode="wait" custom={direction}>
              {isLoginMode ? (
                <OverlayContent key="overlay-login" mode="login" direction={direction} />
              ) : (
                <OverlayContent key="overlay-register" mode="register" direction={direction} />
              )}
            </AnimatePresence>

            {/* ওভারলেতে CTA বাটন */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <AnimatePresence mode="wait">
                <motion.button
                  key={isLoginMode ? 'cta-register' : 'cta-login'}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ delay: 0.85, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onClick={switchMode}
                  className="flex items-center gap-2.5 px-8 py-3 bg-white text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  style={{
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isLoginMode ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                      <motion.span
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ═════ কেন্দ্রীয় বিভাজক রেখা ═══════ */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-300/40 to-transparent z-20 pointer-events-none" />

          {/* ═════ কার্ড বর্ডার ঝলক ═══════ */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none z-40">
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/[0.04]" />
          </div>

          {/* ═════ কার্ডের পেছনে পরিবেশগত ঝলক ═══════ */}
          <div
            className="absolute -inset-4 rounded-[2rem] blur-2xl pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)',
            }}
          />
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          মোবাইল: স্ট্যাকড একক কার্ড
      ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-100/80 p-6 sm:p-8"
          style={{
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.03), 0 0 80px -20px rgba(245, 158, 11, 0.12)',
          }}
        >
          <MobileAuthCard initialMode={initialMode} />
        </motion.div>
      </div>
    </div>
  )
}
