'use client'

import { useState, useEffect, useRef } from 'react'
import { useFormat } from '@/hooks/use-format'
import { useRegion } from '@/components/providers/regional-provider'
import { useAppStore, getRoleBasedHomePage } from '@/lib/store'
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

export default function LoginPage() {
  const router = useRouter()
  const { getCallingCode, getPhonePlaceholder } = useFormat()
  const { country } = useRegion()
  const { setToken, setUser, navigate } = useAppStore()

  // Login tab state: 'email' or 'whatsapp'
  const [loginTab, setLoginTab] = useState<'email' | 'whatsapp'>('email')

  // Email login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // WhatsApp OTP state
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

  // ──────── AUTH HANDLERS ────────

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
        // Sync token to Zustand store (handles localStorage write internally)
        setToken(data.data.token)
        // Set user in Zustand store (sets isAuthenticated = true)
        setUser(data.data.user)
        toast.success('Welcome back!', {
          description: `Logged in as ${data.data.user?.name || data.data.user?.email}`,
        })
        // Navigate to the SPA root — the HomePage init will pick up the token
        // and route the user to their role-based dashboard.
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
    <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
      {/* Desktop heading */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {loginTab === 'email' ? 'Sign In to Your Account' : 'WhatsApp Login'}
        </h2>
        <p className="text-sm text-gray-500">
          {loginTab === 'email'
            ? 'Enter your credentials to access your dashboard'
            : 'Enter your phone number to receive a one-time code'}
        </p>
      </div>

      {/* Tab switcher (desktop) */}
      <div className="hidden lg:flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setLoginTab('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            loginTab === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Login
        </button>
        <button
          onClick={() => setLoginTab('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            loginTab === 'whatsapp'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp OTP
        </button>
      </div>

      {/* Tab switcher (mobile) */}
      <div className="lg:hidden flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        <button
          onClick={() => setLoginTab('email')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            loginTab === 'email'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
        <button
          onClick={() => setLoginTab('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            loginTab === 'whatsapp'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          WhatsApp
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loginTab === 'email' ? (
          <motion.div
            key="email-login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <form onSubmit={handleEmailLogin} className="space-y-5">
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs font-bold">!</span>
                  </div>
                  {loginError}
                </motion.div>
              )}

              {/* Email field */}
              <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLoginError('') }}
                    required
                    className="h-12 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
                  />
                </div>
              </motion.div>

              {/* Password field */}
              <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
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

              {/* Remember me & forgot password */}
              <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(!!v)}
                    className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </motion.div>

              {/* Submit button */}
              <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {loginLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="whatsapp-login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {otpError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-xs font-bold">!</span>
                </div>
                {otpError}
              </div>
            )}

            {!otpSent ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp-phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 px-3 h-12 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-600 shrink-0 font-medium">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{getCallingCode()}</span>
                    </div>
                    <Input
                      id="whatsapp-phone"
                      type="tel"
                      placeholder={getPhonePlaceholder()}
                      value={phoneNumber}
                      onChange={(e) => { setPhoneNumber(e.target.value); setOtpError('') }}
                      className="flex-1 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {otpLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send OTP Code
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="text-center space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm text-gray-500">
                    Enter the 6-digit code sent to
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCallingCode()} {phoneNumber}
                  </p>
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
                    <div className="w-3 flex items-center justify-center text-gray-300 text-xl font-bold">-</div>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-14 w-12 rounded-lg" />
                      <InputOTPSlot index={4} className="h-14 w-12 rounded-lg" />
                      <InputOTPSlot index={5} className="h-14 w-12 rounded-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otpVerifyLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {otpVerifyLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify & Login
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend code in{' '}
                      <span className="font-semibold text-orange-600">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
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

      {/* Divider */}
      <div className="relative my-6">
        <Separator className="bg-gray-200" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400 uppercase tracking-wider">
          or continue with
        </span>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-11 gap-2 font-medium text-sm rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300"
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
        <Button
          variant="outline"
          className="h-11 gap-2 font-medium text-sm rounded-xl border-gray-200 hover:bg-gray-50 hover:border-gray-300"
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
      </div>

      {/* Bottom link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
        >
          Create Account
        </Link>
      </p>

      {/* Footer links */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
        <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">Privacy</Link>
        <span>·</span>
        <Link href="/terms-of-service" className="hover:text-gray-600 transition-colors">Terms</Link>
        <span>·</span>
        <Link href="/contact" className="hover:text-gray-600 transition-colors">Support</Link>
      </div>
    </motion.div>
  )
}