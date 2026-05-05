import { ArrowRight, CirclePlay } from "lucide-react";

import { AuthModeEnum } from "@/_shared/types";
import { AuthDialog } from "@/app/_shared-components/AuthDialog";
import { Button, buttonVariants } from "@/app/_shared-components/Button";
import { FeaturesSection } from "@/app/_shared-components/FeaturesSection";
import { cn } from "@/lib/utils";

const badges = [
  { label: "Free to start", color: "bg-emerald-500" },
  { label: "Instant feedback", color: "bg-blue-500" },
  { label: "AI-powered", color: "bg-violet-500" },
];

export default function Home() {
  return (
    <>
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden bg-white px-4 text-center">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="flex max-w-2xl flex-col items-center gap-6">
        {/* Heading */}
        <h1 className="text-5xl leading-tight font-bold tracking-tight text-slate-900 sm:text-6xl">
          Ace Your Next{" "}
          <span className="text-violet-600">Interview</span>
          <br />
          with AI
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
          Simulate real interviews, get instant AI feedback, and prepare with confidence.
          Master any interview with our intelligent practice platform.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AuthDialog
            defaultMode={AuthModeEnum.SIGNUP}
            trigger={
              <span
                className={cn(
                  buttonVariants(),
                  "h-11 gap-2 rounded-lg bg-violet-600 px-6 text-sm font-semibold text-white hover:bg-violet-700"
                )}
              >
                Start Practicing <ArrowRight className="h-4 w-4" />
              </span>
            }
          />
          <Button
            variant="outline"
            className="h-11 gap-2 rounded-lg border-slate-200 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CirclePlay className="h-4 w-4 text-slate-500" />
            Watch Demo
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {badges.map(({ label, color }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
    <FeaturesSection />
    </>
  );
}
