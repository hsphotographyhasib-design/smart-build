"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Building, ArrowRight } from "lucide-react"

interface ProjectCardProps {
  title: string
  client: string
  location: string
  status: string
  description: string
  scope: string
  index?: number
}

export default function ProjectCard({ title, client, location, status, description, scope, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] bg-gradient-to-br from-corp-green/20 to-corp-charcoal/20 flex items-center justify-center overflow-hidden">
          <div className="text-center p-6">
            <Building className="w-12 h-12 text-corp-green/30 mx-auto mb-3" />
            <span className="text-xs font-semibold text-corp-green bg-corp-green/10 px-3 py-1 rounded-full">
              {scope}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {status}
            </span>
          </div>
          <h3 className="font-heading text-lg font-bold text-corp-charcoal mb-2 group-hover:text-corp-green transition-colors">
            {title}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1"><Building className="w-3 h-3" />{client}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-corp-green group-hover:gap-2.5 transition-all duration-300">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
