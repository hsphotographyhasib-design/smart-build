'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'How does SmartBuild compare to Procore or Primavera P6?',
    a: 'SmartBuild combines the deep scheduling power of Primavera P6 with the user-friendly project management of Procore, plus AI-powered analytics, facility management, and multi-company portfolio oversight — all in one platform. Unlike point solutions, SmartBuild eliminates data silos and provides true end-to-end visibility.',
  },
  {
    q: 'Can we import existing project data from other tools?',
    a: 'Yes. SmartBuild supports direct import from Primavera P6, MS Project, and Excel. Our migration team provides white-glove data migration assistance, and our API supports integration with any third-party system.',
  },
  {
    q: 'How long does a typical implementation take?',
    a: 'Most enterprise deployments go live in 4-8 weeks. This includes environment setup, data migration, configuration, training, and go-live support. We follow an agile implementation methodology with weekly checkpoints.',
  },
  {
    q: 'Is SmartBuild suitable for small to mid-size contractors?',
    a: 'Absolutely. SmartBuild is designed to scale. Our Starter plan is built for growing contractors who need professional project management without enterprise complexity. As your business grows, you can seamlessly upgrade to access advanced modules.',
  },
  {
    q: 'What security and compliance certifications do you have?',
    a: 'SmartBuild is SOC 2 Type II certified, ISO 27001 compliant, and supports GDPR and PDPA data protection requirements. We offer on-premise and private cloud deployment options for clients with additional security requirements.',
  },
  {
    q: 'Do you offer mobile apps for field teams?',
    a: 'Yes. SmartBuild includes native mobile apps for iOS and Android with offline-first capability. Field teams can capture daily reports, photos, safety observations, and time sheets even without connectivity, with automatic sync when back online.',
  },
  {
    q: 'What kind of support do you provide?',
    a: 'We provide 24/7 technical support via chat, email, and phone. Enterprise clients receive a dedicated Customer Success Manager, priority support queue, quarterly business reviews, and access to our Professional Services team.',
  },
]

export function LandingFAQ() {
  return (
    <section className="section-landing bg-background" aria-label="Frequently Asked Questions">
      <div className="container-landing">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.span
              className="inline-block text-sm font-semibold text-brand-orange uppercase tracking-widest mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              FAQ
            </motion.span>
            <motion.h2
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              Frequently asked questions
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-lg px-5 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
