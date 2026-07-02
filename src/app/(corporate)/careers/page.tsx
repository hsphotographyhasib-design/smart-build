'use client'

import { motion } from 'framer-motion'
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle, Send, GraduationCap, Users, Shield, TrendingUp, FileText } from 'lucide-react'
import Link from 'next/link'
import { company } from '@/lib/corporate-data'
import SectionHeader from '@/components/corporate/section-header'

const benefits = [
  {
    icon: GraduationCap,
    title: 'Career Growth',
    description: 'Opportunities for professional development and advancement',
  },
  {
    icon: CheckCircle,
    title: 'Safety Culture',
    description: 'Commitment to the highest safety standards',
  },
  {
    icon: Users,
    title: 'Great Team',
    description: 'Work with experienced professionals',
  },
  {
    icon: FileText,
    title: 'Competitive Benefits',
    description: 'Attractive compensation and benefits package',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

export default function CareersPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-corp-charcoal/90 via-corp-charcoal/80 to-corp-green/30" />
        <div className="container-corp section-padding relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="text-corp-gold font-heading font-semibold text-sm tracking-widest uppercase mb-4">
              Careers
            </p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Join Our Team
            </h1>
            <p className="text-gray-300 font-body text-lg md:text-xl leading-relaxed max-w-2xl">
              Build your future with HASANUR JAYA SDN BHD. We are always looking for
              talented individuals who share our passion for excellence in construction.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="bg-corp-offwhite section-padding">
        <div className="container-corp">
          <SectionHeader
            title="Why Work With Us"
            subtitle="We invest in our people and create an environment where you can thrive."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className="rounded-2xl bg-white border border-gray-100 p-6 text-center hover:shadow-lg hover:border-corp-green/20 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-corp-green/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-corp-green group-hover:text-white transition-colors duration-300">
                  <benefit.icon className="w-6 h-6 text-corp-green group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-corp-charcoal mb-2">
                  {benefit.title}
                </h3>
                <p className="font-body text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="section-padding">
        <div className="container-corp">
          <SectionHeader
            title="Current Openings"
            subtitle="Explore our available positions and find your next career opportunity."
          />
          <div className="space-y-6 mt-12">
            {company.careers.length > 0 ? (
              company.careers.map((job, i) => (
                <motion.div
                  key={`${job.title}-${i}`}
                  custom={i}
                  initial="hidden"
                  whileInView="viewport"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  className="rounded-2xl bg-white border border-gray-100 p-6 md:p-8 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full font-heading ${
                            job.type === 'Full-Time'
                              ? 'bg-corp-green/10 text-corp-green'
                              : job.type === 'Part-Time'
                              ? 'bg-corp-gold/10 text-corp-gold'
                              : 'bg-gray-100 text-corp-charcoal'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {job.type}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-body">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-body">
                          <Briefcase className="w-3 h-3" />
                          {job.department}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-corp-charcoal group-hover:text-corp-green transition-colors duration-300">
                        {job.title}
                      </h3>
                      <p className="font-body text-gray-600 mt-2 leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <Link
                      href="#"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-corp-green text-white rounded-xl font-heading font-medium text-sm hover:bg-corp-green/90 transition-colors shrink-0"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="font-heading text-lg text-gray-500">
                  No open positions at the moment.
                </p>
                <p className="font-body text-gray-400 mt-1">
                  Check back soon or send us your resume.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Can't Find What You're Looking For */}
      <section className="bg-corp-charcoal section-padding">
        <div className="container-corp">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="font-body text-gray-300 text-lg mb-8">
              We are always on the lookout for talented people. Send us your CV and we
              will keep you in mind for future opportunities.
            </p>
            <Link
              href="mailto:careers@hasanurjaya.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-corp-gold text-corp-charcoal rounded-xl font-heading font-semibold text-sm hover:bg-corp-gold/90 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Your CV
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
