'use client'

import { motion } from 'framer-motion'
import {
  UserCog,
  Wrench,
  TrendingUp,
  Activity,
  Truck,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: UserCog,
    title: 'Labour Planning & Scheduling',
    description: 'Optimize crew assignments and shift schedules across all active projects.',
  },
  {
    icon: Wrench,
    title: 'Equipment Tracking & Maintenance',
    description: 'Monitor equipment health and schedule preventive maintenance automatically.',
  },
  {
    icon: TrendingUp,
    title: 'Resource Forecasting & Demand Planning',
    description: 'Predict resource needs based on project timelines and historical data.',
  },
  {
    icon: Activity,
    title: 'Crew Productivity Monitoring',
    description: 'Measure and benchmark crew performance with real-time productivity metrics.',
  },
  {
    icon: Truck,
    title: 'Vehicle & Tool Management',
    description: 'Track fleet vehicles and tools with check-in/check-out and location history.',
  },
  {
    icon: Zap,
    title: 'Skill Matching Engine',
    description: 'Automatically match the right skilled workers to tasks based on certifications.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

function ResourceDashboardMockup() {
  const resources = [
    { name: 'Electricians', util: 92, color: '#3b82f6' },
    { name: 'Carpenters', util: 78, color: '#f97316' },
    { name: 'Plumbers', util: 85, color: '#22c55e' },
    { name: 'Welders', util: 65, color: '#a855f7' },
    { name: 'Operators', util: 88, color: '#06b6d4' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative w-full"
    >
      {/* Main glass card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white">Resource Allocation</h4>
            <p className="text-xs text-blue-300">Real-time utilization across teams</p>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-200">
            Live
          </div>
        </div>

        {/* Utilization bars */}
        <div className="space-y-3.5">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-100">{resource.name}</span>
                <span className="text-xs font-semibold text-white">{resource.util}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${resource.util}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: resource.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom row: donut chart + stat cards */}
        <div className="mt-6 flex items-center gap-4">
          {/* CSS donut chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="relative shrink-0"
          >
            <div
              className="h-24 w-24 rounded-full"
              style={{
                background: `conic-gradient(
                  #3b82f6 0deg 130deg,
                  #f97316 130deg 220deg,
                  #22c55e 220deg 290deg,
                  #a855f7 290deg 340deg,
                  #06b6d4 340deg 360deg
                )`,
              }}
            >
              <div className="absolute inset-2 flex items-center justify-center rounded-full bg-blue-950">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">87%</div>
                  <div className="text-[8px] text-blue-300">Avg Util</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <div className="flex flex-1 flex-wrap gap-x-4 gap-y-1.5">
            {resources.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9 + i * 0.08 }}
                className="flex items-center gap-1.5"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                <span className="text-[10px] text-blue-200">{r.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating stat cards */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-4 -top-4 rounded-xl border border-white/10 bg-white/[0.1] px-4 py-3 backdrop-blur-lg shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
            <Activity className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <div className="text-[10px] text-blue-300">Utilization Rate</div>
            <div className="text-xl font-bold text-white">87%</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 -left-4 rounded-xl border border-white/10 bg-white/[0.1] px-4 py-3 backdrop-blur-lg shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
            <UserCog className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <div className="text-[10px] text-blue-300">Idle Resources</div>
            <div className="text-xl font-bold text-white">12</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ResourceManagement() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 py-20 md:py-28">
      {/* Subtle background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-64 w-64 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Smart Resource Management
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-200">
            Optimize your workforce, equipment, and materials across all projects
          </p>
        </motion.div>

        {/* Content grid */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Feature list */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-5"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group relative rounded-xl border-l-[3px] border-l-orange-400/60 bg-white/[0.04] px-5 py-4 transition-all duration-300 hover:bg-white/[0.08]"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] transition-colors group-hover:bg-orange-500/20">
                      <Icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-blue-300/80">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            <motion.div variants={itemVariants} className="pt-2">
              <Button
                variant="outline"
                className="border-orange-400/30 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20 hover:text-orange-200"
              >
                Explore Resources
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard mockup */}
          <ResourceDashboardMockup />
        </div>
      </div>
    </section>
  )
}