"use client"

import { motion } from "framer-motion"

interface SectionHeaderProps {
  label?: string
  title: string
  description?: string
  center?: boolean
  light?: boolean
}

export default function SectionHeader({ label, title, description, center = true, light = false }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${center ? "mx-auto text-center" : ""} mb-12 lg:mb-16`}
    >
      {label && (
        <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 ${
          light ? "text-corp-gold" : "text-corp-gold"
        }`}>
          {label}
        </span>
      )}
      <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 ${
        light ? "text-white" : "text-corp-charcoal"
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`text-lg leading-relaxed max-w-2xl ${center ? "mx-auto" : ""} ${
          light ? "text-gray-300" : "text-gray-600"
        }`}>
          {description}
        </p>
      )}
    </motion.div>
  )
}
