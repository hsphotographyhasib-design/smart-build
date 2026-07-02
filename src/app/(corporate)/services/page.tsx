"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Building2, Palette, ClipboardCheck, RefreshCw, Route, Leaf, CheckCircle, ArrowRight } from "lucide-react"
import { company } from "@/lib/corporate-data"
import SectionHeader from "@/components/corporate/section-header"

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-8 h-8" />,
  Palette: <Palette className="w-8 h-8" />,
  ClipboardCheck: <ClipboardCheck className="w-8 h-8" />,
  RefreshCw: <RefreshCw className="w-8 h-8" />,
  Route: <Route className="w-8 h-8" />,
  Leaf: <Leaf className="w-8 h-8" />,
}

export default function ServicesPage() {
  const { services } = company

  return (
    <>
      {/* Hero */}
      <section className="relative py-28 lg:py-36 bg-corp-charcoal overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/services-hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-corp-charcoal/80 via-corp-charcoal/60 to-corp-charcoal" />
        <div className="relative container-corp text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-corp-gold mb-4">
              What We Do
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Our{" "}
              <span className="text-corp-gold">Services</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Comprehensive construction and development solutions delivered with quality, integrity, and innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <SectionHeader
            label="Expertise"
            title="Full-Spectrum Construction Services"
            description="From concept to completion, we offer end-to-end solutions covering every aspect of construction and development. Each service is backed by years of experience and a commitment to excellence."
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-white -mt-20">
        <div className="container-corp">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/services/${service.slug}`} className="group block h-full">
                  <div className="h-full rounded-2xl bg-corp-offwhite border border-gray-100 p-8 transition-all duration-300 hover:shadow-xl hover:shadow-corp-green/5 hover:-translate-y-1 hover:border-corp-green/20">
                    <div className="w-14 h-14 rounded-xl bg-corp-green/10 text-corp-green flex items-center justify-center mb-5 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                      {iconMap[service.icon] || <Building2 className="w-8 h-8" />}
                    </div>
                    <span className="text-xs font-semibold tracking-wider uppercase text-corp-gold mb-2 block">
                      {service.category}
                    </span>
                    <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-3 group-hover:text-corp-green transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {service.fullDesc}
                    </p>
                    <div className="space-y-2 mb-6">
                      {service.capabilities.slice(0, 4).map((cap) => (
                        <div key={cap} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-corp-green mt-0.5 shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                      {service.capabilities.length > 4 && (
                        <p className="text-sm text-corp-green font-medium">
                          +{service.capabilities.length - 4} more capabilities
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-corp-green group-hover:gap-2.5 transition-all duration-300">
                      <span>View Full Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-corp-charcoal">
        <div className="container-corp text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your{" "}
              <span className="text-corp-gold">Project?</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
              Contact our team today to discuss how we can bring your vision to life with our comprehensive construction services.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-corp-gold/25"
            >
              Get In Touch
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
