"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Play, ChevronRight, Building2, CheckCircle, Phone } from "lucide-react"
import { company } from "@/lib/corporate-data"
import StatCounter from "@/components/corporate/stat-counter"
import ServiceCard from "@/components/corporate/service-card"
import ProjectCard from "@/components/corporate/project-card"
import SectionHeader from "@/components/corporate/section-header"

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-corp-green-dark via-corp-charcoal to-corp-charcoal hero-overlay" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="relative container-corp w-full pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.25em] uppercase mb-6 bg-white/5 px-4 py-2 rounded-full border border-corp-gold/20">
                Building Excellence Since {company.founded}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              {company.hero.headline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-8 max-w-xl"
            >
              {company.hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl shadow-corp-gold/25 hover:shadow-2xl hover:shadow-corp-gold/30 hover:-translate-y-0.5"
              >
                <Phone className="w-5 h-5" />
                Request a Quotation
              </Link>
              <Link
                href="/projects"
                className="group inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                View Our Projects
              </Link>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 lg:gap-6"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8">
              <StatCounter value={company.stats[0].value} suffix={company.stats[0].suffix} label={company.stats[0].label} />
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8">
              <StatCounter value={company.stats[1].value} suffix={company.stats[1].suffix} label={company.stats[1].label} />
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8">
              <StatCounter value={company.stats[2].value} suffix={company.stats[2].suffix} label={company.stats[2].label} />
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8">
              <StatCounter value={company.stats[3].value} suffix={company.stats[3].suffix} label={company.stats[3].label} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-corp-gold" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-corp-green/20 to-corp-charcoal/20 flex items-center justify-center overflow-hidden border border-gray-100">
                <Building2 className="w-24 h-24 text-corp-green/20" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl bg-corp-gold flex items-center justify-center shadow-xl hidden lg:flex">
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-white">{company.yearsInBusiness}+</div>
                  <div className="text-xs text-white/80">Years of Excellence</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              About Our Company
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-corp-charcoal leading-tight mb-6">
              Leading the Way in Modern <span className="text-corp-green">Construction</span>
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              {company.about.history}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {company.about.values.slice(0, 4).map((value) => (
                <div key={value.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-corp-green mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-corp-charcoal text-sm">{value.title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{value.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section className="section-padding bg-corp-offwhite">
      <div className="container-corp">
        <SectionHeader
          label="Our Specialization"
          title="Services"
          description="Comprehensive construction and development services delivered with engineering excellence."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {company.services.map((service, i) => (
            <ServiceCard key={service.id} {...service} index={i} />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-corp-green font-semibold hover:gap-3 transition-all"
          >
            View All Services <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <SectionHeader
          label="Recent Portfolio"
          title="Our Architectural Excellence"
          description="Showcasing our commitment to quality, innovation, and precision in every project we deliver."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {company.projects.slice(0, 3).map((project, i) => (
            <ProjectCard key={project.title} {...project} index={i} />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function WhyChooseUsSection() {
  return (
    <section className="section-padding bg-corp-charcoal relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      <div className="container-corp relative">
        <SectionHeader
          label="Why Choose Us"
          title="Built on Excellence, Driven by Integrity"
          description="What sets Hasanur Jaya apart from other construction firms in Brunei."
          light
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {company.whyChooseUs.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-corp-gold/20 text-corp-gold flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-corp">
        <SectionHeader
          label="Premium Materials"
          title="High-Performance Construction Products"
          description="At Hasanur Jaya, we don&apos;t just build; we provide the best materials to ensure longevity and structural integrity."
        />
        <div className="grid md:grid-cols-2 gap-8">
          {company.products.map((product, i) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl border border-gray-100 bg-white p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="font-heading text-2xl font-bold text-corp-charcoal mb-2">{product.name}</h3>
              <p className="text-corp-gold font-medium text-sm mb-4">{product.tagline}</p>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.features.slice(0, 4).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-corp-green shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-corp-green font-semibold text-sm hover:gap-3 transition-all"
              >
                Request Product Information
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
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
            Ready to Build Your Next Project?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Contact our team of experts today for a free consultation and project estimation. Let&apos;s bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 bg-corp-gold hover:bg-corp-gold-light text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <Phone className="w-5 h-5" />
              Request a Free Quote
            </Link>
            <Link
              href="/projects"
              className="group inline-flex items-center justify-center gap-2 border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300"
            >
              Explore Our Projects
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-corp-offwhite to-transparent" />
        <ServicesSection />
      </div>
      <WhyChooseUsSection />
      <ProjectsSection />
      <ProductsSection />
      <CTASection />
    </>
  )
}
