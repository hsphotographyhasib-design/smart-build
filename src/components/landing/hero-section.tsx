'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, TrendingUp, Users, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, slideInLeft, slideInRight, float, floatSlow, floatDelayed, viewportConfig } from './motion';
import type { HeroConfig } from './types';

interface HeroSectionProps {
  config: HeroConfig;
}

export function HeroSection({ config }: HeroSectionProps) {
  const stats = config.stats?.length
    ? config.stats
    : [
        { label: 'Active Projects', value: '2,400+' },
        { label: 'Teams Managed', value: '850+' },
        { label: 'On-Time Delivery', value: '97%' },
      ];

  return (
    <section className="relative min-h-screen flex items-center bg-brand-hero overflow-hidden pt-16 lg:pt-[72px]" aria-label="Hero">
      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(245,166,35,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gold/[0.03] rounded-full blur-3xl" />

      <div className="container-brand relative z-10 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="space-y-6 lg:space-y-8"
          >
            {/* Badge */}
            <Badge
              variant="outline"
              className="border-brand-gold/40 text-brand-gold bg-brand-gold/10 px-4 py-1.5 text-sm font-medium rounded-full"
            >
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse mr-2" />
              {config.badge || 'Enterprise Construction Platform'}
            </Badge>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              {config.headline || (
                <>
                  Build Smarter.{ ' ' }
                  <span className="text-gradient">Deliver Faster.</span>
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-white/70 max-w-xl leading-relaxed font-body">
              {config.subheadline ||
                'The all-in-one enterprise project management platform for construction companies. Plan, execute, and monitor every project from a single command center.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-brand-gold hover:bg-brand-gold-light text-brand-navy font-semibold text-base px-8 h-12 rounded-lg"
                aria-label={config.primaryCta || 'Start Free Trial'}
              >
                {config.primaryCta || 'Start Free Trial'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:text-white text-base px-8 h-12 rounded-lg"
                aria-label={config.secondaryCta || 'Watch Demo'}
              >
                <Play className="mr-2 w-4 h-4" />
                {config.secondaryCta || 'Watch Demo'}
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.6 + idx * 0.1 }}
                >
                  <p className="text-2xl lg:text-3xl font-heading font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/50 font-body">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Animated Dashboard Mockup */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:block"
          >
            <div className="relative w-full max-w-[540px] ml-auto">
              {/* Main Dashboard Card */}
              <motion.div
                className="glass rounded-2xl p-6 space-y-4"
                variants={float}
                animate="animate"
              >
                {/* Dashboard header bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs font-body">Dashboard Overview</p>
                    <p className="text-white font-heading font-semibold text-lg">Project Status</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-white/40" />
                    <div className="relative">
                      <Bell className="w-4 h-4 text-brand-gold" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-navy" />
                    </div>
                  </div>
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'On Track', value: '12', color: 'bg-emerald-500/20 text-emerald-400' },
                    { label: 'At Risk', value: '3', color: 'bg-brand-gold/20 text-brand-gold' },
                    { label: 'Completed', value: '47', color: 'bg-white/10 text-white/80' },
                  ].map((kpi) => (
                    <div key={kpi.label} className={`rounded-lg p-3 ${kpi.color.split(' ')[0]}`}>
                      <p className={`text-xl font-heading font-bold ${kpi.color.split(' ')[1]}`}>{kpi.value}</p>
                      <p className="text-xs text-white/40 font-body mt-0.5">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* Chart area placeholder */}
                <div className="rounded-lg bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white/60 text-xs font-body font-medium">Monthly Progress</p>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i === 11 ? '#F5A623' : 'rgba(255,255,255,0.15)',
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.8 + i * 0.05 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Mini project cards */}
                <div className="space-y-2">
                  {[
                    { name: 'Tower A - Phase 2', progress: 78, status: 'On Track' },
                    { name: 'Highway Bridge 7', progress: 45, status: 'At Risk' },
                  ].map((project) => (
                    <div key={project.name} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                      <div className="w-8 h-8 rounded bg-brand-gold/20 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-brand-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10">
                            <motion.div
                              className="h-full rounded-full bg-brand-gold"
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, delay: 1 }}
                            />
                          </div>
                          <span className="text-[10px] text-white/40 shrink-0">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Floating notification card */}
              <motion.div
                className="absolute -left-12 top-16 glass rounded-xl p-3 w-52 shadow-xl"
                variants={floatSlow}
                animate="animate"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">Milestone Complete</p>
                    <p className="text-white/40 text-[10px] font-body">Foundation work — Tower B</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating team card */}
              <motion.div
                className="absolute -right-8 bottom-24 glass rounded-xl p-3 w-48 shadow-xl"
                variants={floatDelayed}
                animate="animate"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-brand-navy flex items-center justify-center text-[8px] font-bold text-white"
                        style={{
                          background: ['#F5A623', '#0B2345', '#059669'][i],
                        }}
                      >
                        <Users className="w-3 h-3" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">8 Active Teams</p>
                    <p className="text-white/40 text-[10px] font-body">32 members online</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
