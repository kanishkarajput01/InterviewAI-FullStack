import { Brain, Mic, Crosshair, Zap, BarChart2, ShieldCheck, type LucideIcon } from "lucide-react";

import { AnimateIn } from "@/app/_shared-components/AnimateIn";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  filled?: boolean;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "Adaptive AI",
    description: "Questions adapt to your skills, role, and experience level in real time.",
  },
  {
    icon: Mic,
    title: "Voice",
    description: "Practice with microphone — just like the real thing.",
  },
  {
    icon: Crosshair,
    title: "Skill or Job-based",
    description: "Drill specific skills or simulate full interviews for a target role.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get scored on clarity, depth, and confidence after every answer.",
  },
  {
    icon: BarChart2,
    title: "Progress Tracking",
    description: "Watch your scores climb across sessions with detailed analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Default",
    description: "Your sessions stay yours. We never share your recordings.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-50/60 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-12">
          {/* Left: heading */}
          <AnimateIn variant="fade-up" className="lg:sticky lg:top-24 lg:w-72 lg:shrink-0">
            <p className="mb-3 text-xs font-semibold tracking-widest text-violet-600 uppercase">
              Features
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Everything to{" "}
              <span className="text-violet-600">land the offer</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              A complete interview practice studio, designed to feel as real as the day you walk into the room.
            </p>
          </AnimateIn>

          {/* Right: grid */}
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description, filled }, i) => (
              <AnimateIn key={title} variant="fade-up" delay={i * 80}>
                <div className="flex h-full flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      filled ? "bg-violet-600" : "bg-violet-100"
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5", filled ? "text-white" : "text-violet-600")}
                      strokeWidth={1.75}
                    />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{description}</p>
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
