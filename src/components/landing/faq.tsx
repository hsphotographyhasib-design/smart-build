'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What is SmartBuild?',
    answer:
      'SmartBuild is a comprehensive construction management platform that helps companies streamline project management, finance, procurement, HR, and operations — all from a single integrated system. It replaces scattered tools and spreadsheets with one powerful platform.',
  },
  {
    question: 'Who is SmartBuild designed for?',
    answer:
      'SmartBuild is built for construction companies, real estate developers, contractors, and infrastructure firms of all sizes — from growing teams of 10 to enterprises with 500+ employees managing multiple projects simultaneously.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most teams are up and running within 2–4 weeks. Our onboarding team handles data migration, configuration, and training. Complex enterprise deployments with custom integrations typically take 4–8 weeks.',
  },
  {
    question: 'Does SmartBuild work on mobile devices?',
    answer:
      'Yes. SmartBuild is fully responsive and works on smartphones, tablets, and desktops. Field workers can access project details, log attendance, upload photos, and update task status directly from their mobile browser or our progressive web app.',
  },
  {
    question: 'Can my clients access project updates?',
    answer:
      'Absolutely. SmartBuild includes a branded client portal where your clients can view real-time project progress, milestones, documents, and invoices — reducing status-update calls and improving transparency.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'Very secure. We use AES-256 encryption at rest, TLS 1.3 in transit, role-based access controls, and comprehensive audit logs. Our infrastructure is hosted on enterprise cloud providers with 99.9% uptime SLA, and we are SOC 2 compliant and GDPR ready.',
  },
  {
    question: 'Can SmartBuild replace our spreadsheets?',
    answer:
      'Yes — that is one of the primary reasons teams switch to SmartBuild. Our platform eliminates manual spreadsheet tracking for project costs, labour, inventory, and reporting with automated, real-time dashboards that reduce errors and save hours every week.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'We offer 24/7 priority support via chat, email, and phone for all plans. Every account gets a dedicated onboarding specialist, and enterprise plans include a named account manager, custom training sessions, and priority SLA with guaranteed response times.',
  },
]

export function FAQ() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Everything you need to know about SmartBuild
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-14"
        >
          <AccordionPrimitive.Root type="single" collapsible className="divide-y divide-[#e2e8f0]">
            {faqs.map((faq, i) => (
              <AccordionPrimitive.Item key={i} value={`item-${i}`}>
                <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between py-5 text-left transition-colors hover:text-[#ff5201] data-[state=open]:text-[#ff5201]">
                  <span className="pr-4 text-sm font-semibold text-black sm:text-base">
                    {faq.question}
                  </span>
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <Plus className="h-4 w-4 text-[#595552] transition-transform duration-300 group-data-[state=open]:rotate-90 group-data-[state=open]:scale-0" />
                    <Minus className="absolute h-4 w-4 text-[#ff5201] scale-0 transition-transform duration-300 group-data-[state=open]:scale-100" />
                  </span>
                </AccordionPrimitive.Trigger>
                <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <div className="pb-5 text-sm leading-relaxed text-gray-500">
                    {faq.answer}
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </motion.div>
      </div>
    </section>
  )
}