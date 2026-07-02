"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Package, CheckCircle, ArrowRight, Building2, HardHat } from "lucide-react"
import SectionHeader from "@/components/corporate/section-header"
import { company } from "@/lib/corporate-data"

export default function ProductsPage() {
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
              <Package className="w-5 h-5" />Our Range
            </span>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Construction Products
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
              High-quality construction materials and solutions engineered for durability, performance, and sustainability.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-corp-offwhite section-padding">
        <div className="container-corp">
          <SectionHeader
            label="Quality Commitment"
            title="Engineered for Excellence"
            description="Every product we offer is rigorously tested and selected to meet the highest standards of quality and performance. We partner with leading manufacturers to bring you solutions you can trust."
          />

          <div className="space-y-20 lg:space-y-28">
            {company.products.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`flex flex-col ${i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-16 items-start`}
              >
                <div className="w-full lg:w-5/12">
                  <div className="sticky top-28">
                    <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-corp-green to-corp-charcoal flex items-center justify-center mb-6 shadow-xl">
                      <Building2 className="w-24 h-24 text-white/20" />
                    </div>
                    <h2 className="font-heading text-3xl md:text-4xl font-bold text-corp-charcoal mb-2">
                      {product.name}
                    </h2>
                    <p className="text-corp-green font-semibold text-lg mb-4">
                      {product.tagline}
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-7/12 space-y-10">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-6 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-corp-green" />
                      Key Features
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {product.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-corp-green/20 transition-all duration-300"
                        >
                          <CheckCircle className="w-5 h-5 text-corp-green shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-6 flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-corp-gold" />
                      Applications
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {product.applications.map((app) => (
                        <div
                          key={app}
                          className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                        >
                          <span className="w-2 h-2 rounded-full bg-corp-gold shrink-0" />
                          <span className="text-gray-700 text-sm">{app}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-corp-green text-white font-semibold px-6 py-3 rounded-full hover:bg-corp-green/90 transition-all duration-300 hover:shadow-xl hover:shadow-corp-green/20 group"
                  >
                    Request Information
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-corp-charcoal section-padding overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-corp-charcoal via-corp-charcoal to-corp-gold/10" />
        <div className="relative container-corp text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
              Need Custom Product Solutions?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Our technical team can help you select the right products for your specific project requirements.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-corp-gold text-corp-charcoal font-bold px-8 py-4 rounded-full hover:bg-corp-gold/90 transition-all duration-300 hover:shadow-xl hover:shadow-corp-gold/20 group"
            >
              Contact Our Team
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
