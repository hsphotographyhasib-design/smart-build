'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Loader2, CheckCircle2, SquareIcon, ArrowLeft } from 'lucide-react'
import { PremiumStandaloneCard } from '@/components/auth/premium-standalone-card'
import Link from 'next/link'

function VerifyOTPContent() {
  const [otpValue, setOtpValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const [success, setSuccess] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleVerify = () => {
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    // Mock success
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }, 1500)
  }

  const handleResend = () => {
    setResendTimer(60)
    setOtpValue('')
    setError('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo (mobile) */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <SquareIcon className="w-5 h-5 text-white fill-white" strokeWidth={0} />
        </div>
        <div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">SmartBuild</span>
          <span className="block text-[9px] font-medium tracking-[0.2em] uppercase text-amber-600">Construction ERP</span>
        </div>
      </div>

      {/* Back link (mobile) */}
      <div className="lg:hidden mb-5">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Sign In
        </Link>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Verify Your Identity</h2>
      <p className="text-sm text-slate-500 mb-6">
        Enter the 6-digit code sent to your device
      </p>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center py-8"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-lg font-semibold text-slate-900 mb-1">Verified!</p>
          <p className="text-sm text-slate-500">Redirecting you to the dashboard...</p>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
              {error}
            </motion.div>
          )}

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
              <div className="w-3 flex items-center justify-center text-slate-300 text-xl font-bold">-</div>
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
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Verify Code
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </Button>

          {/* Resend */}
          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-slate-500">
                Resend code in <span className="font-semibold text-amber-600">{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer"
              >
                Resend Code
              </button>
            )}
          </div>

          {/* Different method link */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Use a different method
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default function VerifyOTPPage() {
  return (
    <PremiumStandaloneCard
      panelTitle="Stay Secure"
      panelDescription="Verify your identity with a one-time code sent to your device."
      backHref="/login"
    >
      <VerifyOTPContent />
    </PremiumStandaloneCard>
  )
}
