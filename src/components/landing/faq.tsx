'use client'

import { Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'What is SmartBuild?',
    answer:
      'SmartBuild is an all-in-one construction management platform that helps companies manage projects, finances, procurement, workforce, assets, and client communication from a single integrated system.',
  },
  {
    question: 'Who is SmartBuild for?',
    answer:
      'SmartBuild is designed for construction companies, contractors, developers, MEP contractors, facility managers, and government agencies of all sizes.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most teams are up and running within 1-2 weeks. Our dedicated onboarding team ensures a smooth transition with data migration, training, and ongoing support.',
  },
  {
    question: 'Can I use SmartBuild on mobile?',
    answer:
      'Yes! SmartBuild offers native iOS and Android apps with full project management, attendance tracking, photo documentation, and offline support.',
  },
  {
    question: 'Can clients access project data?',
    answer:
      'Yes, our Client Portal gives your clients real-time visibility into project progress, documents, invoices, and communication.',
  },
  {
    question: 'How secure is SmartBuild?',
    answer:
      'SmartBuild uses AES-256 encryption, role-based access controls, audit logging, and operates on enterprise cloud infrastructure with 99.9% uptime guarantee.',
  },
  {
    question: 'Can it replace my spreadsheets?',
    answer:
      'Absolutely. SmartBuild eliminates the need for multiple spreadsheets by providing integrated modules for project tracking, financial management, procurement, and reporting.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'We provide 24/7 support via chat, email, and phone, along with a comprehensive knowledge base, video tutorials, and dedicated account managers.',
  },
]

function FAQAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-start justify-between gap-4 py-5 text-left text-base font-medium text-gray-900 transition-all outline-none hover:text-blue-600 [&[data-state=open]>span.icon-plus]:hidden [&[data-state=open]>span.icon-minus]:block [&[data-state=closed]>span.icon-plus]:block [&[data-state=closed]>span.icon-minus]:hidden',
          className
        )}
        {...props}
      >
        {children}
        <span className="icon-plus mt-0.5 shrink-0">
          <Plus className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600" />
        </span>
        <span className="icon-minus hidden mt-0.5 shrink-0">
          <Minus className="h-5 w-5 text-blue-600" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function FAQAccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-b border-gray-200', className)}
      {...props}
    />
  )
}

function FAQAccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
      {...props}
    >
      <div className={cn('pb-5 text-sm leading-relaxed text-gray-500', className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export function FAQ() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Everything you need to know about SmartBuild
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-14"
        >
          <AccordionPrimitive.Root type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <FAQAccordionItem key={index} value={`item-${index}`}>
                <FAQAccordionTrigger>{faq.question}</FAQAccordionTrigger>
                <FAQAccordionContent>{faq.answer}</FAQAccordionContent>
              </FAQAccordionItem>
            ))}
          </AccordionPrimitive.Root>
        </motion.div>
      </div>
    </section>
  )
}