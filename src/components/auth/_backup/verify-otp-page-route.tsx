'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

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

export default function VerifyOTPPage() {
  const router = useRouter()
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back link */}
      <motion.div custom={0} variants={fieldVariants} initial="initial" animate="animate" className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Sign In
        </Link>
      </motion.div>

      {/* Heading */}
      <motion.div custom={1} variants={fieldVariants} initial="initial" animate="animate" className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify Your Identity</h1>
        <p className="text-sm text-gray-500">
          Enter the 6-digit code sent to your device
        </p>
      </motion.div>

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
          <p className="text-lg font-semibold text-gray-900 mb-1">Verified!</p>
          <p className="text-sm text-gray-500">Redirecting you to the dashboard...</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
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

          {/* OTP Input */}
          <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="space-y-2">
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
          </motion.div>

          {/* Verify button */}
          <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
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
                  Verify Code
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </Button>
          </motion.div>

          {/* Resend */}
          <motion.div custom={4} variants={fieldVariants} initial="initial" animate="animate" className="text-center">
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
          </motion.div>

          {/* Different method link */}
          <motion.div custom={5} variants={fieldVariants} initial="initial" animate="animate" className="text-center pt-2">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Use a different method
            </Link>
          </motion.div>
        </div>
      )}

      <AuthFooter />
    </motion.div>
  )
}