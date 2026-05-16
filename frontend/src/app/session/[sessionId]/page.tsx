"use client";

import { ArrowRight, BrainCog, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { IReportResponse, ISession } from "@/_shared/types";
import { Button } from "@/app/_shared-components/Button";
import ApiClientService from "@/app/_client-services/ApiService";
import { cn } from "@/lib/utils";

type Phase = "loading" | "answering" | "submitting" | "feedback" | "fetching-report" | "report" | "error";

const TOTAL_QUESTIONS = 5;

function FeedbackCard({ feedback }: { feedback: string }) {
  const scoreMatch = feedback.match(/Score:\s*(\d+)\/10/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const scoreColor =
    score === null ? "border-slate-200" :
    score >= 8 ? "border-emerald-400 bg-emerald-50" :
    score >= 6 ? "border-violet-400 bg-violet-50" :
    "border-orange-400 bg-orange-50";

  return (
    <div className={cn("rounded-xl border-2 p-5", scoreColor)}>
      {score !== null && (
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">Score: {score}/10</span>
        </div>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{feedback}</p>
    </div>
  );
}

function ReportView({ report, session }: { report: IReportResponse; session: ISession }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center justify-center rounded-full bg-emerald-100 p-3">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Interview Complete!</h2>
        <p className="mt-1 text-sm text-slate-600">
          {session.job_role} • {session.experience} {session.experience === 1 ? "year" : "years"} experience
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Final Report</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{report.final_report}</p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Button
          onClick={() => router.push("/interview")}
          className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
        >
          Start New Interview
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<ISession | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [report, setReport] = useState<IReportResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ApiClientService.getSession({ sessionId }).then(({ data, error: err }) => {
      if (err || !data) {
        setError(err ?? "Failed to load session");
        setPhase("error");
        return;
      }
      setSession(data);
      setCurrentQIdx(data.current_question_idx);
      setPhase("answering");
    });
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!answer.trim() || !session) return;
    setPhase("submitting");

    const { data, error: err } = await ApiClientService.submitAnswer({ sessionId, answer: answer.trim() });
    if (err || !data) {
      setError(err ?? "Failed to submit answer");
      setPhase("error");
      return;
    }

    setFeedback(data.feedback);

    if (data.next_question_idx === null) {
      setPhase("feedback");
    } else {
      setPhase("feedback");
    }
  };

  const handleNext = async () => {
    if (!session) return;
    const nextIdx = currentQIdx + 1;

    if (nextIdx >= TOTAL_QUESTIONS) {
      setPhase("fetching-report");
      const { data, error: err } = await ApiClientService.getReport({ sessionId });
      if (err || !data) {
        setError(err ?? "Failed to load report");
        setPhase("error");
        return;
      }
      setReport(data);
      setPhase("report");
    } else {
      setCurrentQIdx(nextIdx);
      setAnswer("");
      setFeedback("");
      setPhase("answering");
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">Something went wrong</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (phase === "report" && report && session) {
    return (
      <div className="relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
        <ReportView report={report} session={session} />
      </div>
    );
  }

  if (!session) return null;

  const currentQuestion = session.data[currentQIdx]?.question ?? "";
  const isLastQuestion = currentQIdx === TOTAL_QUESTIONS - 1;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-sm text-violet-600">
            <BrainCog className="h-4 w-4" />
            <span className="font-medium">{session.job_role}</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium">{session.experience} {session.experience === 1 ? "year" : "years"}</span>
          </div>

          {/* Progress */}
          <div className="mx-auto max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Question {currentQIdx + 1} of {TOTAL_QUESTIONS}</span>
              <span>{Math.round(((currentQIdx) / TOTAL_QUESTIONS) * 100)}% complete</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-500"
                style={{ width: `${(currentQIdx / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          {/* Question */}
          <div className="mb-6">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Question {currentQIdx + 1}
            </div>
            <p className="text-lg font-semibold leading-relaxed text-slate-900">{currentQuestion}</p>
          </div>

          {/* Answer / Feedback */}
          {(phase === "answering" || phase === "submitting") && (
            <div className="flex flex-col gap-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                disabled={phase === "submitting"}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-60"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || phase === "submitting"}
                  className="gap-2 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {phase === "submitting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {phase === "feedback" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Your Answer</p>
                <p className="text-sm text-slate-700">{answer}</p>
              </div>

              <FeedbackCard feedback={feedback} />

              <div className="flex justify-end">
                {phase === "feedback" && (
                  <Button
                    onClick={handleNext}
                    className="gap-2 bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {isLastQuestion ? "View Report" : "Next Question"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {phase === "fetching-report" && (
            <div className="flex items-center justify-center py-8 gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
              <span className="text-sm">Generating your report...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
