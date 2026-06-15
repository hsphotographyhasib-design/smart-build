'use client'

import { useFormat } from '@/hooks/use-format'
import { useRegion } from '@/components/providers/regional-provider'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Map,
  ChevronDown,
  Headphones,
  HelpCircle,
} from 'lucide-react'
import { ContactForm } from './contact-form'

export default function ContactPage() {
  const { getCallingCode, getCountryName } = useFormat()
  const { country } = useRegion()

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: `${getCallingCode()} 800 BLD`,
      subtitle: 'Mon-Fri 9am-6pm',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'hello@smartbuild.com',
      subtitle: 'We respond within 1 business day',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: MapPin,
      title: 'Office',
      value: '123 Construction Ave, Suite 500',
      subtitle: `${getCountryName()}, Bandar Seri Begawan`,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  const officeDetails = [
    {
      icon: Clock,
      label: 'Business Hours',
      value: 'Mon – Fri: 9:00 AM – 6:00 PM',
      extra: 'Sat: 10:00 AM – 2:00 PM',
    },
    {
      icon: Headphones,
      label: 'Enterprise Support',
      value: '24/7 dedicated support line',
      extra: 'Available for all Enterprise plan clients',
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp',
      value: `${getCallingCode()} 800 BLD`,
      extra: 'Quick questions and live chat support',
    },
  ]

  const faqs = [
    {
      question: 'What is the fastest way to get a response?',
      answer:
        'For the quickest response, call our sales line during business hours (Mon-Fri, 9am-6pm). For non-urgent inquiries, email hello@smartbuild.com and our team will respond within one business day. Enterprise clients have access to 24/7 priority support through their dedicated account manager.',
    },
    {
      question: 'How do I schedule a product demo?',
      answer:
        'You can schedule a demo by selecting "Product Demo" as the subject in the contact form above, or by visiting our Request Demo page. A member of our solutions team will reach out within 24 hours to arrange a personalized walkthrough tailored to your industry and use case. Demos typically last 45-60 minutes.',
    },
    {
      question: 'Do you offer on-site consultations?',
      answer:
        'Yes, we offer complimentary on-site consultations for companies with 50 or more users. Our solutions engineers will visit your office or job site to understand your workflows and provide a customized implementation plan. Contact our sales team to arrange a consultation in your area.',
    },
    {
      question: 'How can I become a SmartBuild partner or reseller?',
      answer:
        'We welcome partnerships with technology providers, consulting firms, and industry associations. Select "Partnership Opportunity" in the contact form above, and our partnerships team will schedule an introductory call. We offer competitive revenue sharing, co-marketing programs, and technical enablement for all qualified partners.',
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-stone-900 to-stone-800 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm text-amber-300 mb-6">
            <Mail className="h-4 w-4" />
            We&apos;d Love to Hear From You
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Get in <span className="text-amber-400">Touch</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-stone-300 leading-relaxed">
            Whether you have a question about our platform, need a custom
            solution, or want to explore partnership opportunities — our team is
            ready to help.
          </p>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-stone-200 bg-white p-6 md:p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div
                  className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${item.color} mb-4`}
                >
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  {item.title}
                </h3>
                <p className="text-lg font-bold text-stone-900 mb-1">
                  {item.value}
                </p>
                <p className="text-sm text-stone-500">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Office Info */}
      <section className="py-16 md:py-20 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-stone-600 mb-8">
                Fill out the form below and a member of our team will get back to
                you promptly.
              </p>
              <ContactForm />
            </div>

            {/* Office Info Sidebar */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
                Office Information
              </h2>
              <div className="space-y-4">
                {officeDetails.map((detail) => (
                  <div
                    key={detail.label}
                    className="rounded-xl border border-stone-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <detail.icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-stone-900">
                        {detail.label}
                      </h3>
                    </div>
                    <p className="text-sm text-stone-700 ml-12">
                      {detail.value}
                    </p>
                    <p className="text-xs text-stone-500 ml-12 mt-0.5">
                      {detail.extra}
                    </p>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="rounded-xl border border-stone-200 bg-stone-100 h-48 flex flex-col items-center justify-center gap-2 text-stone-400">
                <Map className="h-8 w-8" />
                <span className="text-sm font-medium">Map</span>
                <span className="text-xs">
                  123 Construction Ave, Bandar Seri Begawan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-700 mb-4">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-stone-600">
              Common questions about contacting SmartBuild and what to expect
              from our team.
            </p>
          </div>
          <div className="mx-auto max-w-3xl space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-stone-200 bg-white p-6 md:p-8"
              >
                <h3 className="text-lg font-semibold text-stone-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}