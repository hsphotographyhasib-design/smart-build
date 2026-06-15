'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      'SmartBuild has completely transformed how we manage our construction projects. The real-time tracking and automated reporting alone saved us over 200 hours per month.',
    name: 'Rajesh Kumar',
    title: 'Project Director',
    company: 'BuildRight Construction',
    initials: 'RK',
  },
  {
    quote:
      "We've tried multiple construction management tools, but SmartBuild is the only one that our entire team actually uses daily. The interface is intuitive and powerful.",
    name: 'Sarah Park',
    title: 'Operations Manager',
    company: 'Metro Builders Inc.',
    initials: 'SP',
  },
  {
    quote:
      'The financial management features in SmartBuild gave us complete visibility into project costs. We reduced cost overruns by 40% in the first year.',
    name: 'Ahmed Hassan',
    title: 'CFO',
    company: 'Gulf Construction Group',
    initials: 'AH',
  },
  {
    quote:
      'Managing labour and scheduling across 15+ active projects used to be a nightmare. SmartBuild made it seamless and our productivity increased by 35%.',
    name: 'Lisa Chen',
    title: 'HR Director',
    company: 'Pacific Development Co.',
    initials: 'LC',
  },
  {
    quote:
      "The client portal feature has dramatically improved our client relationships. They can see real-time progress, which has cut our status-update meetings in half.",
    name: 'Michael Torres',
    title: 'CEO',
    company: 'Torres & Associates',
    initials: 'MT',
  },
  {
    quote:
      'SmartBuild replaced 6 different tools we were using. Having everything in one platform with proper integrations saved us significant time and money.',
    name: 'David Wilson',
    title: 'VP of Operations',
    company: 'Summit Infrastructure',
    initials: 'DW',
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export function Testimonials() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Trusted by construction professionals worldwide
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="group rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed italic text-gray-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#000000] text-xs font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{t.name}</p>
                  <p className="text-xs text-gray-500">
                    {t.title}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}