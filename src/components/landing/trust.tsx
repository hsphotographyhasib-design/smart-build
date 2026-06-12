'use client'

import { motion } from 'framer-motion'
import { Building2, Globe, Shield } from 'lucide-react'

/* ───────────────── company logo data ───────────────── */
const companies = [
  { name: 'BuildCorp', initials: 'BC', color: 'text-gray-400', hoverColor: 'text-blue-600', weight: 'font-extrabold' },
  { name: 'MetroCon', initials: 'MC', color: 'text-gray-500', hoverColor: 'text-orange-600', weight: 'font-bold' },
  { name: 'SteelFrame', initials: 'SF', color: 'text-gray-400', hoverColor: 'text-slate-700', weight: 'font-extrabold' },
  { name: 'PrimeBuild', initials: 'PB', color: 'text-gray-500', hoverColor: 'text-emerald-600', weight: 'font-bold' },
  { name: 'UrbanDev', initials: 'UD', color: 'text-gray-400', hoverColor: 'text-violet-600', weight: 'font-extrabold' },
  { name: 'GreenConstruct', initials: 'GC', color: 'text-gray-500', hoverColor: 'text-green-600', weight: 'font-bold' },
  { name: 'ApexGroup', initials: 'AG', color: 'text-gray-400', hoverColor: 'text-amber-600', weight: 'font-extrabold' },
  { name: 'TitanWorks', initials: 'TW', color: 'text-gray-500', hoverColor: 'text-red-600', weight: 'font-bold' },
  { name: 'PacificBuild', initials: 'PB', color: 'text-gray-400', hoverColor: 'text-cyan-600', weight: 'font-extrabold' },
  { name: 'NationalContractors', initials: 'NC', color: 'text-gray-500', hoverColor: 'text-indigo-600', weight: 'font-bold' },
]

/* ───────────────── stat cards ───────────────── */
const stats = [
  {
    value: '15,000+',
    label: 'Projects Managed',
    icon: Building2,
    gradient: 'from-blue-600/10 to-blue-700/5',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    value: '500+',
    label: 'Companies Worldwide',
    icon: Globe,
    gradient: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-500/20',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
  },
  {
    value: '99.9%',
    label: 'Platform Uptime',
    icon: Shield,
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
]

/* ───────────────── container animation variants ───────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const logoVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

/* ───────────────── Trust Component ───────────────── */
export function Trust() {
  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-14 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Trusted by Leading{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Construction Companies
            </span>
          </h2>
          <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            From contractors to developers, facility managers to government agencies
          </p>
        </motion.div>

        {/* Company Logos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-10 mb-16 sm:mb-20"
        >
          {companies.map((company) => (
            <motion.div
              key={company.name}
              variants={logoVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group flex flex-col items-center gap-2 cursor-default"
            >
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center transition-all duration-300 group-hover:border-gray-200 group-hover:shadow-lg group-hover:shadow-gray-200/50 group-hover:bg-white">
                  <span
                    className={`text-lg sm:text-xl ${company.weight} ${company.color} transition-colors duration-300 group-hover:${company.hoverColor}`}
                    style={{
                      color: 'inherit',
                    }}
                  >
                    <span className="text-gray-400 group-hover:text-blue-600 transition-colors duration-300">
                      {company.initials}
                    </span>
                  </span>
                </div>
                {/* Hover ring effect */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-blue-200/0 opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10 scale-110"
                />
              </div>
              {/* Company Name */}
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors duration-300 tracking-wide uppercase">
                {company.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} p-6 sm:p-8 text-center backdrop-blur-sm overflow-hidden group cursor-default`}
              >
                {/* Background glass decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/60 to-transparent rounded-bl-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/30 to-transparent rounded-tr-full pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}