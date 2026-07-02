"use client"

import { motion } from "framer-motion"
import { Landmark, Building, Home, Factory, Route, Hotel, GraduationCap, HeartPulse, ArrowRight } from "lucide-react"
import { company } from "@/lib/corporate-data"
import SectionHeader from "@/components/corporate/section-header"

const iconMap: Record<string, React.ElementType> = {
  Landmark, Building, Home, Factory, Route, Hotel, GraduationCap, HeartPulse,
}

export default function IndustriesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-corp-green-dark via-corp-charcoal to-corp-charcoal" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container-corp relative">
          <SectionHeader
            label="Sectors We Serve"
            title="Industries We Serve"
            description="With decades of experience across multiple sectors, Hasanur Jaya delivers tailored construction solutions for every industry."
            light
          />
        </div>
      </section>

      {/* Industries Grid */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto text-center mb-12 lg:mb-16"
          >
            From government infrastructure to luxury residences, our expertise spans a wide range of industries. We bring the same commitment to quality, safety, and innovation to every sector we serve.
          </motion.p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {company.industries.map((industry, i) => {
              const Icon = iconMap[industry.icon] || Building
              return (
                <motion.div
                  key={industry.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="rounded-2xl bg-white border border-gray-100 p-6 lg:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-corp-green/10 flex items-center justify-center mb-5 group-hover:bg-corp-green group-hover:text-white transition-all duration-300">
                    <Icon className="w-7 h-7 text-corp-green group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-3">{industry.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{industry.description}</p>
                  <a
                    href="#"
                    className="group/link inline-flex items-center gap-2 text-corp-green font-semibold text-sm hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-corp-green via-corp-green-dark to-corp-charcoal" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "40px 40px",
        }} />
        <div className="container-corp relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Let&apos;s Build Your Vision
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Contact our team to discuss how we can bring your next project to life.
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Get in Touch
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
