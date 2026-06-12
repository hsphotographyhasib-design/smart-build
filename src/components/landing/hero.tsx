'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  FolderKanban,
  DollarSign,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* ───────────────── floating background shapes ───────────────── */
const floatingShapes = [
  { size: 12, top: '15%', left: '10%', delay: 0, duration: 7, type: 'circle' },
  { size: 8, top: '25%', left: '85%', delay: 1.2, duration: 8, type: 'square' },
  { size: 16, top: '60%', left: '5%', delay: 0.5, duration: 9, type: 'circle' },
  { size: 10, top: '70%', left: '90%', delay: 2, duration: 6, type: 'square' },
  { size: 6, top: '40%', left: '30%', delay: 1.5, duration: 10, type: 'circle' },
  { size: 14, top: '80%', left: '20%', delay: 0.8, duration: 7.5, type: 'square' },
  { size: 8, top: '10%', left: '60%', delay: 2.5, duration: 8.5, type: 'circle' },
  { size: 10, top: '50%', left: '75%', delay: 1.8, duration: 9.5, type: 'square' },
]

/* ───────────────── count-up component ───────────────── */
function CountUpStat({
  target,
  suffix,
  label,
  duration = 2000,
}: {
  target: number
  suffix: string
  label: string
  duration?: number
}) {
  const [display, setDisplay] = useState('0')
  const [started, setStarted] = useState(false)

  const start = useCallback(() => {
    if (started) return
    setStarted(true)
  }, [started])

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target % 1 === 0 ? Math.round(eased * target) : parseFloat((eased * target).toFixed(1))
      setDisplay(current.toLocaleString() + suffix)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, target, suffix, duration])

  return (
    <motion.div
      onViewportEnter={start}
      viewport={{ once: true, amount: 0.3 }}
      className="text-center lg:text-left"
    >
      <p className="text-2xl sm:text-3xl font-bold text-white">{display}</p>
      <p className="text-xs sm:text-sm text-blue-300/60 font-medium mt-1">{label}</p>
    </motion.div>
  )
}

/* ───────────────── dashboard stat card ───────────────── */
function DashStatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + delay * 0.1, duration: 0.5, ease: 'easeOut' }}
      className="bg-white/[0.08] backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-white/20 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[11px] text-blue-200/70 font-medium">{label}</span>
      </div>
      <p className="text-white text-xl font-bold tracking-tight">{value}</p>
    </motion.div>
  )
}

/* ───────────────── mini bar chart ───────────────── */
const barData = [
  { height: 45, color: 'bg-orange-400/80' },
  { height: 65, color: 'bg-orange-500/80' },
  { height: 50, color: 'bg-blue-400/60' },
  { height: 80, color: 'bg-blue-500/70' },
  { height: 70, color: 'bg-orange-500/80' },
  { height: 90, color: 'bg-blue-400/80' },
  { height: 55, color: 'bg-orange-400/60' },
  { height: 75, color: 'bg-blue-500/80' },
  { height: 60, color: 'bg-orange-500/70' },
  { height: 85, color: 'bg-blue-400/70' },
  { height: 95, color: 'bg-blue-500/80' },
  { height: 70, color: 'bg-orange-400/80' },
]

/* ───────────────── Hero Component ───────────────── */
export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800">
      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px),
            repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(255,255,255,0.15) 49px, rgba(255,255,255,0.15) 50px)
          `,
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            borderRadius: shape.type === 'circle' ? '50%' : '3px',
            backgroundColor:
              shape.type === 'circle'
                ? 'rgba(251, 191, 36, 0.12)'
                : 'rgba(96, 165, 250, 0.12)',
          }}
          animate={{
            y: [0, -15, 0, 10, 0],
            x: [0, 8, 0, -5, 0],
            rotate: shape.type === 'square' ? [0, 90, 180, 270, 360] : 0,
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: shape.delay,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left - Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Badge className="mb-6 bg-white/10 text-orange-300 border-orange-500/30 hover:bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
                <Activity className="w-3 h-3 mr-1.5" />
                Now with AI-Powered Insights
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight"
            >
              Manage Every{' '}
              <span className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                Construction Project
              </span>{' '}
              From One Platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="mt-6 text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              Control projects, finance, procurement, workforce, assets,
              scheduling, and client communication from a single integrated
              platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 group"
              >
                Request Demo
                <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-medium rounded-xl border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:text-white backdrop-blur-sm transition-all duration-300 group"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Watch Video
              </Button>
            </motion.div>

            {/* Bottom Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
              className="mt-14 flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center lg:justify-start"
            >
              <CountUpStat target={15000} suffix="+" label="Projects Managed" duration={2200} />
              <div className="hidden sm:block w-px h-12 bg-white/10" />
              <CountUpStat target={500} suffix="+" label="Companies Worldwide" duration={1800} />
              <div className="hidden sm:block w-px h-12 bg-white/10" />
              <CountUpStat target={99.9} suffix="%" label="Platform Uptime" duration={2000} />
            </motion.div>
          </div>

          {/* Right - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="flex-1 w-full max-w-lg"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative bg-white/[0.07] backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl shadow-black/20"
            >
              {/* Mock window header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 ml-3">
                  <div className="h-5 bg-white/[0.06] rounded-md max-w-[200px]" />
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <DashStatCard
                  icon={FolderKanban}
                  label="Active Projects"
                  value="24"
                  color="bg-orange-500/20"
                  delay={0}
                />
                <DashStatCard
                  icon={DollarSign}
                  label="Budget Utilization"
                  value="78%"
                  color="bg-blue-500/20"
                  delay={1}
                />
                <DashStatCard
                  icon={Users}
                  label="Team Members"
                  value="156"
                  color="bg-emerald-500/20"
                  delay={2}
                />
                <DashStatCard
                  icon={CheckCircle2}
                  label="Tasks Completed"
                  value="892"
                  color="bg-purple-500/20"
                  delay={3}
                />
              </div>

              {/* Mini Bar Chart */}
              <div className="bg-white/[0.05] rounded-xl p-4 border border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-300/60" />
                    <span className="text-[11px] text-blue-200/50 font-medium">
                      Monthly Progress
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400/70 font-medium">+12.5%</span>
                </div>
                <div className="flex items-end gap-1.5 h-16">
                  {barData.map((bar, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.height}%` }}
                      transition={{
                        delay: 1 + i * 0.05,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                      className={`flex-1 rounded-t-sm ${bar.color} min-w-0`}
                    />
                  ))}
                </div>
              </div>

              {/* Decorative glow behind dashboard */}
              <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900 to-transparent pointer-events-none" />
    </section>
  )
}