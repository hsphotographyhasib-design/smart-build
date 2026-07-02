"use client"

import { motion } from "framer-motion"
import { Shield, Award, Leaf, CheckCircle, AlertTriangle, ClipboardCheck, Droplets } from "lucide-react"
import { company } from "@/lib/corporate-data"
import SectionHeader from "@/components/corporate/section-header"

const safetyStats = [
  { value: "0", label: "Lost Time Incidents", sub: "Industry-leading safety record", icon: Shield },
  { value: "100%", label: "Regulatory Compliance", sub: "Full adherence to WSH standards", icon: ClipboardCheck },
  { value: "ISO", label: "Certified Standards", sub: "Quality & safety management", icon: Award },
]

export default function SafetyPage() {
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
            label="Health, Safety & Quality"
            title="Health, Safety & Quality"
            description="Safety is not just a policy — it's a core value that guides everything we do at Hasanur Jaya."
            light
          />
        </div>
      </section>

      {/* Commitment */}
      <section className="section-padding bg-white">
        <div className="container-corp">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-corp-gold text-xs font-semibold tracking-[0.2em] uppercase mb-4">
                Our Commitment
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-corp-charcoal leading-tight mb-6">
                Safety First, <span className="text-corp-green">Always</span>
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {company.safety.commitment}
              </p>
              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-corp-green/5 border border-corp-green/10">
                <Shield className="w-8 h-8 text-corp-green shrink-0" />
                <div>
                  <div className="font-heading font-bold text-corp-charcoal">Zero Harm Philosophy</div>
                  <div className="text-sm text-gray-500">Every incident is preventable, every life matters.</div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-corp-green/10 to-corp-charcoal/10 flex items-center justify-center border border-gray-100">
                <Shield className="w-32 h-32 text-corp-green/20" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-28 h-28 rounded-2xl bg-corp-green flex items-center justify-center shadow-xl">
                <div className="text-center text-white">
                  <div className="text-2xl font-heading font-bold">28+</div>
                  <div className="text-[10px] leading-tight">Years Safe</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionHeader
                label="Safety Framework"
                title="Safety Policies"
                description="Our comprehensive safety policies ensure every team member returns home safe, every day."
                center={false}
              />
              <div className="space-y-4">
                {company.safety.policies.map((policy, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-start gap-4 rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-md transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-corp-green/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-corp-green" />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed pt-1">{policy}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Quality */}
              <div className="rounded-2xl bg-white border border-gray-100 p-8 hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-xl bg-corp-gold/10 flex items-center justify-center mb-5">
                  <Award className="w-6 h-6 text-corp-gold" />
                </div>
                <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-4">Quality Assurance</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{company.safety.quality}</p>
              </div>
              {/* Environment */}
              <div className="rounded-2xl bg-white border border-gray-100 p-8 hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-5">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-heading text-xl font-bold text-corp-charcoal mb-4">Environmental Responsibility</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{company.safety.environment}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-corp-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container-corp relative">
          <SectionHeader
            label="Our Track Record"
            title="Safety by the Numbers"
            description="Our commitment to safety is reflected in our outstanding record."
            light
          />
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {safetyStats.map((stat, i) => {
              const StatIcon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 text-center hover:bg-white/10 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-corp-gold/20 flex items-center justify-center mx-auto mb-5">
                    <StatIcon className="w-7 h-7 text-corp-gold" />
                  </div>
                  <div className="font-heading text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-corp-gold font-semibold text-sm mb-2">{stat.label}</div>
                  <div className="text-gray-400 text-xs">{stat.sub}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
