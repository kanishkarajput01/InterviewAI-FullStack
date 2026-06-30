"use client";

import { ArrowRight, Briefcase, Code, FileText, Globe, Loader2, Lock, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AttemptStatusEnum,
  AuthModeEnum,
  MAX_ATTEMPTS_PER_USER,
  type IAttempt,
  type IInterview,
} from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { AuthDialog } from "@/app/_shared-components/AuthDialog";
import { Button } from "@/app/_shared-components/Button";
import { ErrorState } from "@/app/_shared-components/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_shared-components/Tabs";
import { useUser } from "@/app/contexts/UserContext";
import { cn } from "@/lib/utils";

const STATUS_META: Record<AttemptStatusEnum, { label: string; className: string }> = {
  [AttemptStatusEnum.COMPLETED]: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
  [AttemptStatusEnum.IN_PROGRESS]: { label: "In progress", className: "bg-amber-100 text-amber-700" },
  [AttemptStatusEnum.NOT_STARTED]: { label: "Not started", className: "bg-slate-100 text-slate-600" },
};

function formatAttemptDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewDetailComponent({ interviewId }: { interviewId: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [attempts, setAttempts] = useState<IAttempt[] | null>(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;

    ApiClientService.getInterview({ interviewId }).then(({ data, error: err }) => {
      if (cancelled) return;
      if (err || !data) {
        setError(err ?? "Failed to load interview");
        return;
      }
      setInterview(data);
    });

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  // The attempts endpoint requires auth; only fetch it when signed in.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    ApiClientService.listInterviewAttempts({ interviewId }).then(({ data }) => {
      if (cancelled) return;
      if (data) setAttempts(data);
    });

    return () => {
      cancelled = true;
    };
  }, [interviewId, user]);

  const inProgressAttempt = attempts?.find(
    (a) => a.status === AttemptStatusEnum.IN_PROGRESS
  );

  const handleStart = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    // Resume an in-progress attempt instead of starting a new one.
    if (inProgressAttempt) {
      router.push(`/attempt/${inProgressAttempt.id}`);
      return;
    }
    setIsStarting(true);
    const { data: attempt, error: err } = await ApiClientService.createAttempt({ interviewId });
    if (err || !attempt) {
      setIsStarting(false);
      setError(err ?? "Failed to start interview");
      return;
    }
    router.push(`/attempt/${attempt.id}`);
  };

  if (error) return <ErrorState error={error} />;
  if (!interview) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const isJob = interview.type === "job";
  const subtitle = isJob ? interview.role : interview.skill;
  const count = attempts?.length ?? 0;
  const limitReached = count >= MAX_ATTEMPTS_PER_USER;
  const hasAttempted = count > 0;

  let actionLabel = "Start Interview";
  if (inProgressAttempt) actionLabel = "Resume Interview";
  else if (hasAttempted) actionLabel = "Reattempt Interview";
  const isResumeOrReattempt = Boolean(inProgressAttempt) || hasAttempted;
  const sortedQuestions = [...interview.questions].sort((a, b) => a.order - b.order);
  const sortedAttempts = attempts
    ? [...attempts].sort((a, b) => b.created_at.localeCompare(a.created_at))
    : [];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white",
                isJob ? "bg-blue-600" : "bg-purple-600"
              )}
            >
              {isJob ? <Briefcase className="h-6 w-6" /> : <Code className="h-6 w-6" />}
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {interview.visibility === "public" ? (
                <Globe className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              <span className="capitalize">{interview.visibility}</span>
            </span>
          </div>

          <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">{interview.title}</h1>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          {interview.description && (
            <p className="mt-3 text-sm text-slate-500">{interview.description}</p>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span>{sortedQuestions.length} questions</span>
            {user && hasAttempted && (
              <span>
                You&apos;ve attempted this {count} {count === 1 ? "time" : "times"}
              </span>
            )}
          </div>
        </div>

        {/* Questions + Attempts */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <Tabs defaultValue="questions">
            <TabsList>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="attempts">
                Attempts{user && attempts ? ` (${attempts.length})` : ""}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="pt-6">
              <ol className="flex flex-col gap-3">
                {sortedQuestions.map((q, idx) => (
                  <li key={q.question_id} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">{q.text}</p>
                  </li>
                ))}
              </ol>
            </TabsContent>

            <TabsContent value="attempts" className="pt-6">
              {!user && (
                <p className="text-sm text-slate-500">Sign in to see your attempts.</p>
              )}

              {user && attempts === null && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
                </div>
              )}

              {user && attempts && attempts.length === 0 && (
                <p className="text-sm text-slate-500">
                  You haven&apos;t attempted this interview yet.
                </p>
              )}

              {user && sortedAttempts.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {sortedAttempts.map((attempt, idx) => {
                    const meta = STATUS_META[attempt.status];
                    const isCompleted = attempt.status === AttemptStatusEnum.COMPLETED;
                    const attemptScore =
                      typeof attempt.score === "number"
                        ? Math.round(attempt.score * 10) / 10
                        : null;
                    return (
                      <li
                        key={attempt.id}
                        onClick={() => router.push(`/attempt/${attempt.id}/details`)}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-violet-300 hover:bg-violet-50/40"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              Attempt {sortedAttempts.length - idx}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                meta.className
                              )}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatAttemptDate(attempt.created_at)}
                            {attemptScore !== null && ` • Score ${attemptScore}/10`}
                          </p>
                        </div>

                        {isCompleted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/attempt/${attempt.id}/details?tab=report`);
                            }}
                            className="shrink-0 gap-1.5"
                          >
                            <FileText className="h-4 w-4" />
                            See Report
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/attempt/${attempt.id}`);
                            }}
                            className="shrink-0 gap-1.5 bg-violet-600 text-white hover:bg-violet-700"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Resume
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Action */}
        <div className="flex flex-col items-end gap-2">
          {limitReached && (
            <p className="text-xs text-red-500">
              You&apos;ve reached the limit of {MAX_ATTEMPTS_PER_USER} attempts for this interview.
            </p>
          )}
          <Button
            size="sm"
            loading={isStarting}
            disabled={limitReached && !inProgressAttempt}
            onClick={handleStart}
            className="gap-2 bg-violet-600 px-6 text-sm font-semibold text-white hover:bg-violet-700"
          >
            {isResumeOrReattempt && <RotateCcw className="h-4 w-4" />}
            {actionLabel}
            {!isResumeOrReattempt && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <AuthDialog defaultMode={AuthModeEnum.LOGIN} open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
}
