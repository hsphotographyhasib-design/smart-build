'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Check,
  X,
  ArrowRight,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import * as AccordionPrimitive from '@radix-ui/react-accordion'

/* ─────────────────────── data ─────────────────────── */

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 23,
    description: 'Perfect for small teams getting started with construction management.',
    popular: false,
    buttonLabel: 'Get Started',
    buttonVariant: 'outline' as const,
    buttonHref: '/contact',
    features: [
      'Up to 10 users',
      '5 projects',
      'Basic project management',
      'Invoicing',
      'Mobile app',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    monthlyPrice: 79,
    annualPrice: 63,
    description: 'For growing teams that need the full suite of tools.',
    popular: true,
    buttonLabel: 'Start Free Trial',
    buttonVariant: 'default' as const,
    buttonHref: '/contact',
    features: [
      'Up to 50 users',
      'Unlimited projects',
      'Full project management',
      'Resource management',
      'Procurement',
      'Finance suite',
      'Client portal',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    monthlyPrice: 149,
    annualPrice: 119,
    description: 'For large organizations with advanced needs.',
    popular: false,
    buttonLabel: 'Contact Sales',
    buttonVariant: 'outline' as const,
    buttonHref: '/contact',
    features: [
      'Unlimited users',
      'Everything in Professional',
      'AI assistant',
      'Custom workflows',
      'API access',
      'Dedicated account manager',
      '24/7 phone support',
      'SLA guarantee',
    ],
  },
  {
    name: 'Custom',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Tailored solutions for unique business requirements.',
    popular: false,
    buttonLabel: 'Request Quote',
    buttonVariant: 'default' as const,
    buttonHref: '/contact',
    custom: true,
    features: [
      'All Enterprise features',
      'Custom integrations',
      'On-premise option',
      'Custom training',
      'White-label option',
    ],
  },
]

const comparisonFeatures = [
  { category: 'Users & Projects', items: [
    { name: 'Max users', starter: '10', professional: '50', enterprise: 'Unlimited', custom: 'Unlimited' },
    { name: 'Max projects', starter: '5', professional: 'Unlimited', enterprise: 'Unlimited', custom: 'Unlimited' },
  ]},
  { category: 'Core Features', items: [
    { name: 'Project management', starter: 'Basic', professional: true, enterprise: true, custom: true },
    { name: 'Invoicing', starter: true, professional: true, enterprise: true, custom: true },
    { name: 'Resource management', starter: false, professional: true, enterprise: true, custom: true },
    { name: 'Procurement', starter: false, professional: true, enterprise: true, custom: true },
    { name: 'Finance suite', starter: false, professional: true, enterprise: true, custom: true },
    { name: 'Client portal', starter: false, professional: true, enterprise: true, custom: true },
    { name: 'Mobile app', starter: true, professional: true, enterprise: true, custom: true },
  ]},
  { category: 'Advanced Features', items: [
    { name: 'AI assistant', starter: false, professional: false, enterprise: true, custom: true },
    { name: 'Custom workflows', starter: false, professional: false, enterprise: true, custom: true },
    { name: 'API access', starter: false, professional: false, enterprise: true, custom: true },
    { name: 'Custom integrations', starter: false, professional: false, enterprise: false, custom: true },
    { name: 'On-premise option', starter: false, professional: false, enterprise: false, custom: true },
    { name: 'White-label option', starter: false, professional: false, enterprise: false, custom: true },
  ]},
  { category: 'Support', items: [
    { name: 'Email support', starter: true, professional: true, enterprise: true, custom: true },
    { name: 'Priority support', starter: false, professional: true, enterprise: true, custom: true },
    { name: '24/7 phone support', starter: false, professional: false, enterprise: true, custom: true },
    { name: 'Dedicated account manager', starter: false, professional: false, enterprise: true, custom: true },
    { name: 'SLA guarantee', starter: false, professional: false, enterprise: true, custom: true },
    { name: 'Custom training', starter: false, professional: false, enterprise: false, custom: true },
  ]},
]

const faqs = [
  {
    question: 'Can I switch plans at any time?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new rate takes effect immediately and we prorate the difference. When downgrading, the change takes effect at the end of your current billing cycle so you keep access to all features until then.',
  },
  {
    question: 'What happens when I exceed my plan limits?',
    answer: 'We will notify you when you are approaching your limits. For the Starter plan, you will be prompted to upgrade. For all paid plans, we offer a grace period of 14 days before requiring an upgrade, so your team is never interrupted.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'Yes! We offer a 14-day free trial on the Professional plan with full access to all features. No credit card is required to start. At the end of the trial, you can choose any plan that fits your needs.',
  },
  {
    question: 'Do you offer discounts for non-profits or education?',
    answer: 'Absolutely. We offer special pricing for registered non-profit organizations, educational institutions, and government agencies. Contact our sales team to learn more about eligibility and available discounts.',
  },
  {
    question: 'How does annual billing work?',
    answer: 'Annual billing is paid upfront for the full year and gives you a 20% discount compared to monthly billing. You can pay via credit card, bank transfer, or purchase order. Annual plans are billed on the same date each year.',
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a 30-day money-back guarantee on all plans. If you are not satisfied within the first 30 days, contact our support team for a full refund. For annual plans, we also offer prorated refunds after the 30-day window.',
  },
]

/* ─────────────────── helper components ─────────────────── */

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-emerald-500" />
    ) : (
      <X className="mx-auto h-5 w-5 text-gray-300" />
    )
  }
  return <span className="text-sm text-gray-700">{value}</span>
}

function FAQAccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          'group flex flex-1 items-start justify-between gap-4 py-5 text-left text-base font-medium text-gray-900 transition-all outline-none hover:text-amber-600 [&[data-state=open]>span.icon-plus]:hidden [&[data-state=open]>span.icon-minus]:block [&[data-state=closed]>span.icon-plus]:block [&[data-state=closed]>span.icon-minus]:hidden',
          className
        )}
        {...props}
      >
        {children}
        <span className="icon-plus mt-0.5 shrink-0">
          <Plus className="h-5 w-5 text-gray-400 transition-colors group-hover:text-amber-600" />
        </span>
        <span className="icon-minus hidden mt-0.5 shrink-0">
          <Minus className="h-5 w-5 text-amber-600" />
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

/* ─────────────────────── main page ─────────────────────── */

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 to-white py-16 md:py-24">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #d97706 1px, transparent 1px), linear-gradient(to bottom, #d97706 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Choose the plan that fits your team. No hidden fees. No surprises.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium transition-all',
                  !isAnnual
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium transition-all',
                  isAnnual
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                Annual
                <span className="ml-1.5 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="relative -mt-4 pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'relative flex flex-col rounded-2xl border p-8 transition-shadow hover:shadow-lg',
                  plan.popular
                    ? 'border-amber-500 ring-2 ring-amber-500 shadow-amber-500/10 shadow-lg'
                    : 'border-gray-200 bg-white'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-amber-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {plan.custom ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">Let&apos;s Talk</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-sm text-gray-500">/user/month</span>
                    </div>
                  )}
                  {!plan.custom && isAnnual && (
                    <p className="mt-1 text-xs text-emerald-600 font-medium">
                      Billed annually (${(plan.annualPrice * 12).toLocaleString()}/user/year)
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.buttonHref}>
                  {plan.popular ? (
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all"
                      size="lg"
                    >
                      {plan.buttonLabel}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant={plan.buttonVariant}
                      className={cn(
                        'w-full',
                        plan.custom && 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md hover:shadow-lg transition-all'
                      )}
                      size="lg"
                    >
                      {plan.buttonLabel}
                    </Button>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare Plans ── */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Compare Plans
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              A detailed look at what each plan includes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-[30%]">
                      Features
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-amber-600">
                      Professional
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Enterprise
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Custom
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((group) => (
                    <Fragment key={group.category}>
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50"
                        >
                          {group.category}
                        </td>
                      </tr>
                      {group.items.map((item) => (
                        <tr key={item.name} className="border-b border-gray-100 last:border-0">
                          <td className="px-6 py-3.5 text-sm font-medium text-gray-700">
                            {item.name}
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <CellValue value={item.starter} />
                          </td>
                          <td className="px-6 py-3.5 text-center bg-amber-50/30">
                            <CellValue value={item.professional} />
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <CellValue value={item.enterprise} />
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <CellValue value={item.custom} />
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden p-4 space-y-4">
              {['Starter', 'Professional', 'Enterprise', 'Custom'].map((planName) => {
                const planKey = planName.toLowerCase() as keyof (typeof comparisonFeatures[0]['items'][number])
                return (
                  <div key={planName} className={cn(
                    'rounded-xl border p-4',
                    planName === 'Professional' ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'
                  )}>
                    <h4 className={cn(
                      'text-sm font-bold mb-3',
                      planName === 'Professional' ? 'text-amber-700' : 'text-gray-900'
                    )}>
                      {planName}
                    </h4>
                    <div className="space-y-2">
                      {comparisonFeatures.flatMap((g) => g.items).map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-2">
                          <span className="text-sm text-gray-600 truncate">{item.name}</span>
                          <CellValue value={item[planKey]} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
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
              Pricing FAQ
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
              Common questions about our pricing and billing
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

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Not Sure Which Plan?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-amber-100">
              Our team can help you find the perfect fit for your construction business. Get a personalized recommendation in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-amber-50 shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  Talk to Our Team
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}