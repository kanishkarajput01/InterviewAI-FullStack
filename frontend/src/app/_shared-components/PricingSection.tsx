import { Check } from "lucide-react";

import { AuthModeEnum } from "@/_shared/types";
import { AnimateIn } from "@/app/_shared-components/AnimateIn";
import { AuthDialog } from "@/app/_shared-components/AuthDialog";
import { buttonVariants } from "@/app/_shared-components/Button";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with no commitment.",
    features: [
      "5 practice sessions / month",
      "Standard question bank",
      "Basic AI feedback",
      "Text answers only",
      "Session history (7 days)",
    ],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$9",
    period: "/ month",
    description: "Everything you need to land the offer.",
    features: [
      "Unlimited sessions",
      "Voice answer + transcription",
      "Deep AI feedback & scoring",
      "Skill & job-based modes",
      "Full session history",
      "Progress analytics",
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Teams",
    price: "$29",
    period: "/ month",
    description: "For squads prepping together.",
    features: [
      "Everything in Pro",
      "Up to 10 members",
      "Shared question banks",
      "Team analytics dashboard",
      "Priority support",
    ],
    cta: "Contact us",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-12">
          {/* Left: heading */}
          <AnimateIn variant="fade-up" className="lg:sticky lg:top-24 lg:w-72 lg:shrink-0">
            <p className="mb-3 text-xs font-semibold tracking-widest text-violet-600 uppercase">
              Pricing
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Simple,{" "}
              <span className="text-violet-600">transparent</span>{" "}
              pricing.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Start free, upgrade when you need more. No hidden fees, cancel any time.
            </p>
          </AnimateIn>

          {/* Right: cards */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            {tiers.map((tier, i) => (
              <AnimateIn key={tier.name} variant="fade-up" delay={i * 100}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-6 shadow-sm",
                  tier.popular
                    ? "border-violet-300 bg-violet-50 shadow-violet-100"
                    : "border-slate-200 bg-white"
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase">
                    Most popular
                  </span>
                )}

                <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                  {tier.name}
                </p>

                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="mb-1 text-sm text-slate-400">{tier.period}</span>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-500">{tier.description}</p>

                <ul className="mt-6 flex flex-col gap-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-violet-600"
                        strokeWidth={2.5}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <AuthDialog
                    defaultMode={AuthModeEnum.SIGNUP}
                    trigger={
                      <span
                        className={cn(
                          buttonVariants({ size: "sm" }),
                          "w-full justify-center",
                          tier.popular
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {tier.cta}
                      </span>
                    }
                  />
                </div>
              </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
