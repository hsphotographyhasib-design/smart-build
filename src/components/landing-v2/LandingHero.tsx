'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Shield, Zap, Globe } from 'lucide-react'

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative min-h-[100vh] flex items-center bg-hero-gradient overflow-hidden"
      aria-label="Hero"
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Decorative glow orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px]" aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[100px]" aria-hidden="true" />

      <div className="container-landing relative z-10 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-4 py-1.5 text-sm font-medium text-brand-orange-light">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Enterprise Construction Management
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-8 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Build{' '}
            <span className="text-gradient">Smarter.</span>
            <br className="hidden sm:block" />
            {' '}Deliver{' '}
            <span className="text-gradient">Faster.</span>
            <br className="hidden sm:block" />
            {' '}Scale{' '}
            <span className="text-gradient">Infinitely.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The all-in-one enterprise platform for construction project
            management. From planning to closeout, SmartBuild gives you
            full control over every project, every team, every dollar.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-semibold h-12 px-8 text-base"
              asChild
            >
              <a href="#contact">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white font-medium h-12 px-8 text-base"
              asChild
            >
              <a href="#platform">
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Watch Demo
              </a>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-brand-orange" aria-hidden="true" />
              SOC 2 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-brand-orange" aria-hidden="true" />
              Multi-Region Deploy
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-brand-orange" aria-hidden="true" />
              99.99% Uptime SLA
            </span>
          </motion.div>
        </div>

        {/* Hero visual - Platform mockup */}
        <motion.div
          className="mt-16 lg:mt-20 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/30">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="h-6 bg-white/5 rounded-md max-w-md mx-auto flex items-center justify-center text-xs text-slate-500">
                  app.smartbuild.io/dashboard
                </div>
              </div>
            </div>
            {/* Dashboard mockup content */}
            <div className="bg-[#0D1B30] p-4 lg:p-6">
              <div className="grid grid-cols-4 gap-3 lg:gap-4 mb-4">
                {[
                  { label: 'Active Projects', value: '142', color: 'bg-brand-orange' },
                  { label: 'On Schedule', value: '94%', color: 'bg-emerald-500' },
                  { label: 'Budget Variance', value: '-2.1%', color: 'bg-brand-blue' },
                  { label: 'Safety Incidents', value: '0', color: 'bg-emerald-500' },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg bg-white/5 p-3 lg:p-4">
                    <p className="text-[10px] lg:text-xs text-slate-500 mb-1">{kpi.label}</p>
                    <p className={`text-lg lg:text-2xl font-bold font-display ${kpi.color === 'bg-emerald-500' ? 'text-emerald-400' : kpi.color === 'bg-brand-blue' ? 'text-brand-blue-light' : 'text-brand-orange-light'}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="col-span-2 rounded-lg bg-white/5 p-3 lg:p-4 h-32 lg:h-40">
                  <p className="text-[10px] lg:text-xs text-slate-500 mb-3">Project Timeline — Gantt View</p>
                  <div className="space-y-2">
                    {['Foundation', 'Structural', 'MEP', 'Finishing'].map((task, i) => (
                      <div key={task} className="flex items-center gap-2">
                        <span className="text-[9px] lg:text-[10px] text-slate-400 w-16 lg:w-20 truncate">{task}</span>
                        <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${75 + i * 5}%`,
                              background: i % 2 === 0
                                ? 'linear-gradient(90deg, #E8600A, #FF7B2E)'
                                : 'linear-gradient(90deg, #2563EB, #3B82F6)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-white/5 p-3 lg:p-4 h-32 lg:h-40">
                  <p className="text-[10px] lg:text-xs text-slate-500 mb-3">Budget Distribution</p>
                  <div className="flex flex-col gap-2 mt-2">
                    {[
                      { label: 'Labor', pct: 45, color: 'bg-brand-orange' },
                      { label: 'Material', pct: 30, color: 'bg-brand-blue' },
                      { label: 'Equipment', pct: 15, color: 'bg-emerald-500' },
                      { label: 'Other', pct: 10, color: 'bg-slate-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[9px] lg:text-[10px] mb-0.5">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="text-slate-500">{item.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow under the mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-brand-orange/20 rounded-full blur-3xl" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  )
}
