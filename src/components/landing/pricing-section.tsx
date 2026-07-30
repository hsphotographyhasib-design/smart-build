/**
 * Pricing Section
 * 5 plan cards with feature lists, popular badge, and CTAs.
 */
'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Plan {
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string; // JSON string of string[]
  popular?: boolean;
  cta?: string;
  isEnterprise?: boolean;
}

const defaultPlans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    interval: 'forever',
    description: 'Perfect for individuals and small side projects getting started.',
    features: JSON.stringify(['Up to 3 projects', '1 team member', 'Basic analytics', 'Community support', '5GB storage']),
    cta: 'Get Started',
  },
  {
    name: 'Starter',
    price: '$29',
    interval: '/month',
    description: 'Ideal for growing teams that need more power and collaboration.',
    features: JSON.stringify(['Up to 15 projects', '5 team members', 'Advanced analytics', 'Email support', '50GB storage', 'Custom integrations']),
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$79',
    interval: '/month',
    description: 'For established teams that demand the best tools and insights.',
    features: JSON.stringify(['Unlimited projects', '25 team members', 'AI-powered analytics', 'Priority support', '200GB storage', 'Custom integrations', 'API access', 'Advanced security']),
    popular: true,
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: '$199',
    interval: '/month',
    description: 'Built for large organizations with complex requirements.',
    features: JSON.stringify(['Everything in Professional', 'Unlimited team members', 'Dedicated account manager', '24/7 phone support', 'Unlimited storage', 'SSO & SAML', 'Custom SLA', 'On-premise option']),
    cta: 'Contact Sales',
    isEnterprise: true,
  },
  {
    name: 'Custom',
    price: 'Custom',
    interval: '',
    description: 'Tailored solutions for unique business needs and large-scale deployments.',
    features: JSON.stringify(['Everything in Enterprise', 'White-label options', 'Custom development', 'Dedicated infrastructure', 'Multi-region deployment', 'Custom contracts', 'Volume discounts', 'Executive briefings']),
    cta: 'Contact Sales',
    isEnterprise: true,
  },
];

interface PricingSectionProps {
  config: Record<string, any>;
  plans?: Plan[];
}

function parseFeatures(features: string): string[] {
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PricingSection({ config, plans }: PricingSectionProps) {
  const items: Plan[] = plans?.length ? plans : defaultPlans;

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
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-[#0B2345]/60">
            Choose the plan that fits your needs. Scale up or down at any time.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((plan, index) => {
            const featureList = parseFeatures(plan.features);
            const isPopular = plan.popular || false;
            const isEnterprise = plan.isEnterprise || false;
            const ctaText = plan.cta || (isEnterprise ? 'Contact Sales' : 'Get Started');

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300
                  ${
                    isPopular
                      ? 'border-[#F5A623] shadow-lg shadow-[#F5A623]/10 md:scale-105 xl:scale-105'
                      : 'border-[#0B2345]/8 hover:border-[#0B2345]/15 hover:shadow-md'
                  }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#F5A623] px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Most Popular
                  </div>
                )}

                {/* Plan name & price */}
                <div className="mb-5">
                  <h3 className="font-heading text-lg font-semibold text-[#0B2345]">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-bold text-[#0B2345]">{plan.price}</span>
                    {plan.interval && (
                      <span className="font-body text-sm text-[#0B2345]/50">{plan.interval}</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="mb-5 font-body text-sm leading-relaxed text-[#0B2345]/60">
                  {plan.description}
                </p>

                {/* Feature list */}
                <ul className="mb-8 flex flex-1 flex-col gap-2.5">
                  {featureList.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F5A623]" strokeWidth={2.5} />
                      <span className="font-body text-sm text-[#0B2345]/70">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full font-body text-sm transition-colors duration-200
                    ${
                      isPopular
                        ? 'bg-[#F5A623] text-white hover:bg-[#F5A623]/90'
                        : isEnterprise
                          ? 'bg-[#0B2345] text-white hover:bg-[#0B2345]/90'
                          : 'border border-[#0B2345] text-[#0B2345] hover:bg-[#0B2345] hover:text-white'
                    }`}
                  variant={isPopular || isEnterprise ? 'default' : 'outline'}
                >
                  {ctaText}
                  {!isEnterprise && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
