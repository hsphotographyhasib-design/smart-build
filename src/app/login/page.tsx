'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, User, Loader2, MessageCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const GOOGLE_ERRORS: Record<string, string> = {
  google_not_configured: 'Google sign-in isn’t configured yet. Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to .env.',
  google_denied: 'Google sign-in was cancelled.',
  google_state: 'Google sign-in failed a security check. Please try again.',
  google_token: 'Could not complete Google sign-in (token exchange failed).',
  google_profile: 'Could not read your Google profile.',
  google_error: 'Something went wrong with Google sign-in.',
  account_disabled: 'This account is disabled. Contact an administrator.',
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [from, setFrom] = useState('/app')

  // WhatsApp OTP dialog
  const [waOpen, setWaOpen] = useState(false)
  const [waStep, setWaStep] = useState<'phone' | 'code'>('phone')
  const [waPhone, setWaPhone] = useState('')
  const [waCode, setWaCode] = useState('')
  const [waLoading, setWaLoading] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) toast.error(GOOGLE_ERRORS[err] ?? 'Sign-in failed. Please try again.')
    const f = params.get('from')
    if (f && f.startsWith('/') && f !== '/login') setFrom(f)
  }, [])

  const goToApp = () => window.location.assign(from || '/app')

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signup' ? { name, email, password } : { email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong')
        return
      }
      toast.success(mode === 'signup' ? 'Account created — welcome!' : 'Signed in')
      goToApp()
    } catch {
      toast.error('Network error. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault()
    setWaLoading(true)
    setDevCode(null)
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Could not send code')
        return
      }
      setWaStep('code')
      if (data.devCode) {
        setDevCode(data.devCode)
        toast.message('Dev mode', { description: `Your code is ${data.devCode}` })
      } else {
        toast.success('Code sent to your WhatsApp')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setWaLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setWaLoading(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone, code: waCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Invalid code')
        return
      }
      toast.success('Signed in')
      goToApp()
    } catch {
      toast.error('Network error')
    } finally {
      setWaLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,theme(colors.emerald.400),transparent_40%),radial-gradient(circle_at_80%_60%,theme(colors.emerald.600),transparent_45%)]" />
        <div className="relative flex items-center gap-2.5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/90 shadow-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight">HJSB EPPM</div>
            <div className="text-[11px] text-emerald-200/80">Enterprise Project Portfolio Management</div>
          </div>
        </div>
        <div className="relative space-y-5 text-white">
          <h1 className="max-w-md text-3xl font-bold leading-tight">
            Plan, control and deliver your entire construction portfolio.
          </h1>
          <p className="max-w-sm text-sm text-slate-300">
            Primavera P6-class scheduling, earned-value, risk and cost management — in one enterprise workspace.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-emerald-200/90">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Role-based access</span>
            <span className="inline-flex items-center gap-1.5"><KeyRound className="h-4 w-4" /> Encrypted sessions</span>
          </div>
        </div>
        <div className="relative text-[11px] text-slate-400">© 2025 HJSB EPPM · Project Portfolio Management v4.2.1</div>
      </div>

      {/* Auth panel */}
      <div className="flex items-center justify-center bg-muted/20 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm rounded-2xl border bg-background p-7 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <span className="font-bold">HJSB EPPM</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'signup'
              ? 'Sign up to get started — new accounts start as Customer.'
              : 'Sign in to your HJSB EPPM workspace.'}
          </p>

          {/* Social / WhatsApp */}
          <div className="mt-6 space-y-2.5">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl"
              onClick={() => (window.location.href = '/api/auth/google')}
            >
              <GoogleIcon /> Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              onClick={() => { setWaStep('phone'); setWaCode(''); setDevCode(null); setWaOpen(true) }}
            >
              <MessageCircle className="h-4 w-4" /> Continue with WhatsApp
            </Button>
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or with email <span className="h-px flex-1 bg-border" />
          </div>

          {/* Email / password */}
          <form onSubmit={submitEmail} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="pl-9" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="pl-9" autoComplete="email" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'} className="pl-9" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2 rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {mode === 'signup' ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? 'Already have an account?' : 'New to HJSB EPPM?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="font-semibold text-primary hover:underline"
            >
              {mode === 'signup' ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* WhatsApp OTP dialog */}
      <Dialog open={waOpen} onOpenChange={setWaOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-600" /> WhatsApp sign-in
            </DialogTitle>
            <DialogDescription>
              {waStep === 'phone'
                ? 'Enter your WhatsApp number and we’ll send you a one-time code.'
                : `Enter the 6-digit code sent to ${waPhone}.`}
            </DialogDescription>
          </DialogHeader>

          {waStep === 'phone' ? (
            <form onSubmit={requestOtp} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="wa-phone" className="text-xs">Phone number</Label>
                <Input id="wa-phone" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} placeholder="+1 555 123 4567" inputMode="tel" required />
                <p className="text-[11px] text-muted-foreground">Include your country code (e.g. +1, +44, +880).</p>
              </div>
              <Button type="submit" disabled={waLoading} className="w-full gap-2 rounded-xl">
                {waLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                Send code
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-3">
              {devCode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                  Dev mode — your code is <span className="font-bold tracking-widest">{devCode}</span>
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="wa-code" className="text-xs">Verification code</Label>
                <Input id="wa-code" value={waCode} onChange={(e) => setWaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" className="text-center text-lg tracking-[0.4em]" required />
              </div>
              <Button type="submit" disabled={waLoading || waCode.length !== 6} className="w-full gap-2 rounded-xl">
                {waLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify & continue
              </Button>
              <button type="button" onClick={() => setWaStep('phone')} className={cn('w-full text-center text-xs text-muted-foreground hover:text-foreground')}>
                ← Use a different number
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


