'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  ScrollText,
  Cloud,
  Lock,
  Server,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Shield,
    title: 'Role Based Access',
    description:
      'Granular permissions ensure the right people see the right data',
  },
  {
    icon: ScrollText,
    title: 'Audit Logs',
    description:
      'Complete audit trail of every action in the system',
  },
  {
    icon: Cloud,
    title: 'Cloud Backup',
    description:
      'Automated daily backups with point-in-time recovery',
  },
  {
    icon: Lock,
    title: 'Encrypted Data',
    description:
      'AES-256 encryption for data at rest and in transit',
  },
  {
    icon: Server,
    title: '99.9% Availability',
    description:
      'Enterprise infrastructure with guaranteed uptime SLA',
  },
  {
    icon: CheckCircle,
    title: 'Compliance',
    description:
      'Industry standard compliance and data protection',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export function Security() {
  return (
    <section className="bg-gray-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
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
          viewport={{ once: true }}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Badge className="gap-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            SOC 2 Compliant
          </Badge>
          <Badge className="gap-2 border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <ShieldCheck className="h-4 w-4" />
            GDPR Ready
          </Badge>
        </motion.div>
      </div>
    </section>
  )
}