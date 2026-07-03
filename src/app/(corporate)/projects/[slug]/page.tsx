"use client"

import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { motion } from "framer-motion"
import {
  Building, MapPin, Banknote, CalendarCheck, ClipboardList,
  BadgeCheck, ArrowRight, ArrowLeft,
} from "lucide-react"
import { company } from "@/lib/corporate-data"
import ProjectCard from "@/components/corporate/project-card"
import SectionHeader from "@/components/corporate/section-header"

export default function ProjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const project = company.projects.find((p) => p.slug === slug)

  if (!project) {
    notFound()
  }

  const related = company.projects.filter((p) => p.slug !== slug).slice(0, 3)

  const facts = [
    { label: "Client", value: project.client, icon: Building },
    { label: "Location", value: project.location, icon: MapPin },
    { label: "Project Value", value: project.value, icon: Banknote },
    { label: "Completion", value: project.completed, icon: CalendarCheck },
    { label: "Scope of Work", value: project.scope, icon: ClipboardList },
    { label: "Status", value: project.status, icon: BadgeCheck },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative py-32 lg:py-44 bg-corp-charcoal overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-corp-charcoal/70 via-corp-charcoal/60 to-corp-charcoal" />
        <div className="relative container-corp">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-corp-gold transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-white bg-corp-green px-3 py-1 rounded-full">{project.scope}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                project.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {project.status}
              </span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Facts */}
      <section className="section-padding bg-white">
        <div className="container-corp">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {facts.map((fact, i) => (
              <motion.div
                key={fact.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-gray-200 bg-corp-offwhite p-5"
              >
                <fact.icon className="w-5 h-5 text-corp-gold mb-3" />
                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{fact.label}</div>
                <div className="font-heading font-bold text-sm text-corp-charcoal">{fact.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <SectionHeader
            label="More Projects"
            title="Explore Other Work"
            description="See more of our portfolio across Brunei Darussalam."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {related.map((p, i) => (
              <ProjectCard key={p.slug} {...p} index={i} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
            >
              Start Your Project With Us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
