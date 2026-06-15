'use client'

import { motion } from 'framer-motion'
import {
  FolderKanban,
  DollarSign,
  ShoppingCart,
  Users,
  HardHat,
  Wrench,
  CalendarRange,
  UserCheck,
  Activity,
  Calculator,
  Store,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ProductModule {
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
  hoverBorder: string
}

const products: ProductModule[] = [
  {
    title: 'Project Management',
    description: 'Plan, track, and deliver projects on time',
    icon: FolderKanban,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-300',
  },
  {
    title: 'Finance',
    description: 'Invoices, payments, and financial control',
    icon: DollarSign,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBorder: 'hover:border-green-300',
  },
  {
    title: 'Procurement',
    description: 'Streamlined purchasing and inventory',
    icon: ShoppingCart,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    hoverBorder: 'hover:border-purple-300',
  },
  {
    title: 'HR Management',
    description: 'Employee records, leave, and compliance',
    icon: Users,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hoverBorder: 'hover:border-orange-300',
  },
  {
    title: 'Labour Management',
    description: 'Attendance, payroll, and workforce tracking',
    icon: HardHat,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hoverBorder: 'hover:border-amber-300',
  },
  {
    title: 'Asset Management',
    description: 'Tools, equipment, and vehicle lifecycle',
    icon: Wrench,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    hoverBorder: 'hover:border-teal-300',
  },
  {
    title: 'Scheduling',
    description: 'Interactive Gantt charts and timelines',
    icon: CalendarRange,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
  },
  {
    title: 'Client Portal',
    description: 'Real-time project access for clients',
    icon: UserCheck,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    hoverBorder: 'hover:border-pink-300',
  },
  {
    title: 'Resource Management',
    description: 'Workforce and equipment optimization',
    icon: Activity,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    hoverBorder: 'hover:border-cyan-300',
  },
  {
    title: 'Cost Control',
    description: 'Budget tracking and forecasting',
    icon: Calculator,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    hoverBorder: 'hover:border-red-300',
  },
  {
    title: 'Sales',
    description: 'Product catalog and invoicing',
    icon: Store,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    hoverBorder: 'hover:border-violet-300',
  },
  {
    title: 'Reports',
    description: 'Analytics and business intelligence',
    icon: BarChart3,
    iconBg: 'bg-gray-200',
    iconColor: 'text-gray-600',
    hoverBorder: 'hover:border-gray-400',
  },
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
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export function ProductShowcase() {
  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
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
            Complete Construction Platform
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Every tool you need in one integrated system
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {products.map((product) => {
            const Icon = product.icon
            return (
              <motion.div
                key={product.title}
                className={`group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 ${product.hoverBorder} hover:shadow-lg hover:scale-[1.03]`}
                variants={cardVariants}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${product.iconBg} mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-7 w-7 ${product.iconColor}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}