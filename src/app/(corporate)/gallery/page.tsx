"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Image as ImageIcon, Building2, Hammer, HardHat, Wrench, Users, Mountain, Camera } from "lucide-react"
import SectionHeader from "@/components/corporate/section-header"
import { company } from "@/lib/corporate-data"

const categories = ["All", ...Array.from(new Set(company.gallery.map((g) => g.category)))]

const gradientMap: Record<string, string> = {
  Construction: "from-emerald-500/30 to-teal-600/30",
  Progress: "from-amber-400/30 to-orange-500/30",
  Completed: "from-blue-500/30 to-indigo-600/30",
  Equipment: "from-slate-500/30 to-zinc-600/30",
  Workforce: "from-rose-400/30 to-pink-500/30",
  Infrastructure: "from-cyan-400/30 to-sky-500/30",
}

const iconMap: Record<string, typeof Building2> = {
  Construction: Building2,
  Progress: Hammer,
  Completed: HardHat,
  Equipment: Wrench,
  Workforce: Users,
  Infrastructure: Mountain,
}

const spanMap: Record<string, string> = {
  "0": "md:row-span-2",
  "3": "md:col-span-2",
  "4": "md:row-span-2",
}

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? company.gallery
    : company.gallery.filter((g) => g.category === activeCategory)

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
              <Camera className="w-5 h-5" />Moments That Matter
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Photo Gallery
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              A visual journey through our projects, people, and the work that defines Hasanur Jaya.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-corp-offwhite section-padding">
        <div className="container-corp">
          <SectionHeader
            label="Our Gallery"
            title="A Visual Portfolio"
            description="Browse through our collection of project photos, work in progress, and the dedicated team behind every build."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-corp-green text-white shadow-lg shadow-corp-green/30"
                    : "bg-white text-corp-charcoal border border-gray-200 hover:border-corp-green hover:text-corp-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          <motion.div layout className="columns-2 md:columns-3 gap-4 space-y-4">
            {filtered.map((item, i) => {
              const Icon = iconMap[item.category] || ImageIcon
              const gradient = gradientMap[item.category] || "from-gray-400/30 to-gray-500/30"
              const heights = ["h-64", "h-80", "h-56", "h-72", "h-64", "h-96"]
              const height = heights[i % heights.length]

              return (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`break-inside-avoid mb-4 ${height}`}
                >
                  <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1`}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <Icon className="w-16 h-16 text-white/30 group-hover:text-white/50 transition-all duration-300 group-hover:scale-110" />
                    <span className="absolute bottom-4 left-4 bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span className="absolute bottom-4 right-4 bg-black/50 text-white/70 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.alt}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No images in the &ldquo;{activeCategory}&rdquo; category.</p>
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
              Want to See More?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Visit one of our completed projects in person or schedule a site tour to experience our quality firsthand.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-corp-gold text-corp-charcoal font-bold px-8 py-4 rounded-full hover:bg-corp-gold/90 transition-all duration-300 hover:shadow-xl hover:shadow-corp-gold/20 group"
            >
              Schedule a Site Visit
              <Camera className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
