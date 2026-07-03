"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight, Building2, Palette, ClipboardCheck, RefreshCw, Route, Leaf,
  Compass, Zap, Wrench, Frame, Flame, Landmark,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-6 h-6" />,
  Palette: <Palette className="w-6 h-6" />,
  ClipboardCheck: <ClipboardCheck className="w-6 h-6" />,
  RefreshCw: <RefreshCw className="w-6 h-6" />,
  Route: <Route className="w-6 h-6" />,
  Leaf: <Leaf className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  Frame: <Frame className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Landmark: <Landmark className="w-6 h-6" />,
}

interface ServiceCardProps {
  title: string
  description: string
  icon: string
  slug: string
  image?: string
  index?: number
}

export default function ServiceCard({ title, description, icon, slug, image, index = 0 }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/services/${slug}`} className="group block h-full">
        <div className="h-full rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-corp-green/5 hover:-translate-y-1 hover:border-corp-green/20">
          {image && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url(${image})` }}
                role="img"
                aria-label={title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-corp-charcoal/50 to-transparent" />
              <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm text-corp-green flex items-center justify-center shadow-lg">
                {iconMap[icon] || <Building2 className="w-6 h-6" />}
              </div>
            </div>
          )}
          <div className="p-6 lg:p-7">
            {!image && (
              <div className="w-14 h-14 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                {iconMap[icon] || <Building2 className="w-6 h-6" />}
              </div>
            )}
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
        </div>
      </Link>
    </motion.div>
  )
}
