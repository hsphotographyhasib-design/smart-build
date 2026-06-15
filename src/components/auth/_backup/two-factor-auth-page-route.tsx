'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, KeyRound } from 'lucide-react'

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

export default function TwoFactorAuthPage() {
  const router = useRouter()
  const [otpValue, setOtpValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberDevice, setRememberDevice] = useState(false)
  const [showBackup, setShowBackup] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const [backupLoading, setBackupLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

  const handleBackupVerify = () => {
    if (!backupCode.trim()) {
      setError('Please enter your backup code')
      return
    }

    setBackupLoading(true)
    setError('')

    // Mock success
    setTimeout(() => {
      setBackupLoading(false)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }, 1500)
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Enter the code from your authenticator app
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
          <p className="text-lg font-semibold text-gray-900 mb-1">Verification Complete</p>
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

          <AnimatePresence mode="wait">
            {!showBackup ? (
              <motion.div
                key="authenticator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
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

                {/* Remember device */}
                <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <Checkbox
                      checked={rememberDevice}
                      onCheckedChange={(v) => setRememberDevice(!!v)}
                      className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      Remember this device for 30 days
                    </span>
                  </label>
                </motion.div>

                {/* Verify button */}
                <motion.div custom={4} variants={fieldVariants} initial="initial" animate="animate">
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
                        Verify
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>

                {/* Can't access authenticator */}
                <motion.div custom={5} variants={fieldVariants} initial="initial" animate="animate" className="text-center">
                  <button
                    type="button"
                    onClick={() => { setShowBackup(true); setError('') }}
                    className="text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    Can&apos;t access your authenticator?
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <p className="font-medium mb-1">Use a Backup Code</p>
                  <p className="text-amber-700">
                    Enter one of the backup codes you saved when setting up 2FA.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="backup-code" className="text-sm font-medium text-gray-700">
                    Backup Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="backup-code"
                      type="text"
                      placeholder="XXXXX-XXXXX"
                      value={backupCode}
                      onChange={(e) => { setBackupCode(e.target.value); setError('') }}
                      className="h-12 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20 font-mono tracking-wider"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBackupVerify}
                  disabled={backupLoading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {backupLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Backup Code
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setShowBackup(false); setError('') }}
                    className="text-sm text-gray-500 hover:text-orange-600 font-medium transition-colors"
                  >
                    ← Back to authenticator code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AuthFooter />
    </motion.div>
  )
}