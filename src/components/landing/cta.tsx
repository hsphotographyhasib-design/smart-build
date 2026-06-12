'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-20 md:py-28">
      {/* Floating decorative shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-[15%] top-[10%] h-20 w-20 rounded-full bg-white/5" />
        <div className="absolute bottom-[25%] left-[20%] h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute bottom-[15%] right-[10%] h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute left-[50%] top-[5%] h-16 w-16 rounded-full bg-white/10" />
        <div className="absolute left-[5%] bottom-[40%] h-12 w-12 rounded-full bg-white/10" />
        <div className="absolute right-[30%] bottom-[35%] h-14 w-14 rounded-full bg-white/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-white sm:text-4xl md:text-5xl"
        >
          Ready to Transform Your Construction Operations?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-blue-100"
        >
          Join 500+ companies already using SmartBuild to deliver projects
          faster, smarter, and more profitably.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className="h-12 bg-orange-500 px-8 text-base font-semibold text-white shadow-lg hover:bg-orange-600"
          >
            Book a Demo
          </Button>
          <Button
            size="lg"
            className="h-12 bg-white px-8 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50"
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-white/40 bg-transparent px-8 text-base font-semibold text-white hover:border-white hover:bg-white/10"
          >
            Contact Sales
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 text-sm text-blue-200/80"
        >
          No credit card required &middot; Free 14-day trial &middot; Cancel
          anytime
        </motion.p>
      </div>
    </section>
  )
}