'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Faq } from './types';

const defaultFaqs: Faq[] = [
  {
    id: '1',
    question: 'What is SmartBuild and who is it for?',
    answer:
      'SmartBuild is an enterprise-grade construction management platform designed for general contractors, project managers, and construction firms of all sizes. It centralizes project planning, resource management, financial tracking, and field operations into a single unified system.',
    category: 'General',
  },
  {
    id: '2',
    question: 'How long does it take to implement SmartBuild?',
    answer:
      'Most teams are up and running within 2-4 weeks. Our onboarding specialists work closely with your team to migrate existing data, configure workflows, and provide hands-on training. Enterprise deployments with custom integrations typically take 6-8 weeks.',
    category: 'Getting Started',
  },
  {
    id: '3',
    question: 'Can SmartBuild integrate with our existing tools?',
    answer:
      'Yes. SmartBuild offers native integrations with popular accounting software (QuickBooks, Sage, Procore), ERP systems, BIM tools, and scheduling platforms. We also provide a robust REST API and webhook support for custom integrations.',
    category: 'Integrations',
  },
  {
    id: '4',
    question: 'Is my data secure on the SmartBuild platform?',
    answer:
      'Absolutely. SmartBuild is SOC 2 Type II certified and uses AES-256 encryption at rest and TLS 1.3 in transit. We offer role-based access control, audit logging, SSO/SAML support, and optional on-premise deployment for enterprise customers.',
    category: 'Security',
  },
  {
    id: '5',
    question: 'What kind of support do you offer?',
    answer:
      'We offer tiered support: Community support for free plans, email and chat support for Starter and Professional plans, and dedicated 24/7 phone support with a named account manager for Enterprise customers. All plans include access to our comprehensive knowledge base and video tutorials.',
    category: 'Support',
  },
  {
    id: '6',
    question: 'Can I try SmartBuild before committing?',
    answer:
      'Yes! We offer a 14-day free trial with full access to all Professional plan features. No credit card required. You can also schedule a personalized demo with our solutions team to see how SmartBuild fits your specific workflow.',
    category: 'Pricing',
  },
];

interface FaqSectionProps {
  config: Record<string, any>;
  faqs?: Faq[];
}

export function FaqSection({ config, faqs }: FaqSectionProps) {
  const items: Faq[] = faqs?.length ? faqs : defaultFaqs;

  const headline = config?.headline || 'Frequently Asked Questions';
  const subheadline =
    config?.subheadline ||
    'Find answers to common questions about SmartBuild and how it can transform your construction operations.';

  return (
    <section className="section-padding bg-white">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0B2345] sm:text-4xl lg:text-5xl">
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            {subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto max-w-3xl"
        >
          <Accordion type="single" collapsible className="w-full">
            {items.map((faq, index) => (
              <AccordionItem
                key={faq.id || index}
                value={faq.id || String(index)}
                className="border-[#0B2345]/10"
              >
                <AccordionTrigger className="font-heading text-left text-base font-semibold text-[#0B2345] hover:no-underline hover:text-[#F5A623] sm:text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm leading-relaxed text-[#0B2345]/70">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
