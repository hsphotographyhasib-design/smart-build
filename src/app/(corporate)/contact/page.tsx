"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Facebook, Linkedin, Send, MessageCircle, CheckCircle } from "lucide-react"
import { company } from "@/lib/corporate-data"
import SectionHeader from "@/components/corporate/section-header"

const subjects = ["General Inquiry", "Project Quote", "Partnership", "Careers", "Other"]

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

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
            label="Get In Touch"
            title="Contact Us"
            description="Have a project in mind? We'd love to hear from you. Reach out to our team for a consultation."
            light
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-corp">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-corp-green/5 border border-corp-green/20 p-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-corp-green/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-corp-green" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-corp-charcoal mb-3">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-corp-charcoal mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-corp-green focus:ring-2 focus:ring-corp-green/10 outline-none transition text-sm"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-corp-charcoal mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-corp-green focus:ring-2 focus:ring-corp-green/10 outline-none transition text-sm"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-corp-charcoal mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-corp-green focus:ring-2 focus:ring-corp-green/10 outline-none transition text-sm"
                        placeholder="+673 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-corp-charcoal mb-2">Subject</label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-corp-green focus:ring-2 focus:ring-corp-green/10 outline-none transition text-sm text-gray-600"
                      >
                        <option value="">Select a subject</option>
                        {subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-corp-charcoal mb-2">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-corp-green focus:ring-2 focus:ring-corp-green/10 outline-none transition text-sm resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group inline-flex items-center gap-2 bg-corp-green hover:bg-corp-green-light text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Info Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="rounded-2xl bg-corp-charcoal p-8 lg:p-10 space-y-8 sticky top-28">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white mb-6">Contact Information</h3>
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-corp-gold/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-corp-gold" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Address</div>
                        <div className="text-white text-sm leading-relaxed">{company.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-corp-gold/20 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-corp-gold" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Phone</div>
                        <a href={`tel:${company.phone}`} className="text-white text-sm hover:text-corp-gold transition">{company.phone}</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-corp-gold/20 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-corp-gold" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Email</div>
                        <a href={`mailto:${company.email}`} className="text-white text-sm hover:text-corp-gold transition">{company.email}</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-corp-gold/20 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-corp-gold" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Business Hours</div>
                        <div className="text-white text-sm leading-relaxed">{company.hours}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <div className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-4">Follow Us</div>
                  <div className="flex gap-3">
                    <a
                      href={company.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-corp-gold hover:text-white transition-all"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href={company.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-corp-gold hover:text-white transition-all"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <a
                    href={`https://wa.me/${company.phone.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-xl px-5 py-3.5 transition-all"
                  >
                    <MessageCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-xs text-green-400 font-semibold">Chat on WhatsApp</div>
                      <div className="text-white text-xs">Quick replies during business hours</div>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section-padding bg-corp-offwhite">
        <div className="container-corp">
          <SectionHeader
            label="Our Location"
            title="Find Us"
            description="Conveniently located in the heart of Bandar Seri Begawan."
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden shadow-lg border border-gray-100"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3971.463530979142!2d114.941787!3d4.903052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNTQnMTEuMCJOIDExNMKwNTYnMzAuNCJF!5e0!3m2!1sen!2sbn!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hasanur Jaya Sdn Bhd Location"
            />
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Floating Button */}
      <motion.a
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        href={`https://wa.me/${company.phone.replace(/\s/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shadow-xl hover:bg-green-600 hover:scale-110 transition-all duration-300"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </motion.a>
    </>
  )
}
