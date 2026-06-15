'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react'

const fieldVariants = {
  initial: { opacity: 0, y: 15 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.15 + i * 0.06 },
  }),
}

function getPasswordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++

  if (score <= 1) return { label: 'Weak', color: 'bg-red-400', textColor: 'text-red-600', width: 'w-1/4' }
  if (score <= 2) return { label: 'Fair', color: 'bg-amber-400', textColor: 'text-amber-600', width: 'w-2/4' }
  if (score <= 3) return { label: 'Good', color: 'bg-orange-400', textColor: 'text-orange-600', width: 'w-3/4' }
  return { label: 'Strong', color: 'bg-emerald-400', textColor: 'text-emerald-600', width: 'w-full' }
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

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, confirmPassword }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set New Password</h1>
        <p className="text-sm text-gray-500">Enter your new password below</p>
      </motion.div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm w-full">
              <p className="font-semibold mb-1 text-center">Password Reset Successfully</p>
              <p className="text-emerald-600 text-center">
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>
          </div>

          <Link href="/login">
            <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
              <span className="flex items-center gap-2">
                Go to Login
              </span>
            </Button>
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* New Password */}
          <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError('') }}
                required
                className="h-12 pl-11 pr-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Password strength indicator */}
            {newPassword.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5 pt-1"
              >
                <div className="flex gap-1 h-1.5">
                  <div className="flex-1 h-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all duration-300 ${strength.width}`} />
                  </div>
                </div>
                <p className={`text-xs font-medium ${strength.textColor}`}>
                  Password strength: {strength.label}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Confirm Password */}
          <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
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

          {/* Submit button */}
          <motion.div custom={4} variants={fieldVariants} initial="initial" animate="animate">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting Password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Reset Password
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