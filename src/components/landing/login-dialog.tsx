'use client'

import { useState } from 'react'
import { useAppStore, api, getRoleBasedHomePage } from '@/lib/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Lock,
  ArrowRight,
  CheckCircle2,
  SquareIcon,
  Shield,
  HardHat,
  BarChart3,
  Building2,
  ChevronRight,
  Users,
  Construction,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useFormat } from '@/hooks/use-format'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const roleBadges = [
  { role: 'Admin', icon: Shield, color: 'bg-amber-500/15 text-amber-600 border-amber-500/20' },
  { role: 'Supervisor', icon: HardHat, color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20' },
  { role: 'Client', icon: Building2, color: 'bg-orange-500/15 text-orange-600 border-orange-500/20' },
  { role: 'Accountant', icon: BarChart3, color: 'bg-purple-500/15 text-purple-600 border-purple-500/20' },
]

const overlayFeatures = [
  { icon: Building2, label: 'Project Management' },
  { icon: Wrench, label: 'Maintenance Management' },
  { icon: Construction, label: 'Facility Management' },
  { icon: Users, label: 'Resource Management' },
]

// ═══════════════════════════════════════════════════════════════════
// অ্যানিমেশন ভ্যারিয়্যান্টসমূহ
// ═══════════════════════════════════════════════════════════════════

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
}

const dialogVariants = {
  initial: { opacity: 0, scale: 0.85, y: 40, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 30,
    filter: 'blur(4px)',
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.15,
    },
  },
}

const staggerItem = {
  initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

const tabContentVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(3px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(3px)',
    transition: { duration: 0.2 },
  },
}

// ═══════════════════════════════════════════════════════════════════
// লগইন ডায়ালগ
// ═══════════════════════════════════════════════════════════════════

export function LoginDialog() {
  const { showLoginDialog, setShowLoginDialog, setToken, setUser, navigate } = useAppStore()
  const { getCallingCode, getPhonePlaceholder } = useFormat()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ট্যাব অবস্থা: 'email' অথবা 'whatsapp'
  const [loginTab, setLoginTab] = useState<'email' | 'whatsapp'>('email')

  // WhatsApp OTP অবস্থা
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [otpError, setOtpError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      const res = await api.post('/api/auth/login', data)
      if (res.success && res.data) {
        setToken(res.data.token)
        setUser(res.data.user)
        setShowLoginDialog(false)
        toast.success('Welcome back!', {
          description: `Logged in as ${res.data.user?.name || res.data.user?.email}`,
        })
        const roleHome = getRoleBasedHomePage(res.data.user?.role || 'labour')
        navigate(roleHome)
      } else {
        toast.error('Login failed', {
          description: res.error || 'Invalid email or password',
        })
      }
    } catch {
      toast.error('Login failed', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
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
    <AnimatePresence>
      {showLoginDialog && (
        <>
          {/* ব্যাকড্রপ */}
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLoginDialog(false)}
          />

          {/* ডায়ালগ কন্টেইনার */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              variants={dialogVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative w-full max-w-[820px] rounded-3xl overflow-hidden"
              style={{
                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.1), 0 0 100px -20px rgba(245, 158, 11, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ═══ গ্লাস ইফেক্ট বেস ═══ */}
              <div className="absolute inset-0 bg-white/[0.98] backdrop-blur-2xl" />

              {/* ═══════════════════════════════════════════════
                  বাম প্যানেল — ব্র্যান্ডেড তথ্য প্যানেল
              ═══════════════════════════════════════════════ */}
              <div
                className="absolute inset-y-0 left-0 w-[42%] z-10 hidden md:block"
                style={{
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                }}
              >
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

                {/* ভাসমান আকৃতিসমূহ */}
                <motion.div
                  className="absolute w-28 h-28 rounded-full bg-white/[0.04] blur-sm"
                  style={{ top: '8%', right: '8%' }}
                  animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute w-20 h-20 rounded-full bg-amber-500/[0.06]"
                  style={{ bottom: '12%', left: '12%' }}
                  animate={{ y: [0, 12, 0], scale: [1, 0.9, 1] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />

                {/* রেডিয়াল ঝলক */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-amber-500/[0.08] rounded-full blur-[80px] pointer-events-none" />

                {/* বিষয়বস্তু */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-5"
                  >
                    <motion.div
                      className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 mb-3 mx-auto"
                      animate={{ rotate: [0, 2, -2, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <SquareIcon className="w-7 h-7 text-white fill-white" strokeWidth={0} />
                    </motion.div>
                    <h3 className="text-xl font-extrabold text-white">SmartBuild</h3>
                    <p className="text-white/40 text-[9px] font-medium tracking-[0.25em] uppercase">Construction ERP</p>
                  </motion.div>

                  <motion.h4
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg font-bold text-white mb-2"
                  >
                    Welcome Back
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="text-white/60 text-xs leading-relaxed mb-6"
                  >
                    Sign in to manage your projects, maintenance, and operations
                  </motion.p>

                  {/* বৈশিষ্ট্যসমূহ */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="space-y-2.5 w-full max-w-[180px]"
                  >
                    {overlayFeatures.map((feat, i) => {
                      const Icon = feat.icon
                      return (
                        <motion.div
                          key={feat.label}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                          className="flex items-center gap-2.5 text-white/70 text-xs"
                        >
                          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{feat.label}</span>
                        </motion.div>
                      )
                    })}
                  </motion.div>

                  {/* ভূমিকা ব্যাজসমূহ */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="mt-6 pt-4 border-t border-white/10 w-full"
                  >
                    <p className="text-[10px] text-white/30 text-center mb-2.5">Role-based access</p>
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      {roleBadges.map(({ role, icon: Icon }) => (
                        <div
                          key={role}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/60 border border-white/10"
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {role}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════
                  ডান প্যানেল — লগইন ফর্ম
              ═══════════════════════════════════════════════ */}
              <div className="relative z-10 md:pl-[42%]">
                {/* বন্ধ বাটন */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  onClick={() => setShowLoginDialog(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors z-20"
                >
                  <X className="w-4 h-4" />
                </motion.button>

                {/* ফর্ম বিষয়বস্তু */}
                <div className="p-6 sm:p-8">
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-1"
                  >
                    {/* লোগো (শুধুমাত্র মোবাইলে) */}
                    <motion.div className="flex items-center gap-2.5 mb-4 md:hidden" variants={staggerItem}>
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <SquareIcon className="w-4.5 h-4.5 text-white fill-white" strokeWidth={0} />
                      </div>
                      <div>
                        <span className="text-base font-extrabold tracking-tight text-slate-900">SmartBuild</span>
                        <span className="block text-[8px] font-medium tracking-[0.2em] uppercase text-amber-600">Construction ERP</span>
                      </div>
                    </motion.div>

                    {/* শিরোনাম */}
                    <motion.h2 className="text-xl font-bold text-slate-900" variants={staggerItem}>
                      Welcome to SmartBuild
                    </motion.h2>
                    <motion.p className="text-sm text-slate-500 mb-4" variants={staggerItem}>
                      Sign in to access your construction workspace
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
                  </motion.div>

                  <AnimatePresence mode="wait">
                    {loginTab === 'email' ? (
                      <motion.form
                        key="email-tab"
                        onSubmit={handleSubmit(onSubmit)}
                        variants={tabContentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-4"
                        noValidate
                      >
                        {/* ইমেইল */}
                        <div className="space-y-1.5">
                          <Label htmlFor="dialog-email" className="text-sm font-medium text-slate-700">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                              id="dialog-email"
                              type="email"
                              placeholder="admin@smartbuild.com"
                              autoComplete="email"
                              disabled={isSubmitting}
                              className={`h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all duration-300 ${
                                errors.email
                                  ? 'border-red-400 focus-visible:ring-red-200 bg-red-50/50'
                                  : 'focus-visible:border-amber-400 focus-visible:ring-amber-400/20 focus:bg-white'
                              }`}
                              {...register('email')}
                            />
                          </div>
                          {errors.email && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-xs mt-1"
                            >
                              {errors.email.message}
                            </motion.p>
                          )}
                        </div>

                        {/* পাসওয়ার্ড */}
                        <div className="space-y-1.5">
                          <Label htmlFor="dialog-password" className="text-sm font-medium text-slate-700">
                            Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                              id="dialog-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={isSubmitting}
                              className={`h-11 pl-11 pr-11 rounded-xl border-slate-200 bg-slate-50/50 transition-all duration-300 ${
                                errors.password
                                  ? 'border-red-400 focus-visible:ring-red-200 bg-red-50/50'
                                  : 'focus-visible:border-amber-400 focus-visible:ring-amber-400/20 focus:bg-white'
                              }`}
                              {...register('password')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              tabIndex={-1}
                            >
                              <motion.div whileTap={{ scale: 0.85 }}>
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </motion.div>
                            </button>
                          </div>
                          {errors.password && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-xs mt-1"
                            >
                              {errors.password.message}
                            </motion.p>
                          )}
                        </div>

                        {/* জমা দিন */}
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-[15px]"
                          >
                            {isSubmitting ? (
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
                        key="whatsapp-tab"
                        variants={tabContentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="space-y-4"
                      >
                        {otpError && (
                          <motion.div
                            initial={{ opacity: 0, y: -5, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
                          >
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                              <span className="text-red-500 text-xs font-bold">!</span>
                            </div>
                            {otpError}
                          </motion.div>
                        )}

                        {!otpSent ? (
                          <>
                            <div className="space-y-1.5">
                              <Label htmlFor="dialog-phone" className="text-sm font-medium text-slate-700">
                                Phone Number
                              </Label>
                              <div className="flex gap-2">
                                <div className="flex items-center gap-1.5 px-3 h-11 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-600 shrink-0 font-medium">
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  <span>{getCallingCode()}</span>
                                </div>
                                <Input
                                  id="dialog-phone"
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
                        className="w-full h-10 gap-2 font-medium text-sm rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        type="button"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                        className="w-full h-10 gap-2 font-medium text-sm rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        type="button"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                          <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                          <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                          <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                        </svg>
                        Microsoft
                      </Button>
                    </motion.div>
                  </div>

                  {/* ফুটার */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-[11px] text-slate-400 text-center mt-5"
                  >
                    Secure enterprise access. Contact your administrator for credentials.
                  </motion.p>
                </div>
              </div>

              {/* ═══ কার্ড বর্ডার ═══ */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none z-40">
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/[0.06]" />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
