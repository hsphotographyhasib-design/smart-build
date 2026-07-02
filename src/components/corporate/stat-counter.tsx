"use client"

import { useEffect, useRef } from "react"
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"

interface StatCounterProps {
  value: number
  suffix?: string
  label: string
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (inView) {
      animate(count, value, { duration: 2, ease: "easeOut" })
    }
  }, [inView, count, value])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export default function StatCounter({ value, suffix = "", label }: StatCounterProps) {
  return (
    <div className="text-center">
      <div className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-corp-gold mb-2">
        <Counter value={value} suffix={suffix} />
      </div>
      <div className="text-sm md:text-base font-medium text-gray-600">{label}</div>
    </div>
  )
}
