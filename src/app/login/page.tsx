'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, KeyRound, Building2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [from, setFrom] = useState('/app')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const f = params.get('from')
    if (f && f.startsWith('/') && f !== '/login') setFrom(f)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Authentication failed'); return }
      toast.success('Welcome back!')
      window.location.assign(data.redirect || from || '/app')
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className='min-h-screen w-full overflow-hidden bg-[#F8FAFC]'>
      <div className='absolute inset-0 bg-navy-gradient' />
      <div className='absolute inset-0 opacity-20 [background:radial-gradient(circle_at_25%_25%,rgba(245,166,35,0.3),transparent_50%),radial-gradient(circle_at_75%_70%,rgba(245,166,35,0.15),transparent_55%)]' />

      <div className='relative grid min-h-screen w-full lg:grid-cols-2'>
        {/* Left Brand Panel */}
        <div className='hidden lg:flex lg:flex-col lg:justify-between lg:p-12'>
          <div className='relative flex items-center gap-3'>
            <Image src='/brand/smartbuild-app-dark.svg' alt='SmartBuild' width={44} height={44} className='h-11 w-11' />
            <div>
              <div className='text-lg font-bold tracking-tight text-white font-heading'>SmartBuild</div>
              <div className='text-[11px] text-white/60 font-body'>Enterprise Multi-Tenant SaaS Platform</div>
            </div>
          </div>
          <div className='relative space-y-6'>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Image src='/brand/smartbuild-primary-logo.svg' alt='SmartBuild' width={360} height={180} className='h-36 w-auto object-contain' />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className='max-w-md text-3xl font-bold leading-tight text-white font-heading'>
              Enterprise construction management. Multi-tenant. SaaS-ready.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className='max-w-sm text-sm text-slate-300 font-body'>
              Manage multiple companies, each with isolated data, branding, permissions, and subscriptions. Built for the enterprise.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className='flex flex-wrap gap-4 pt-2 text-xs text-white/70 font-body'>
              <span className='inline-flex items-center gap-1.5'><Building2 className='h-4 w-4 text-[#F5A623]' /> Multi-Tenant</span>
              <span className='inline-flex items-center gap-1.5'><ShieldCheck className='h-4 w-4 text-[#F5A623]' /> RBAC Permissions</span>
              <span className='inline-flex items-center gap-1.5'><KeyRound className='h-4 w-4 text-[#F5A623]' /> Data Isolation</span>
            </motion.div>
          </div>
          <div className='relative text-[11px] text-white/40 font-body'>© 2025 SmartBuild · Enterprise Multi-Tenant SaaS Platform v5.0.0</div>
        </div>

        {/* Right Auth Panel */}
        <div className='flex items-center justify-center p-6 lg:p-12'>
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
            className='relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-7 shadow-2xl backdrop-blur-xl lg:bg-white/10 lg:backdrop-blur-2xl'
          >
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#F5A623] via-[#F7B84E] to-[#F5A623]' />
            <div className='mb-6 flex flex-col items-center gap-3 lg:mb-8'>
              <div className='relative'>
                <Image src='/brand/smartbuild-app-dark.svg' alt='SmartBuild' width={72} height={72} className='h-18 w-18 drop-shadow-lg' />
                <div className='absolute -inset-2 rounded-full bg-[#F5A623]/10 blur-xl' />
              </div>
              <div className='text-center lg:hidden'>
                <div className='text-lg font-bold tracking-tight text-[#0B2345] font-heading'>SmartBuild</div>
                <div className='text-[11px] text-[#6B7280] font-body'>Enterprise Multi-Tenant SaaS Platform</div>
              </div>
            </div>
            <h2 className='text-xl font-bold tracking-tight text-[#0B2345] lg:text-white font-heading'>Welcome back</h2>
            <p className='mt-1 text-sm text-[#6B7280] lg:text-white/60 font-body'>Sign in to your workspace.</p>
            <form onSubmit={handleSubmit} className='mt-6 space-y-3.5'>
              <div className='space-y-1.5'>
                <Label htmlFor='email' className='text-xs font-body'>Email</Label>
                <div className='relative'>
                  <Mail className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]' />
                  <Input id='email' type='email' required value={email} onChange={e => setEmail(e.target.value)} placeholder='you@company.com' className='pl-9' autoComplete='email' />
                </div>
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='password' className='text-xs font-body'>Password</Label>
                <div className='relative'>
                  <Lock className='pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#6B7280]' />
                  <Input id='password' type='password' required value={password} onChange={e => setPassword(e.target.value)} placeholder='••••••••' className='pl-9' autoComplete='current-password' />
                </div>
              </div>
              <Button type='submit' disabled={loading} className='w-full gap-2 rounded-xl bg-[#0B2345] text-white hover:bg-[#132D52] font-body'>
                {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ArrowRight className='h-4 w-4' />} Sign in
              </Button>
            </form>
            <div className='mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 lg:border-white/10 lg:bg-white/5 lg:text-amber-200'>
              <p className='font-semibold mb-1'>Demo Accounts</p>
              <p className='text-[11px]'><strong>Super Admin:</strong> admin@smartbuild.app / admin123</p>
              <p className='text-[11px]'><strong>Tenant Admin:</strong> admin@hasanurjaya.com / tenant123</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
