'use client'

import { useRegion } from '@/components/providers/regional-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { SquareIcon, ArrowRight, BarChart3, Users, Shield, Building2, HardHat } from 'lucide-react'

// ──────────── Floating shapes for left panel ────────────
const floatingShapes = [
  { size: 80, top: '10%', left: '60%', delay: 0, duration: 8 },
  { size: 60, top: '70%', left: '10%', delay: 1.5, duration: 10 },
  { size: 100, top: '40%', left: '75%', delay: 0.8, duration: 7 },
  { size: 50, top: '85%', left: '55%', delay: 2, duration: 9 },
  { size: 70, top: '20%', left: '15%', delay: 1, duration: 11 },
]

const statPills = [
  { label: 'Active Projects', value: '12,450+', icon: BarChart3 },
  { label: 'Team Members', value: '85,000+', icon: Users },
  { label: 'Countries', value: '13', icon: Shield },
]

// ──────────── Left panel content variants ────────────
const panelContent: Record<string, { title: string; description: string; cta: { label: string; href: string } }> = {
  login: {
    title: 'Welcome Back',
    description: 'Sign in to manage your construction projects, maintenance schedules, workforce allocation, and financial operations from one unified platform.',
    cta: { label: 'Create Account', href: '/register' },
  },
  register: {
    title: 'Get Started',
    description: 'Join construction teams already using SmartBuild to deliver projects faster and more profitably.',
    cta: { label: 'Sign In Instead', href: '/login' },
  },
  'forgot-password': {
    title: 'Need Help?',
    description: 'Don\'t worry, it happens to the best of us. Reset your password and get back to building.',
    cta: { label: 'Back to Sign In', href: '/login' },
  },
  'reset-password': {
    title: 'Almost There',
    description: 'Set your new password and regain access to your SmartBuild dashboard.',
    cta: { label: 'Back to Sign In', href: '/login' },
  },
  'verify-otp': {
    title: 'Stay Secure',
    description: 'Verify your identity with a one-time code sent to your device.',
    cta: { label: 'Back to Sign In', href: '/login' },
  },
  'two-factor-auth': {
    title: 'Extra Security',
    description: 'Two-factor authentication keeps your account safe from unauthorized access.',
    cta: { label: 'Back to Sign In', href: '/login' },
  },
  'whatsapp-login': {
    title: 'Quick Login',
    description: 'Use your WhatsApp number for a fast, password-free sign-in experience.',
    cta: { label: 'Use Email Instead', href: '/login' },
  },
  'invite-acceptance': {
    title: 'You\'re Invited',
    description: 'Accept your invitation and join your team on SmartBuild.',
    cta: { label: 'Sign In', href: '/login' },
  },
}

interface AuthLayoutShellProps {
  children: React.ReactNode
}

export function AuthLayoutShell({ children }: AuthLayoutShellProps) {
  const pathname = usePathname()
  const { country } = useRegion()

  // Auto-detect variant from pathname
  const segment = pathname?.replace(/^\//, '').split('/')[0] ?? 'login'
  const variant = segment === '' ? 'login' : segment
  const content = panelContent[variant] ?? panelContent.login

  return (
    <div className="min-h-screen flex">
      {/* ──── LEFT PANEL (Desktop only) ──── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-500 to-orange-700">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.2) 49px, rgba(255,255,255,0.2) 50px),
              repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.2) 49px, rgba(255,255,255,0.2) 50px)
            `,
          }}
        />

        {/* Floating shapes */}
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/[0.07]"
            style={{
              width: shape.size,
              height: shape.size,
              top: shape.top,
              left: shape.left,
            }}
            animate={{
              y: [0, -20, 0, 15, 0],
              x: [0, 10, 0, -8, 0],
              scale: [1, 1.05, 1, 0.95, 1],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: shape.delay,
            }}
          />
        ))}

        {/* Radial glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Construction-themed icons */}
        <div className="absolute top-16 right-16 opacity-20">
          <HardHat className="w-16 h-16 text-white" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20">
          <Building2 className="w-14 h-14 text-white" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="relative w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
              <SquareIcon className="w-7 h-7 text-white fill-white" strokeWidth={0} />
              <div className="absolute inset-0 rounded-xl bg-white/10" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold tracking-tight text-white">SMARTBUILD</span>
              <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-white/60">Construction ERP</span>
            </div>
          </div>

          {/* Dynamic heading */}
          <motion.h1
            key={variant + '-title'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4"
          >
            {content.title}
          </motion.h1>
          <motion.p
            key={variant + '-desc'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-white/80 max-w-md leading-relaxed mb-8"
          >
            {variant === 'register'
              ? `Join ${country?.flagEmoji ?? '🇧🇳'} ${country?.name ?? 'Brunei'} construction teams already using SmartBuild to deliver projects faster and more profitably.`
              : content.description}
          </motion.p>

          {/* CTA button */}
          <Link
            href={content.cta.href}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-white/95 transition-all duration-200 hover:-translate-y-0.5 w-fit group"
          >
            {content.cta.label}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Stat pills */}
          <div className="mt-12 flex flex-wrap gap-3">
            {statPills.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10"
                >
                  <Icon className="w-4 h-4 text-white/70" />
                  <div>
                    <div className="text-white font-bold text-sm">{stat.value}</div>
                    <div className="text-white/50 text-[10px]">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ──── RIGHT PANEL (Form area) ──── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 bg-white relative">
        {/* Subtle bg pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Subtle gradient accent in top-right */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-[100px] pointer-events-none opacity-50" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-50 rounded-full blur-[80px] pointer-events-none opacity-50" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile-only: Logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-md">
                <SquareIcon className="w-5 h-5 text-white fill-white" strokeWidth={0} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-gray-900">SMARTBUILD</span>
                <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-orange-500">Construction ERP</span>
              </div>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
