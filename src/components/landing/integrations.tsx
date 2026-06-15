'use client'

import { motion } from 'framer-motion'
import {
  MapPin,
  MessageCircle,
  FileText,
  Mail,
  Receipt,
  DollarSign,
  BarChart3,
  PenTool,
  Table,
  Code,
} from 'lucide-react'

const integrations = [
  { name: 'Google Maps', icon: MapPin, color: 'text-gray-500' },
  { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
  { name: 'Microsoft 365', icon: FileText, color: 'text-blue-500' },
  { name: 'Google Workspace', icon: Mail, color: 'text-blue-600' },
  { name: 'QuickBooks', icon: Receipt, color: 'text-green-600' },
  { name: 'Xero', icon: DollarSign, color: 'text-blue-400' },
  { name: 'Power BI', icon: BarChart3, color: 'text-yellow-500' },
  { name: 'AutoCAD', icon: PenTool, color: 'text-red-500' },
  { name: 'Excel', icon: Table, color: 'text-green-500' },
  { name: 'API', icon: Code, color: 'text-purple-500' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export function Integrations() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
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
          viewport={{ once: true }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5"
        >
          {integrations.map((integration) => (
            <motion.div
              key={integration.name}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
              className="flex flex-col items-center gap-3 rounded-xl p-6 transition-shadow"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                <integration.icon className={`h-8 w-8 ${integration.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {integration.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 text-center text-sm text-gray-400"
        >
          Plus 50+ more integrations available
        </motion.p>
      </div>
    </section>
  )
}