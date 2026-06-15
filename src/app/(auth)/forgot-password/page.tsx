'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Loader2, CheckCircle2, SquareIcon, ArrowLeft } from 'lucide-react'
import { PremiumStandaloneCard } from '@/components/auth/premium-standalone-card'
import Link from 'next/link'

function ForgotPasswordContent() {
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
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Forgot Password?</h2>
      <p className="text-sm text-slate-500 mb-6">
        Enter your email and we&apos;ll send you a reset link
      </p>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
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

          <div className="text-center py-2">
            <p className="text-sm text-slate-500">
              Didn&apos;t receive the email?{' '}
              <button
                onClick={() => { setSuccess(false); setEmail('') }}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer"
              >
                Try again
              </button>
            </p>
          </div>

          <Link href="/login">
            <Button className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
              Return to Sign In
            </Button>
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Email field */}
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                required
                className="h-11 pl-11 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-colors focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
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
        </form>
      )}
    </motion.div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <PremiumStandaloneCard
      panelTitle="Need Help?"
      panelDescription="Don't worry, it happens to the best of us. Reset your password and get back to building."
      backHref="/login"
    >
      <ForgotPasswordContent />
    </PremiumStandaloneCard>
  )
}
