'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-hero-gradient text-white"
      aria-label="Hero section"
    >
      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Floating geometric shapes — CSS only */}
      <div aria-hidden="true" className="pointer-events-none">
        <div
          className="absolute -top-24 -left-24 h-48 w-48 rounded-2xl border border-white/[0.06] rotate-12 animate-[spin_20s_linear_infinite]"
          style={{ animation: 'spin 20s linear infinite' }}
        />
        <div
          className="absolute top-1/4 -right-16 h-32 w-32 rounded-full border border-white/[0.06]"
          style={{ animation: 'float 6s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute bottom-1/3 -left-16 h-24 w-24 rounded-lg border border-white/[0.06] rotate-45"
          style={{ animation: 'float 8s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute top-1/3 right-1/4 h-20 w-20 rounded-full border border-brand-orange/20"
          style={{ animation: 'float 7s ease-in-out infinite alternate' }}
        />
      </div>

      {/* Inline keyframes for floating shapes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        @keyframes float {
          0%, 100% { transform: translateY(0px) }
          50% { transform: translateY(-20px) }
        }
      `}</style>

      <div className="container-landing relative z-10 flex flex-col items-center text-center py-24 md:py-32 lg:py-40 px-4 sm:px-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 px-4 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-orange bg-brand-orange/10 backdrop-blur-sm">
            Enterprise Construction Management
          </span>
        </motion.div>

        {/* Main heading */
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-balance max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Build{' '}
          <span className="text-gradient">Smarter</span>
          {' '}Deliver{' '}
          <span>Faster.</span>
          {' '}Scale{' '}
          <span>Infiniterly.</span>
        </motion.h1>

        {/* Subheading */
        <motion.p
          className="mt-6 max-w-2xl text-base sm:text-lg text-white/80 font-body leading-relaxed text-balance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          The all-in-one enterprise platform for construction project management. From planning to closeout,
          SmartBuild gives you full control over every project, every team, every dollar.
        </motion.p>

        {/* CTA buttons */
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button
            size="lg"
            asChild
            href="#trial"
            className="group bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold text-base px-6 h-12 sm:px-8 glow-orange transition-all duration-300"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            asChild
            href="#demo"
            variant="outline"
            className="group text-white border-white/20 hover:border-white/40 hover:bg-white/10 font-semibold text-base px-6 h-12 sm:px-8 transition-all duration-300"
            aria-label="Watch demo video"
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </motion.div>

        {/* Trust bar */
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 text-sm text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-white/90">2,500+</span>
            <span className="text-white/40">projects delivered</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-white/30" aria-hidden="true">
            <span className="w-px h-px bg-white/30" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-white/90">98%</span>
            <span className="text-white/40">on-time delivery</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-white/30" aria-hidden="true">
            <span className="w-px h-px bg-white/30" />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-white/90">150M+</span>
            <span className="text-white/40">managed</span>
          </span>
        </motion.div>
      </div>

      {/* Bottom fade gradient */
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-transparent to-brand-navy-dark/50"
        aria-hidden="true"
      />
    </section>
  )
}
