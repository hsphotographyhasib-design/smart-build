'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  HardHat,
  Thermometer,
  Building2,
  Zap,
  Home,
  Landmark,
  Factory,
  Wrench,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface IndustryCard {
  title: string
  description: string
  icon: LucideIcon
}

const industries: IndustryCard[] = [
  {
    title: 'Construction Companies',
    description: 'General contractors and builders managing multiple projects',
    icon: HardHat,
  },
  {
    title: 'HVAC Contractors',
    description: 'Heating, ventilation, and air conditioning specialists',
    icon: Thermometer,
  },
  {
    title: 'Facility Management',
    description: 'Building operations and maintenance organizations',
    icon: Building2,
  },
  {
    title: 'Electrical Contractors',
    description: 'Electrical installation and maintenance companies',
    icon: Zap,
  },
  {
    title: 'Property Management',
    description: 'Real estate and property management firms',
    icon: Home,
  },
  {
    title: 'Government Projects',
    description: 'Public infrastructure and government construction',
    icon: Landmark,
  },
  {
    title: 'Industrial Facilities',
    description: 'Manufacturing and industrial plant maintenance',
    icon: Factory,
  },
  {
    title: 'MEP Contractors',
    description: 'Mechanical, electrical, and plumbing contractors',
    icon: Wrench,
  },
]

/* ------------------------------------------------------------------ */
/*  Single Card                                                        */
/* ------------------------------------------------------------------ */

function IndustryCardItem({ card, index }: { card: IndustryCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const Icon = card.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300 cursor-pointer"
    >
      {/* Hover arrow */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 text-amber-600" />
        </div>
      </div>

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors duration-300">
        <Icon className="w-5 h-5 text-amber-600" />
      </div>

      {/* Text */}
      <h3 className="font-semibold text-gray-900 text-sm mb-1.5 pr-8">{card.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function IndustrySection() {
  const headerRef = useRef<HTMLDivElement>(null)
  const isHeaderInView = useInView(headerRef, { once: true, margin: '-60px' })

  return (
    <section className="bg-white py-24" id="industries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Built for Every Construction Discipline
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
            From general contracting to specialized trades, SmartBuild adapts to your industry.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {industries.map((industry, i) => (
            <IndustryCardItem key={industry.title} card={industry} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}