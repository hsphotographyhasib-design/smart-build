'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { Clock, TrendingUp, BarChart3, DollarSign } from 'lucide-react'

const stats = [
  {
    value: 30,
    suffix: '%',
    label: 'Reduction in Project Delays',
    icon: Clock,
    accentColor: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-l-green-500',
  },
  {
    value: 25,
    suffix: '%',
    label: 'Increase in Productivity',
    icon: TrendingUp,
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-l-blue-500',
  },
  {
    value: 40,
    suffix: '%',
    label: 'Faster Reporting',
    icon: BarChart3,
    accentColor: 'text-orange-500',
    bgColor: 'bg-orange-100',
    borderColor: 'border-l-orange-500',
  },
  {
    value: 20,
    suffix: '%',
    label: 'Overall Cost Savings',
    icon: DollarSign,
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-l-purple-500',
  },
]

export function Statistics() {
  const [hasAnimated, setHasAnimated] = useState(false)

  return (
    <motion.section
      className="bg-white py-20 px-4 sm:px-6 lg:px-8"
      onViewportEnter={() => setHasAnimated(true)}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-gray-900">
            The Impact of SmartBuild
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Measurable results across the construction industry
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-l-4 border-gray-200/60 bg-white/70 backdrop-blur-md p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
                style={{ borderLeftColor: undefined }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ scale: 1.03 }}
              >
                <div
                  className={`absolute inset-y-0 left-0 w-1 rounded-full ${stat.borderColor.replace('border-l-', 'bg-')}`}
                />
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${stat.bgColor} mb-4`}
                  >
                    <Icon className={`h-7 w-7 ${stat.accentColor}`} />
                  </div>
                  <div
                    className={`text-5xl font-extrabold tracking-tight ${stat.accentColor}`}
                  >
                    {hasAnimated ? (
                      <CountUp
                        end={stat.value}
                        duration={2.5}
                        suffix={stat.suffix}
                      />
                    ) : (
                      `0${stat.suffix}`
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600 leading-snug">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}