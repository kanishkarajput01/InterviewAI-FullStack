"use client";

import { ArrowRight, Briefcase, Code, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type IInterview } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { Button } from "@/app/_shared-components/Button";
import { ErrorState } from "@/app/_shared-components/ErrorState";
import { useUser } from "@/app/contexts/UserContext";
import { cn } from "@/lib/utils";

type Filter = "all" | "mine";

export default function InterviewListComponent() {
  const { user } = useUser();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [interviews, setInterviews] = useState<IInterview[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    ApiClientService.listInterviews({ mine: filter === "mine" }).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err || !data) {
        setError(err ?? "Failed to load interviews");
        return;
      }
      setInterviews(data);
    });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    setInterviews(null);
    setError("");
    setFilter(next);
  };

  const handleView = (interviewId: string) => {
    router.push(`/interviews/${interviewId}`);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-sm text-violet-600">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">Browse interviews</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900">
            Practice an <span className="text-violet-600">interview</span>
          </h1>
          <p className="text-base text-slate-600">
            Pick from existing interviews, or create your own.
          </p>
        </div>

        {/* Filter toggle */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => changeFilter("all")}
          >
            All public
          </Button>
          <Button
            size="sm"
            variant={filter === "mine" ? "default" : "outline"}
            onClick={() => changeFilter("mine")}
            disabled={!user}
          >
            My interviews
          </Button>
        </div>

        {error && <ErrorState error={error} />}

        {!error && interviews === null && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        )}

        {!error && interviews?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <p className="mb-4 text-slate-600">
              {filter === "mine"
                ? "You haven't created any interviews yet."
                : "No interviews available yet."}
            </p>
            <Button size="sm" onClick={() => router.push("/interview")} className="gap-2">
              Create an interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!error && interviews && interviews.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {interviews.map((interview) => {
              const isJob = interview.type === "job";
              const subtitle = isJob ? interview.role : interview.skill;
              return (
                <div
                  key={interview.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-900/5"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white",
                        isJob ? "bg-blue-600" : "bg-purple-600"
                      )}
                    >
                      {isJob ? <Briefcase className="h-5 w-5" /> : <Code className="h-5 w-5" />}
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                        isJob ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      )}
                    >
                      {interview.type}
                    </span>
                  </div>

                  <h3 className="mb-1 text-lg font-bold text-slate-900">{interview.title}</h3>
                  {subtitle && <p className="mb-2 text-sm text-slate-600">{subtitle}</p>}
                  {interview.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-slate-500">{interview.description}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-slate-500">
                      {interview.questions.length} questions • {interview.attempt_count} attempts
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleView(interview.id)}
                      className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
                    >
                      View
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
