"use client";

import { BrainCog, Briefcase, Code, Lightbulb, LineChart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Sparkles,
    title: "Smart Questions",
    description: "AI-generated questions based on your role and experience",
  },
  {
    icon: Lightbulb,
    title: "Instant Feedback",
    description: "Real-time analysis of your responses and suggestions",
  },
  {
    icon: LineChart,
    title: "Progress Tracking",
    description: "Detailed analytics to monitor your improvement",
  },
];

export default function InterviewPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 items-center text-center flex-col justify-center w-full">
          <div className="flex h-7 w-7 mx-auto justify-center items-center rounded-md bg-violet-600 text-white">
            <BrainCog size={16} />
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-slate-900">
            <span className="text-purple-600">AI Interview</span>
            <br />
            <span className="text-slate-900">Practice Studio</span>
          </h1>
          <p className="text-base text-slate-600">
            Choose your interview type and start practicing with AI-powered questions
          </p>
        </div>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
          {/* Left sidebar - What You'll Get */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
            <div className="mb-4 flex items-center gap-2 text-purple-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">What You&apos;ll Get</h2>
            </div>

            <div className="space-y-4 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      index === 0 && "bg-purple-100 text-purple-600",
                      index === 1 && "bg-purple-100 text-purple-600",
                      index === 2 && "bg-emerald-100 text-emerald-600"
                    )}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Interview Type Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
            <div className="mb-6 flex items-center gap-2 text-blue-600">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Choose Interview Type</span>
            </div>

            <h2 className="mb-2 text-3xl font-bold text-slate-900">
              Select Your Interview Style
            </h2>
            <p className="mb-6 text-slate-600">
              Choose between job-based or skill-based interview practice
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Job-Based Card */}
              <button
                onClick={() => router.push("/job-based")}
                className="group rounded-xl border-2 border-slate-200 bg-linear-to-br from-blue-50 to-blue-100/50 p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">Job-Based</h3>
                <p className="text-sm text-slate-600">
                  Practice with questions tailored to your specific job title and experience level.
                </p>
              </button>

              {/* Skill-Based Card */}
              <button
                onClick={() => router.push("/skill-based")}
                className="group rounded-xl border-2 border-slate-200 bg-linear-to-br from-purple-50 to-purple-100/50 p-6 text-left transition-all hover:border-purple-400 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <Code className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">Skill-Based</h3>
                <p className="text-sm text-slate-600">
                  Focus on specific technical skills with targeted questions and assessments.
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
