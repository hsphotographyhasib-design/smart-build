'use client'

import { useState } from 'react'
import { useFormat } from '@/hooks/use-format'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  ChevronDown,
  Map,
  CheckCircle2,
  Loader2,
} from 'lucide-react'

const subjectOptions = [
  'General Inquiry',
  'Sales & Pricing',
  'Product Demo',
  'Technical Support',
  'Partnership Opportunity',
  'Press & Media',
  'Careers',
  'Other',
]

export function ContactForm() {
  const { getPhonePlaceholder } = useFormat()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          requirements: `[${formData.subject}] ${formData.message}`,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError('Failed to send message. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 md:p-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900 mb-2">
          Message Sent Successfully
        </h3>
        <p className="text-stone-600 mb-6">
          Thank you for reaching out. Our team will review your inquiry and get
          back to you within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setFormData({
              name: '',
              email: '',
              company: '',
              phone: '',
              subject: '',
              message: '',
            })
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
        >
          Send Another Message
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-stone-200 bg-white p-6 md:p-8 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Smith"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="john@company.com"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your Company Name"
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={getPhonePlaceholder()}
            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="subject"
          className="block text-sm font-medium text-stone-700 mb-1.5"
        >
          Subject <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full appearance-none rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
          >
            <option value="">Select a subject</option>
            {subjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        </div>
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-stone-700 mb-1.5"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us how we can help you..."
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors resize-y"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-orange-400 hover:shadow-amber-500/40 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}