/**
 * Testimonials Section
 * Customer testimonial cards with star ratings.
 */
'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export interface Testimonial {
  name: string;
  position: string;
  company: string;
  rating: number;
  quote: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    name: 'Sarah Mitchell',
    position: 'VP of Operations',
    company: 'TechForward Inc.',
    rating: 5,
    quote: "This platform transformed how we manage our operations. The AI scheduling alone saved us 20 hours per week. It's like having an extra team member who never sleeps.",
  },
  {
    name: 'James Rodriguez',
    position: 'CTO',
    company: 'DataStream Labs',
    rating: 5,
    quote: 'The analytics capabilities are unmatched. We went from spending days on reports to getting real-time insights that actually drive decision-making. Absolutely game-changing.',
  },
  {
    name: 'Emily Chen',
    position: 'Head of Product',
    company: 'NovaBridge',
    rating: 4,
    quote: 'The onboarding was seamless and the support team is incredibly responsive. Our team adopted it within a week and productivity metrics improved noticeably within the first month.',
  },
];

interface TestimonialsSectionProps {
  config: Record<string, any>;
  testimonials?: Testimonial[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-[#F5A623] text-[#F5A623]' : 'fill-transparent text-[#0B2345]/15'}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#0B2345] text-lg font-semibold text-[#F5A623]">
      {initial}
    </div>
  );
}

export default function TestimonialsSection({ config, testimonials }: TestimonialsSectionProps) {
  const items = testimonials?.length ? testimonials : defaultTestimonials;

  return (
    <section className="section-padding bg-[#F8FAFC]">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-[#0B2345] sm:text-4xl lg:text-5xl">
            Loved by <span className="text-gradient">Thousands</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            Don&apos;t just take our word for it. Here&apos;s what industry leaders are saying about their experience.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="group rounded-2xl border border-[#0B2345]/5 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-[#0B2345]/8"
            >
              <StarRating rating={t.rating} />

              <p className="mt-4 font-body text-sm leading-relaxed text-[#0B2345]/70">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-[#0B2345]/5 pt-5">
                <Avatar name={t.name} />
                <div className="min-w-0">
                  <p className="font-heading text-sm font-semibold text-[#0B2345]">{t.name}</p>
                  <p className="truncate font-body text-xs text-[#0B2345]/50">
                    {t.position}, {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
