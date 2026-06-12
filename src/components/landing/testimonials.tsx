'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      'SmartBuild transformed how we manage our projects. The real-time dashboards alone saved us 15 hours per week.',
    name: 'Rajesh Kumar',
    title: 'CEO',
    company: 'BuildCorp',
    initials: 'RK',
    avatarBg: 'bg-blue-600',
  },
  {
    quote:
      'The resource management features are incredible. We reduced equipment idle time by 40% in the first quarter.',
    name: 'Sarah Park',
    title: 'Project Director',
    company: 'MetroCon',
    initials: 'SP',
    avatarBg: 'bg-green-600',
  },
  {
    quote:
      'From procurement to payroll, everything is connected. No more spreadsheets and email chains.',
    name: 'Ahmed Hassan',
    title: 'Operations Manager',
    company: 'SteelFrame',
    initials: 'AH',
    avatarBg: 'bg-purple-600',
  },
  {
    quote:
      'The client portal feature has significantly improved our communication with stakeholders.',
    name: 'Lisa Chen',
    title: 'VP',
    company: 'PrimeBuild',
    initials: 'LC',
    avatarBg: 'bg-pink-600',
  },
  {
    quote:
      'Implementation was smooth and the support team is exceptional. Best construction software we\'ve used.',
    name: 'Michael Torres',
    title: 'COO',
    company: 'UrbanDev',
    initials: 'MT',
    avatarBg: 'bg-orange-500',
  },
  {
    quote:
      'The ROI was visible within the first month. SmartBuild pays for itself many times over.',
    name: 'David Wilson',
    title: 'Managing Director',
    company: 'ApexGroup',
    initials: 'DW',
    avatarBg: 'bg-teal-600',
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export function Testimonials() {
  return (
    <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
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
            What Our Clients Say
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Trusted by construction professionals worldwide
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md hover:-translate-y-1"
              variants={cardVariants}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-600 italic leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${testimonial.avatarBg}`}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.title}, {testimonial.company}
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