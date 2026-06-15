'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Brain, ArrowRight, Sparkles, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

/* ------------------------------------------------------------------ */
/*  Typewriter hook                                                    */
/* ------------------------------------------------------------------ */

function useTypewriter(text: string, speed = 20, startDelay = 0, enabled = false) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) {
      setDisplayed('')
      setDone(false)
      return
    }
    let i = 0
    const timeout = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          setDone(true)
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }, speed)
    }, startDelay)
    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, speed, startDelay, enabled])

  return { displayed, done }
}

/* ------------------------------------------------------------------ */
/*  AI Chat Mockup                                                     */
/* ------------------------------------------------------------------ */

const aiFeatures = [
  'Labour demand forecasting across projects',
  'Project cost prediction and budget optimization',
  'Delay risk analysis and early warning',
  'Automated report generation',
  'Predictive maintenance scheduling',
  'Anomaly detection in financial data',
]

const userMessage = "What's the delay risk for Project Alpha?"
const aiResponse =
  'Based on current progress, Project Alpha has a 23% probability of exceeding the deadline. Critical path activities in structural work are 4 days behind schedule. Recommended action: Reallocate 2 additional crews to the structural team.'

function AIChatMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const { displayed, done } = useTypewriter(aiResponse, 18, 800, isInView)

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -inset-4 bg-amber-500/10 rounded-3xl blur-2xl" />

      <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">SmartBuild AI</h4>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="space-y-4">
          {/* User message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex items-start gap-2.5"
          >
            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-3 h-3 text-slate-300" />
            </div>
            <div className="bg-slate-700/60 rounded-xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
              <p className="text-[13px] text-slate-200 leading-relaxed">{userMessage}</p>
            </div>
          </motion.div>

          {/* AI response */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex items-start gap-2.5"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-amber-400" />
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
              <p className="text-[13px] text-slate-200 leading-relaxed">
                {displayed}
                {!done && isInView && (
                  <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            </div>
          </motion.div>

          {/* Quick suggestion pills */}
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap gap-1.5 pl-8"
            >
              {['Forecast labour', 'Cost analysis', 'Risk report'].map((s) => (
                <span
                  key={s}
                  className="text-[10px] text-slate-400 border border-slate-600/50 rounded-full px-2.5 py-1 cursor-pointer hover:border-amber-500/40 hover:text-amber-400 transition-colors"
                >
                  {s}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export function AISection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-slate-950 py-24" id="ai">
      <div
        ref={ref}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                SmartBuild AI
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5">
              AI-Powered Construction Intelligence
            </h2>

            <p className="text-slate-400 text-base leading-relaxed mb-8">
              Harness artificial intelligence to forecast costs, predict delays, optimize
              resources, and generate insights that keep your projects on track.
            </p>

            <ul className="space-y-3.5 mb-8">
              {aiFeatures.map((feature, i) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg gap-2 group">
              Explore AI Features
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Right: AI Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AIChatMockup />
          </motion.div>
        </div>
      </div>
    </section>
  )
}