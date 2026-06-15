'use client'

import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Clock, TrendingUp, Zap, PiggyBank } from 'lucide-react'

const stats = [
  {
    label: 'Reduction in Project Delays',
    value: 30,
    suffix: '%',
    icon: Clock,
    color: '#16a34a',
    bg: 'bg-green-50',
  },
  {
    label: 'Increase in Productivity',
    value: 25,
    suffix: '%',
    icon: TrendingUp,
    color: '#000000',
    bg: 'bg-gray-100',
  },
  {
    label: 'Faster Reporting',
    value: 40,
    suffix: '%',
    icon: Zap,
    color: '#ff5201',
    bg: 'bg-orange-50',
  },
  {
    label: 'Overall Cost Savings',
    value: 20,
    suffix: '%',
    icon: PiggyBank,
    color: '#0d9488',
    bg: 'bg-teal-50',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export function Statistics() {
  return (
    <section className="bg-[#f5f1ed] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
            The Impact of SmartBuild
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#595552]">
            Measurable results across the construction industry
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
                className="rounded-xl border border-[#e2e8f0] bg-white p-6 text-center transition-shadow shadow-sm"
              >
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${s.color}15` }}
                >
                  <Icon className="h-6 w-6" style={{ color: s.color }} />
                </div>
                <div className="mt-5">
                  <span
                    className="text-5xl font-extrabold tracking-tight"
                    style={{ color: s.color }}
                  >
                    <CountUp end={s.value} duration={2} enableScrollSpy scrollSpyOnce />
                    {s.suffix}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#1a202c]">{s.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}