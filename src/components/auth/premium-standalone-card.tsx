'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck, SquareIcon } from 'lucide-react'

const features = [
  'Project Management',
  'Maintenance Management',
  'Facility Management',
  'Resource Management',
]

// ═══════════════════════════════════════════════════════════════════
// INFO PANEL — Left side branded panel for standalone auth pages
// ═══════════════════════════════════════════════════════════════════

function InfoPanel({ title, description, backHref }: { title: string; description: string; backHref: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-10 xl:px-16 text-center overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px),
            repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.3) 39px, rgba(255,255,255,0.3) 40px)
          `,
        }}
      />

      {/* Decorative floating shapes */}
      <motion.div
        className="absolute w-36 h-36 rounded-full bg-white/[0.04] blur-sm"
        style={{ top: '8%', right: '10%' }}
        animate={{ y: [0, -18, 0], x: [0, 8, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-amber-500/[0.06] blur-sm"
        style={{ bottom: '15%', left: '10%' }}
        animate={{ y: [0, 14, 0], x: [0, -6, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-white/[0.05]"
        style={{ top: '55%', left: '45%' }}
        animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-amber-500/[0.08] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5"
        >
          <motion.div
            className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 mb-3 mx-auto"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SquareIcon className="w-7 h-7 text-white fill-white" strokeWidth={0} />
          </motion.div>
          <h3 className="text-xl font-extrabold text-white">SmartBuild</h3>
          <p className="text-white/40 text-[9px] font-medium tracking-[0.25em] uppercase">Construction ERP</p>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-2xl xl:text-3xl font-bold text-white mb-3"
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto mb-8"
        >
          {description}
        </motion.p>

        {/* Features */}
        <div className="space-y-3 mb-8 w-full max-w-[200px] mx-auto">
          {features.map((feat, i) => (
            <motion.div
              key={feat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.1, duration: 0.5 }}
              className="flex items-center gap-2.5 text-white/70 text-sm"
            >
              <motion.div
                className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400/70" />
              </motion.div>
              {feat}
            </motion.div>
          ))}
        </div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl border border-white/10 transition-all duration-200 backdrop-blur-sm"
          >
            Back to Sign In
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// AUTH FOOTER
// ═══════════════════════════════════════════════════════════════════

function AuthFooter() {
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Protected by SmartBuild Security</span>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
        <Link href="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms-of-service" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// PREMIUM STANDALONE CARD — For forgot-password, OTP, 2FA, etc.
// ═══════════════════════════════════════════════════════════════════

interface PremiumStandaloneCardProps {
  children: React.ReactNode
  panelTitle: string
  panelDescription: string
  backHref?: string
}

export function PremiumStandaloneCard({
  children,
  panelTitle,
  panelDescription,
  backHref = '/login',
}: PremiumStandaloneCardProps) {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 lg:py-0 relative">
      {/* Desktop: Split card */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[1000px] h-[650px] rounded-3xl overflow-hidden"
          style={{
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.06), 0 0 120px -20px rgba(245, 158, 11, 0.15)',
          }}
        >
          {/* Glass base */}
          <div className="absolute inset-0 bg-white/[0.97] backdrop-blur-2xl" />

          {/* LEFT: Info Panel */}
          <div
            className="absolute inset-y-0 left-0 w-[45%] z-10"
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            }}
          >
            <InfoPanel
              title={panelTitle}
              description={panelDescription}
              backHref={backHref}
            />
          </div>

          {/* RIGHT: Form */}
          <div className="absolute inset-y-0 right-0 w-[55%] z-10 flex items-center justify-center px-10 xl:px-14 overflow-hidden">
            <div className="w-full max-w-[380px]">
              <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {children}
              </motion.div>
              <AuthFooter />
            </div>
          </div>

          {/* Divider */}
          <div className="absolute inset-y-0 left-[45%] w-px bg-gradient-to-b from-transparent via-slate-300/30 to-transparent z-20 pointer-events-none" />

          {/* Card border */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none z-40">
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/20" />
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/[0.04]" />
          </div>

          {/* Ambient glow */}
          <div
            className="absolute -inset-4 rounded-[2rem] blur-2xl pointer-events-none opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)',
            }}
          />
        </motion.div>
      </div>

      {/* Mobile: Single card */}
      <div className="lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-100/80 p-6 sm:p-8"
          style={{
            boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.03), 0 0 80px -20px rgba(245, 158, 11, 0.12)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {children}
          </motion.div>
          <AuthFooter />
        </motion.div>
      </div>
    </div>
  )
}
