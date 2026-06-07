import { ArrowRight, BrainCog, CheckCircle2, CirclePlay, Mic, Sparkles } from "lucide-react";

import { AuthModeEnum } from "@/_shared/types";
import { AnimateIn } from "@/app/_shared-components/AnimateIn";
import { AuthDialog } from "@/app/_shared-components/AuthDialog";
import { Button } from "@/app/_shared-components/Button";
import { FeaturesSection } from "@/app/_shared-components/FeaturesSection";
import { PricingSection } from "@/app/_shared-components/PricingSection";
import { cn } from "@/lib/utils";

const badges = [
  { label: "Free to start", color: "bg-emerald-500" },
  { label: "Instant feedback", color: "bg-blue-500" },
  { label: "AI-powered", color: "bg-violet-500" },
];

export default function Home() {
  return (
    <>
    <section className="relative overflow-hidden bg-white px-4 py-24">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-purple-200/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-12">

          {/* Left: text */}
          <div className="flex flex-col gap-6 lg:w-[46%] lg:shrink-0">
            <AnimateIn variant="fade-up" delay={0}>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-white">
                  <BrainCog size={15} />
                </span>
                <p className="text-xs font-semibold tracking-widest text-violet-600 uppercase">
                  IntervueAI
                </p>
              </div>
            </AnimateIn>

            <AnimateIn variant="fade-up" delay={80}>
              <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
                Ace Your Next{" "}
                <span className="text-violet-600">Interview</span>{" "}
                with AI
              </h1>
            </AnimateIn>

            <AnimateIn variant="fade-up" delay={160}>
              <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
                Simulate real interviews, get instant AI feedback, and prepare with confidence.
                Master any interview with our intelligent practice platform.
              </p>
            </AnimateIn>
            <div className="flex flex-wrap gap-4">
            <AnimateIn variant="fade-up" delay={240} className="flex flex-wrap gap-3">
              <AuthDialog
                defaultMode={AuthModeEnum.SIGNUP}
                trigger={
                  <Button
                  size="lg"
                  variant ="default"
                  className='w-[200px]'
                  >
                    Start Practicing <ArrowRight className="h-4 w-4" />
                  </Button>
                }
              />
        
            </AnimateIn>
            <AnimateIn variant="fade-up" delay={240} className="flex flex-wrap gap-3">
            <Button
            variant="outline"
            size="lg"
            className='w-[200px]'
            >
        <CirclePlay className="h-4 w-4 text-violet-600" />
        Watch Demo
      </Button>
              </AnimateIn>
              </div>

            <AnimateIn variant="fade-up" delay={320} className="flex flex-wrap gap-2">
              {badges.map(({ label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
                  {label}
                </span>
              ))}
            </AnimateIn>
          </div>

          {/* Right: mock interview card */}
          <AnimateIn variant="fade-up" delay={200} className="flex-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              {/* Card header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                  Question 2 of 5
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Mic className="h-3.5 w-3.5" /> Voice ready
                </span>
              </div>

              {/* Question */}
              <p className="mb-6 text-base font-semibold leading-relaxed text-slate-900">
                Tell me about a time you had to debug a critical production issue under pressure. What was your approach?
              </p>

              {/* Answer box mock */}
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-500">
                I identified the issue by checking error logs first, then isolated the failing service using our monitoring dashboard. I communicated status updates every 10 minutes to the team while rolling back the last deployment...
              </div>

              {/* AI Feedback mock */}
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="text-xs font-semibold text-violet-700">AI Feedback</span>
                  <span className="ml-auto rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    87 / 100
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {[
                    "Strong structured approach with clear steps",
                    "Good stakeholder communication habit",
                    "Add more on root-cause analysis process",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AnimateIn>

        </div>
      </div>
    </section>
    <FeaturesSection />
    <PricingSection />
    </>
  );
}
