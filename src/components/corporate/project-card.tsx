"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, Building, ArrowRight, Banknote, CalendarCheck } from "lucide-react"

interface ProjectCardProps {
  title: string
  client: string
  location: string
  status: string
  description: string
  scope: string
  slug?: string
  value?: string
  completed?: string
  image?: string
  index?: number
}

export default function ProjectCard({
  title, client, location, status, description, scope,
  slug, value, completed, image, index = 0,
}: ProjectCardProps) {
  const href = slug ? `/projects/${slug}` : "/projects"

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={href} className="group block h-full">
        <div className="relative h-full rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="relative aspect-[16/10] overflow-hidden">
            {image ? (
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url(${image})` }}
                role="img"
                aria-label={title}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-corp-green/20 to-corp-charcoal/20 flex items-center justify-center">
                <Building className="w-12 h-12 text-corp-green/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-corp-charcoal/60 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 text-xs font-semibold text-white bg-corp-green/90 backdrop-blur-sm px-3 py-1 rounded-full">
              {scope}
            </span>
            <span className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
              status === "Completed" ? "bg-green-100/95 text-green-700" : "bg-amber-100/95 text-amber-700"
            }`}>
              {status}
            </span>
          </div>
          <div className="p-6">
            <h3 className="font-heading text-lg font-bold text-corp-charcoal mb-2 group-hover:text-corp-green transition-colors">
              {title}
            </h3>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-corp-gold shrink-0" />{client}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-corp-gold shrink-0" />{location}</span>
              {value && <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-corp-gold shrink-0" />{value}</span>}
              {completed && <span className="flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5 text-corp-gold shrink-0" />{completed}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-corp-green group-hover:gap-2.5 transition-all duration-300">
              <span>View Details</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
