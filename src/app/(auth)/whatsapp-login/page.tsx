'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useFormat } from '@/hooks/use-format'
import { useRegion } from '@/components/providers/regional-provider'
import { MessageSquare, Phone, Loader2, CheckCircle2, ShieldCheck, Mail } from 'lucide-react'

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

export default function WhatsAppLoginPage() {
  const router = useRouter()
  const { getCallingCode, getPhonePlaceholder } = useFormat()
  const { country } = useRegion()

  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpValue, setOtpValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (resendTimer > 0) {
      intervalRef.current = setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [resendTimer])

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number')
      return
    }
    setLoading(true)
    setError('')
    setTimeout(() => {
      setStep('otp')
      setLoading(false)
      setResendTimer(60)
    }, 1500)
  }

  const handleVerify = () => {
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }
    setLoading(true)
    setError('')
    // WhatsApp login is not yet implemented via real API — show coming soon message
    setTimeout(() => {
      setLoading(false)
      setError('WhatsApp OTP login is coming soon. Please use email login.')
    }, 1500)
  }

  const handleResend = () => {
    setResendTimer(60)
    setOtpValue('')
    setError('')
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setOtpValue('')
    setError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heading */}
      <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate" className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Login</h1>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Sign in with your WhatsApp number
        </p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 mb-5"
        >
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-red-500 text-xs font-bold">!</span>
          </div>
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.div
            key="phone-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Country & phone info */}
            <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate" className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">{country?.flagEmoji ?? '🇧🇳'}</span>
                <span className="font-medium text-gray-900">{country?.name ?? 'Brunei'}</span>
                <span className="text-gray-300">·</span>
                <span>{getCallingCode()}</span>
              </div>
            </motion.div>

            {/* Phone field */}
            <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
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
                  onChange={(e) => { setPhoneNumber(e.target.value); setError('') }}
                  className="flex-1 h-12 rounded-xl border-gray-200 bg-gray-50/50 focus:border-orange-400 focus:ring-orange-400/20 transition-colors"
                />
              </div>
            </motion.div>

            {/* Send Code button */}
            <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
              <Button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Code
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Phone info */}
            <div className="text-center space-y-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-sm text-gray-500">Enter the 6-digit code sent to</p>
              <p className="text-sm font-semibold text-gray-900">
                {getCallingCode()} {phoneNumber}
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={(val) => { setOtpValue(val); setError('') }}
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

            {/* Verify button */}
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
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

            {/* Resend / change number */}
            <div className="text-center space-y-2">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in{' '}
                  <span className="font-semibold text-orange-600">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  Resend Code
                </button>
              )}
              <div>
                <button
                  onClick={handleBackToPhone}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign in with email */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors group"
        >
          <Mail className="w-4 h-4" />
          Sign in with email instead
        </Link>
      </div>

      <AuthFooter />
    </motion.div>
  )
}