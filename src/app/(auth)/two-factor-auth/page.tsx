'use client'

import { useState } from 'react'
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
import { Loader2, CheckCircle2, KeyRound, SquareIcon, ArrowLeft } from 'lucide-react'
import { PremiumStandaloneCard } from '@/components/auth/premium-standalone-card'
import Link from 'next/link'

function TwoFactorContent() {
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
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
        </div>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Enter the code from your authenticator app
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
          <p className="text-lg font-semibold text-slate-900 mb-1">Verification Complete</p>
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

          <AnimatePresence mode="wait">
            {!showBackup ? (
              <motion.div
                key="authenticator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
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

                {/* Remember device */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={rememberDevice}
                    onCheckedChange={(v) => setRememberDevice(!!v)}
                    className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 rounded"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    Remember this device for 30 days
                  </span>
                </label>

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
                      Verify
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {/* Can't access authenticator */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setShowBackup(true); setError('') }}
                    className="text-sm text-slate-500 hover:text-amber-600 font-medium transition-colors cursor-pointer"
                  >
                    Can&apos;t access your authenticator?
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="backup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <p className="font-medium mb-1">Use a Backup Code</p>
                  <p className="text-amber-700">
                    Enter one of the backup codes you saved when setting up 2FA.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="backup-code" className="text-sm font-medium text-slate-700">
                    Backup Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <Input
                      id="backup-code"
                      type="text"
                      placeholder="XXXXX-XXXXX"
                      value={backupCode}
                      onChange={(e) => { setBackupCode(e.target.value); setError('') }}
                      className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors focus:border-amber-400 focus:ring-amber-400/20 font-mono tracking-wider"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBackupVerify}
                  disabled={backupLoading}
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
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
                    className="text-sm text-slate-500 hover:text-amber-600 font-medium transition-colors cursor-pointer"
                  >
                    ← Back to authenticator code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default function TwoFactorAuthPage() {
  return (
    <PremiumStandaloneCard
      panelTitle="Extra Security"
      panelDescription="Two-factor authentication keeps your account safe from unauthorized access."
      backHref="/login"
    >
      <TwoFactorContent />
    </PremiumStandaloneCard>
  )
}
