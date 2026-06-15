'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban,
  AlertTriangle,
  ClipboardList,
  Users,
  DollarSign,
  Wrench,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useFormat } from '@/hooks/use-format'

/* ─────────────── Slide Data ─────────────── */
interface HeroSlide {
  src: string
  alt: string
  label: string
}

const slides: HeroSlide[] = [
  {
    src: '/images/hero/hero-construction.png',
    alt: 'Construction project management dashboard - large scale construction site with steel framework',
    label: 'Construction Management',
  },
  {
    src: '/images/hero/hero-maintenance.png',
    alt: 'HVAC maintenance management software - technicians performing maintenance operations',
    label: 'Maintenance Management',
  },
  {
    src: '/images/hero/hero-facility.png',
    alt: 'Facility management work order tracking - modern office building with management team',
    label: 'Facility Management',
  },
  {
    src: '/images/hero/hero-resource.png',
    alt: 'Construction resource planning platform - digital transformation in construction industry',
    label: 'Resource Planning',
  },
  {
    src: '/images/hero/hero-cost-control.png',
    alt: 'Project cost control and financial management - construction project budget analytics',
    label: 'Project Cost Control',
  },
]

/* ─────────────── Floating Card Data ─────────────── */
interface FloatingCard {
  icon: React.ElementType
  label: string
  value: string
  color: string
  position: string
  delay: number
  isCurrency?: boolean
  currencyValue?: number  // Base BND value for conversion
}

const baseCards: Omit<FloatingCard, 'value'>[] = [
  {
    icon: FolderKanban,
    label: 'Project Progress',
    color: 'from-orange-500/20 to-orange-600/10',
    position: 'top-4 -left-6 lg:top-6 lg:-left-12',
    delay: 0.8,
  },
  {
    icon: AlertTriangle,
    label: 'Open Complaints',
    color: 'from-red-500/20 to-red-600/10',
    position: 'top-1/4 -right-4 lg:top-1/4 lg:-right-14',
    delay: 1.0,
  },
  {
    icon: ClipboardList,
    label: 'Active Work Orders',
    color: 'from-blue-500/20 to-blue-600/10',
    position: 'bottom-1/3 -left-4 lg:bottom-1/3 lg:-left-16',
    delay: 1.2,
  },
  {
    icon: Users,
    label: 'Labour Utilization',
    color: 'from-emerald-500/20 to-emerald-600/10',
    position: 'top-2/3 -right-2 lg:top-2/3 lg:-right-10',
    delay: 1.4,
  },
  {
    icon: DollarSign,
    label: 'Monthly Revenue',
    color: 'from-amber-500/20 to-amber-600/10',
    position: 'bottom-8 left-1/4 lg:bottom-4 lg:left-1/4',
    delay: 1.6,
    isCurrency: true,
    currencyValue: 145000,
  },
  {
    icon: Wrench,
    label: 'Equipment Status',
    color: 'from-cyan-500/20 to-cyan-600/10',
    position: 'top-1/2 left-1/3 lg:top-1/2 lg:left-1/3',
    delay: 1.8,
  },
]

/* ─────────────── Slide Progress Dots ─────────────── */
function SlideDots({
  current,
  total,
  onSelect,
}: {
  current: number
  total: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 h-1.5 bg-orange-400'
              : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  )
}

/* ─────────────── Floating Glassmorphism Card ─────────────── */
function GlassCard({ card, isVisible }: { card: FloatingCard; isVisible: boolean }) {
  const Icon = card.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={
        isVisible
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.7, y: 10 }
      }
      transition={{
        delay: card.delay,
        duration: 0.6,
        ease: 'backOut',
      }}
      className={`absolute z-20 ${card.position} hidden md:block`}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3 + card.delay * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div
          className={`bg-gradient-to-br ${card.color} backdrop-blur-md rounded-xl border border-white/15 shadow-xl shadow-black/10 px-3 py-2.5 min-w-[130px]`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Icon className="w-3 h-3 text-white/80" />
            <span className="text-[10px] text-white/60 font-medium leading-none">{card.label}</span>
          </div>
          <p className="text-white text-base font-bold leading-tight">{card.value}</p>
        </div>
        {/* Subtle glow */}
        <div className="absolute -inset-2 bg-white/5 rounded-2xl blur-xl -z-10" />
      </motion.div>
    </motion.div>
  )
}

/* ─────────────── Hero Visual Component ─────────────── */
export function HeroVisual() {
  const { formatCurrencyCompact, convertAndFormatCompact, currencyCode } = useFormat()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current]
  )

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  // Auto-rotate every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? '30%' : '-30%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? '-30%' : '30%',
      opacity: 0,
      scale: 0.95,
    }),
  }

  // Build cards with dynamic currency values
  const floatingCards: FloatingCard[] = baseCards.map((card) => {
    if (card.isCurrency && card.currencyValue) {
      return {
        ...card,
        value: convertAndFormatCompact(card.currencyValue),
      }
    }
    // Default values for non-currency cards
    switch (card.label) {
      case 'Project Progress':
        return { ...card, value: '87%' }
      case 'Open Complaints':
        return { ...card, value: '24' }
      case 'Active Work Orders':
        return { ...card, value: '156' }
      case 'Labour Utilization':
        return { ...card, value: '92%' }
      case 'Equipment Status':
        return { ...card, value: '98% Active' }
      default:
        return { ...card, value: '' }
    }
  })

  return (
    <div className="relative w-full overflow-hidden">
      {/* Image Carousel Container */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        className="relative w-full aspect-[16/10] lg:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
      >
        {/* Animated background gradient overlay behind image */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-orange-900/30 z-10 pointer-events-none" />

        {/* Image slides */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].src}
              alt={slides[current].alt}
              fill
              priority={current === 0}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom gradient overlay for slide label */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-20 pointer-events-none" />

        {/* Slide label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[current].label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-3 left-4 z-30"
          >
            <span className="text-white/80 text-xs font-medium bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
              {slides[current].label}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Floating glassmorphism cards */}
        {floatingCards.map((card, i) => (
          <GlassCard key={i} card={card} isVisible={true} />
        ))}

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 transition-all opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/40 transition-all opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Decorative border */}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 z-20 pointer-events-none" />
      </motion.div>

      {/* Slide controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex items-center justify-center gap-4 mt-4"
      >
        <SlideDots current={current} total={slides.length} onSelect={goTo} />
      </motion.div>
    </div>
  )
}
