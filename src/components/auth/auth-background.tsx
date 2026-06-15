'use client'

import { motion } from 'framer-motion'

const floatingCircles = [
  { size: 350, top: '-8%', left: '8%', delay: 0, duration: 22, color: 'bg-amber-200/20' },
  { size: 250, top: '55%', left: '82%', delay: 2, duration: 17, color: 'bg-orange-200/15' },
  { size: 300, top: '78%', left: '15%', delay: 4, duration: 20, color: 'bg-amber-100/20' },
  { size: 180, top: '18%', left: '68%', delay: 1, duration: 14, color: 'bg-yellow-200/10' },
  { size: 220, top: '38%', left: '3%', delay: 3, duration: 18, color: 'bg-orange-100/15' },
  { size: 160, top: '65%', left: '50%', delay: 5, duration: 16, color: 'bg-amber-200/10' },
]

const particles = [
  { x: '12%', y: '22%', size: 5, delay: 0, duration: 6 },
  { x: '78%', y: '12%', size: 4, delay: 1, duration: 8 },
  { x: '42%', y: '72%', size: 6, delay: 2, duration: 7 },
  { x: '88%', y: '52%', size: 3, delay: 0.5, duration: 9 },
  { x: '22%', y: '88%', size: 5, delay: 1.5, duration: 5 },
  { x: '62%', y: '38%', size: 4, delay: 3, duration: 10 },
  { x: '32%', y: '8%', size: 3, delay: 2.5, duration: 7 },
  { x: '92%', y: '78%', size: 5, delay: 4, duration: 6 },
  { x: '55%', y: '55%', size: 3, delay: 1.8, duration: 8 },
  { x: '8%', y: '48%', size: 4, delay: 3.2, duration: 11 },
]

export function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/30" />

      {/* Construction pattern overlay - very subtle */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23924' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating blur circles */}
      {floatingCircles.map((circle, i) => (
        <motion.div
          key={`circle-${i}`}
          className={`absolute rounded-full ${circle.color}`}
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            filter: 'blur(70px)',
            willChange: 'transform',
          }}
          animate={{
            y: [0, -35, 0, 25, 0],
            x: [0, 18, 0, -12, 0],
            scale: [1, 1.12, 1, 0.88, 1],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: circle.delay,
          }}
        />
      ))}

      {/* Gradient glows — larger, more dramatic */}
      <motion.div
        className="absolute w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[160px]"
        style={{ top: '15%', right: '20%' }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-orange-200/15 rounded-full blur-[140px]"
        style={{ bottom: '20%', left: '25%' }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-yellow-100/20 rounded-full blur-[120px]"
        style={{ top: '50%', left: '60%' }}
        animate={{ scale: [1, 0.9, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />

      {/* Animated particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-amber-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
            willChange: 'transform, opacity',
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 5, 0],
            opacity: [0.15, 0.5, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
