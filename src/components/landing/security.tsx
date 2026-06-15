'use client'

import { motion } from 'framer-motion'
import {
  ShieldCheck,
  ClipboardList,
  CloudUpload,
  Lock,
  Activity,
  BadgeCheck,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface SecurityFeature {
  icon: LucideIcon
  title: string
  description: string
}

const features: SecurityFeature[] = [
  {
    icon: ShieldCheck,
    title: 'Role Based Access',
    description:
      'Granular permission controls ensure every user sees only what they need.',
  },
  {
    icon: ClipboardList,
    title: 'Audit Logs',
    description:
      'Every action is tracked with detailed audit trails for full accountability.',
  },
  {
    icon: CloudUpload,
    title: 'Cloud Backup',
    description:
      'Automated daily backups with point-in-time recovery and geo-redundancy.',
  },
  {
    icon: Lock,
    title: 'Encrypted Data',
    description:
      'AES-256 encryption at rest and TLS 1.3 in transit for all your data.',
  },
  {
    icon: Activity,
    title: '99.9% Availability',
    description:
      'Enterprise infrastructure with SLA-backed uptime guarantees.',
  },
  {
    icon: BadgeCheck,
    title: 'Compliance',
    description:
      'Built to meet industry standards including ISO 27001 and regional regulations.',
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export function Security() {
  return (
    <section className="bg-[#f5f1ed] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Enterprise-Grade Security
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Your data is safe with us
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#ff5201]/10">
                  <Icon className="h-5 w-5 text-[#ff5201]" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-black">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5201]/20 bg-white px-4 py-2 text-xs font-semibold text-[#ff5201]">
            <ShieldCheck className="h-3.5 w-3.5" />
            SOC 2 Compliant
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5201]/20 bg-white px-4 py-2 text-xs font-semibold text-[#ff5201]">
            <BadgeCheck className="h-3.5 w-3.5" />
            GDPR Ready
          </span>
        </motion.div>
      </div>
    </section>
  )
}