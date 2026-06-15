'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  MessageCircle,
  FileSpreadsheet,
  Mail,
  BookOpen,
  CreditCard,
  BarChart3,
  PencilRuler,
  Table,
  Plug,
} from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface Integration {
  icon: LucideIcon
  name: string
}

const integrations: Integration[] = [
  { icon: MapPin, name: 'Google Maps' },
  { icon: MessageCircle, name: 'WhatsApp' },
  { icon: FileSpreadsheet, name: 'Microsoft 365' },
  { icon: Mail, name: 'Google Workspace' },
  { icon: CreditCard, name: 'QuickBooks' },
  { icon: BookOpen, name: 'Xero' },
  { icon: BarChart3, name: 'Power BI' },
  { icon: PencilRuler, name: 'AutoCAD' },
  { icon: Table, name: 'Excel' },
  { icon: Plug, name: 'API' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export function Integrations() {
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
            Seamless Integrations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Connect with the tools you already use
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {integrations.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group flex flex-col items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200">
                  <Icon className="h-6 w-6 text-[#595552]" />
                </div>
                <span className="text-sm font-medium text-black">{item.name}</span>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center text-sm text-gray-400"
        >
          Plus 50+ more integrations
        </motion.p>
      </div>
    </section>
  )
}