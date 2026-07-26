'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.floor(eased * value)
      setDisplay(start)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString()}{suffix}
    </span>
  )
}

const STATS = [
  { value: 500, suffix: '+', label: 'Projects Delivered' },
  { value: 99.9, suffix: '%', label: 'Platform Uptime' },
  { value: 40, suffix: '%', label: 'Faster Reporting' },
  { value: 15, suffix: 'M+', label: 'Square Meters Managed' },
]

export function LandingStatistics() {
  return (
    <section className="section-landing bg-muted/30" aria-label="Statistics">
      <div className="container-landing">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gradient">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
