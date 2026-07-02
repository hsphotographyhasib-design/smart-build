"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Building2, Palette, ClipboardCheck, RefreshCw, Route, Leaf } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-7 h-7" />,
  Palette: <Palette className="w-7 h-7" />,
  ClipboardCheck: <ClipboardCheck className="w-7 h-7" />,
  RefreshCw: <RefreshCw className="w-7 h-7" />,
  Route: <Route className="w-7 h-7" />,
  Leaf: <Leaf className="w-7 h-7" />,
}

interface ServiceCardProps {
  title: string
  description: string
  icon: string
  slug: string
  index?: number
}

export default function ServiceCard({ title, description, icon, slug, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/services/${slug}`} className="group block h-full">
        <div className="h-full rounded-2xl bg-white border border-gray-100 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-corp-green/5 hover:-translate-y-1 hover:border-corp-green/20">
          <div className="w-14 h-14 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
            {iconMap[icon] || <Building2 className="w-7 h-7" />}
          </div>
          <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-3 group-hover:text-corp-green transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            {description}
          </p>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-corp-green group-hover:gap-2.5 transition-all duration-300">
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
