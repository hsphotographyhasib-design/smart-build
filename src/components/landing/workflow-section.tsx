'use client';

import { motion } from 'framer-motion';
import { FileSearch, Rocket, BarChart3, CheckCircle2, Lightbulb } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, viewportConfig } from './motion';

interface WorkflowSectionProps {
  config: Record<string, any>;
}

interface WorkflowStep {
  number: number;
  title: string;
  description: string;
}

const DEFAULT_STEPS: WorkflowStep[] = [
  {
    number: 1,
    title: 'Discovery & Assessment',
    description:
      'Our team analyzes your current workflows, pain points, and goals to design a tailored implementation plan that fits your organization.',
  },
  {
    number: 2,
    title: 'Configure & Customize',
    description:
      'We set up your environment, import existing data, and configure modules, permissions, and integrations to match your exact requirements.',
  },
  {
    number: 3,
    title: 'Launch & Train',
    description:
      'Go live with full confidence. Our dedicated onboarding specialists provide hands-on training sessions for every user role.',
  },
  {
    number: 4,
    title: 'Monitor & Optimize',
    description:
      'Track adoption metrics, gather feedback, and continuously refine workflows to maximize ROI and team productivity over time.',
  },
  {
    number: 5,
    title: 'Scale & Grow',
    description:
      'Expand to new departments, sites, and projects seamlessly. Our platform grows with your organization without limits.',
  },
];

const stepIcons = [FileSearch, Rocket, BarChart3, CheckCircle2, Lightbulb];

function resolveSteps(config: Record<string, any>): WorkflowStep[] {
  if (config.steps?.length) {
    return config.steps.map((step: Record<string, any>, i: number) => ({
      number: step.number || i + 1,
      title: step.title || `Step ${i + 1}`,
      description: step.description || '',
    }));
  }
  return DEFAULT_STEPS;
}

export function WorkflowSection({ config }: WorkflowSectionProps) {
  const headline = config.headline || 'How It Works';
  const subheadline =
    config.subheadline ||
    'From initial consultation to full-scale deployment — a proven process that gets results.';

  const steps = resolveSteps(config);

  return (
    <section className="relative bg-[#F8FAFC] py-16 lg:py-24" aria-label="Workflow">
      <div className="container-brand">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="text-center mb-14 lg:mb-20"
        >
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B2345]">
            {headline}
          </h2>
          {subheadline && (
            <p className="mt-3 text-base text-gray-500 font-body max-w-2xl mx-auto">
              {subheadline}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="relative max-w-3xl mx-auto"
        >
          {/* Vertical connecting line */}
          <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

          <div className="space-y-10 lg:space-y-14">
            {steps.map((step, index) => {
              const StepIcon = stepIcons[index % stepIcons.length];
              const isLast = index === steps.length - 1;
              return (
                <motion.div
                  key={step.number}
                  variants={staggerItem}
                  className="relative flex gap-5 sm:gap-8"
                >
                  {/* Left — Step number circle */}
                  <div className="relative flex shrink-0">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#F5A623] flex items-center justify-center shadow-lg shadow-[#F5A623]/20 z-10">
                      <span className="text-white font-heading font-bold text-base sm:text-lg">
                        {step.number}
                      </span>
                    </div>
                    {/* Connector line to next step */}
                    {!isLast && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-12 sm:top-16 w-px h-full bg-[#F5A623]/30" />
                    )}
                  </div>

                  {/* Right — Content */}
                  <div className="flex-1 pt-1 sm:pt-2.5 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <StepIcon className="w-5 h-5 text-[#0B2345] shrink-0" />
                      <h3 className="font-heading text-lg sm:text-xl font-semibold text-[#0B2345]">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 font-body leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
