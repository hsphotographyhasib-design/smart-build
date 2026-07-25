/**
 * AI Features Section
 * Displays 6 AI-powered feature cards with glow hover effects.
 */
'use client';

import { motion } from 'framer-motion';
import { Brain, BarChart3, Search, MessageSquare, Wrench, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const defaultFeatures = [
  { icon: Brain, title: 'AI Scheduling', description: 'Automatically plan and optimize your team\'s schedule using intelligent algorithms that learn from your workflow patterns.' },
  { icon: BarChart3, title: 'AI Reports', description: 'Generate comprehensive reports in seconds with AI-powered data analysis, trend detection, and visual summaries.' },
  { icon: Search, title: 'AI Analytics', description: 'Uncover hidden insights in your data with advanced machine learning models that predict trends and anomalies.' },
  { icon: MessageSquare, title: 'AI Search', description: 'Find anything instantly with natural language search that understands context, intent, and semantic meaning.' },
  { icon: Wrench, title: 'AI Maintenance', description: 'Predict and prevent issues before they occur with AI-driven monitoring, diagnostics, and auto-remediation.' },
  { icon: Sparkles, title: 'AI Assistant', description: 'Get intelligent recommendations and automated actions from your personal AI assistant that learns your preferences.' },
];

interface AiFeaturesSectionProps {
  config: Record<string, any>;
}

export default function AiFeaturesSection({ config }: AiFeaturesSectionProps) {
  const features = config.features?.length ? config.features : defaultFeatures;

  return (
    <section className="bg-navy-gradient section-padding relative overflow-hidden">
      {/* Background subtle glow orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-80 w-80 rounded-full bg-[#F5A623]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-[#F5A623]/5 blur-3xl" />

      <div className="container-brand relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Powered by <span className="text-gradient">Artificial Intelligence</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-white/60">
            Harness the power of cutting-edge AI to automate, analyze, and accelerate every aspect of your workflow.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature: any, index: number) => {
            const IconComponent = (feature.icon as LucideIcon) || defaultFeatures[index]?.icon || Brain;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass-dark group cursor-default rounded-2xl border border-white/10 p-6 transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(245,166,35,0.2)]"
              >
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#F5A623]/10 text-[#F5A623] transition-colors duration-300 group-hover:bg-[#F5A623]/20">
                  <IconComponent className="h-7 w-7" strokeWidth={1.8} />
                </div>
                <h3 className="font-heading mb-3 text-xl font-semibold text-white">
                  {feature.title || defaultFeatures[index]?.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-white/60">
                  {feature.description || defaultFeatures[index]?.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
