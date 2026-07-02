"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { HardHat, ArrowRight, ChevronDown } from "lucide-react"
import SectionHeader from "@/components/corporate/section-header"
import ProjectCard from "@/components/corporate/project-card"
import { company } from "@/lib/corporate-data"

const statuses = ["All", "Completed", "Ongoing"]

export default function ProjectsPage() {
  const [activeStatus, setActiveStatus] = useState("All")

  const filtered = activeStatus === "All"
    ? company.projects
    : company.projects.filter((p) => p.status === activeStatus)

  return (
    <main>
      <section className="relative min-h-[50vh] flex items-center bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-corp-charcoal via-corp-charcoal to-corp-green/30" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-corp-green/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-corp-gold/10 blur-3xl" />
        <div className="relative container-corp section-padding">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-corp-gold text-sm font-semibold tracking-[0.2em] uppercase mb-6">
              <HardHat className="w-5 h-5" />Our Portfolio
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Our Projects
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              Explore our portfolio of completed and ongoing projects across Brunei. Each project reflects our commitment to quality, innovation, and client satisfaction.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-corp-offwhite section-padding">
        <div className="container-corp">
          <SectionHeader
            label="Our Work"
            title="Featured Projects"
            description="From government infrastructure to private developments, our projects showcase the breadth and depth of our capabilities."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeStatus === status
                    ? "bg-corp-green text-white shadow-lg shadow-corp-green/30"
                    : "bg-white text-corp-charcoal border border-gray-200 hover:border-corp-green hover:text-corp-green"
                }`}
              >
                {status}
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filtered.map((project, i) => (
              <ProjectCard key={i} {...project} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No {activeStatus.toLowerCase()} projects to display.</p>
            </div>
          )}
        </div>
      </section>

      <section className="relative bg-corp-charcoal section-padding overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-corp-charcoal via-corp-charcoal to-corp-green/20" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-corp-gold/5 blur-3xl" />
        <div className="relative container-corp text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Let&apos;s Build Something Together
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Have a project in mind? Contact us today to discuss how we can bring your vision to life.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-corp-gold text-corp-charcoal font-bold px-8 py-4 rounded-full hover:bg-corp-gold/90 transition-all duration-300 hover:shadow-xl hover:shadow-corp-gold/20 group"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
