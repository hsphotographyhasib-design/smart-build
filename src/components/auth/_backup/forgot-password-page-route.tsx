'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
        <p className="text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </motion.div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" />
              <div>
                <p className="font-semibold mb-1">Check your email</p>
                <p className="text-emerald-600">
                  We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>. 
                  Please check your inbox and follow the instructions.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-3">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email?{' '}
              <button
                onClick={() => { setSuccess(false); setEmail('') }}
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Try again
              </button>
            </p>
          </div>

          <Link href="/login">
            <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
              <span className="flex items-center gap-2">
                Return to Sign In
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

          {/* Email field */}
          <motion.div custom={2} variants={fieldVariants} initial="initial" animate="animate" className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                required
                className="h-12 pl-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-colors focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>
          </motion.div>

          {/* Submit button */}
          <motion.div custom={3} variants={fieldVariants} initial="initial" animate="animate">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Reset Link...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Reset Link
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