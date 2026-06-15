'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CTA() {
  return (
    <section className="relative w-full bg-black py-24 md:py-32 overflow-hidden">
      {/* Subtle orange glow in top-left corner */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 82, 1, 0.6) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Ready to Transform Your
          <br className="hidden sm:block" /> Construction Operations?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/60 sm:text-lg"
        >
          Join 500+ companies already using SmartBuild to deliver projects
          faster, smarter, and more profitably.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            className={cn(
              'bg-[#ff5201] px-8 text-base font-semibold text-white hover:bg-[#e64a01] active:bg-[#cc4101]',
              'h-12 rounded-md shadow-none transition-colors'
            )}
          >
            Book a Demo
          </Button>

          <Button
            size="lg"
            className={cn(
              'bg-white px-8 text-base font-semibold text-black hover:bg-gray-100 active:bg-gray-200',
              'h-12 rounded-md shadow-none transition-colors'
            )}
          >
            Start Free Trial
          </Button>

          <Button
            size="lg"
            variant="outline"
            className={cn(
              'border-white/30 bg-transparent px-8 text-base font-semibold text-white',
              'h-12 rounded-md hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors'
            )}
          >
            Contact Sales
          </Button>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
          className="mt-8 text-center text-sm text-white/40"
        >
          No credit card required&nbsp;·&nbsp;Free 14-day
          trial&nbsp;·&nbsp;Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}