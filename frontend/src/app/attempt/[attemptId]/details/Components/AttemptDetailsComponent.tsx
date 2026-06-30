"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AttemptStatusEnum,
  type IAnswer,
  type IInterview,
  type IInterviewQuestion,
  type IReport,
} from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { ErrorState } from "@/app/_shared-components/ErrorState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_shared-components/Tabs";
import { FeedbackCard } from "@/app/attempt/[attemptId]/Components/FeedbackCard";
import { ReportView } from "@/app/attempt/[attemptId]/report/Components/ReportView";

export default function AttemptDetailsComponent({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") === "report" ? "report" : "answers";

  const [interview, setInterview] = useState<IInterview | null>(null);
  const [answers, setAnswers] = useState<IAnswer[] | null>(null);
  const [report, setReport] = useState<IReport | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: attempt, error: attemptErr } = await ApiClientService.getAttempt({ attemptId });
      if (cancelled) return;
      if (attemptErr || !attempt) {
        setError(attemptErr ?? "Failed to load attempt");
        return;
      }
      setIsCompleted(attempt.status === AttemptStatusEnum.COMPLETED);

      const [interviewRes, answersRes, reportRes] = await Promise.all([
        ApiClientService.getInterview({ interviewId: attempt.interview_id }),
        ApiClientService.listAnswers({ attemptId }),
        ApiClientService.getReport({ attemptId }),
      ]);
      if (cancelled) return;

      if (interviewRes.error || !interviewRes.data) {
        setError(interviewRes.error ?? "Failed to load interview");
        return;
      }
      setInterview(interviewRes.data);
      setAnswers(answersRes.data ?? []);
      if (reportRes.data) setReport(reportRes.data);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (error) return <ErrorState error={error} />;
  if (!interview || answers === null) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const qById = new Map<string, IInterviewQuestion>(
    interview.questions.map((q) => [q.question_id, q])
  );
  const sortedAnswers = [...answers].sort(
    (a, b) => (qById.get(a.question_id)?.order ?? 0) - (qById.get(b.question_id)?.order ?? 0)
  );

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push(`/interviews/${interview.id}`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to interview
        </button>

        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">{interview.title}</h1>

        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="answers">Answers ({sortedAnswers.length})</TabsTrigger>
            <TabsTrigger value="report">Report</TabsTrigger>
          </TabsList>

          {/* Answers */}
          <TabsContent value="answers" className="pt-6">
            {sortedAnswers.length === 0 ? (
              <p className="text-sm text-slate-500">No answers were submitted for this attempt.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {sortedAnswers.map((answer, idx) => {
                  const question = qById.get(answer.question_id);
                  return (
                    <div
                      key={answer.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-900/5"
                    >
                      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        Question {idx + 1}
                      </div>
                      <p className="mb-4 text-base font-semibold leading-relaxed text-slate-900">
                        {question?.text ?? answer.question_id}
                      </p>

                      <div className="mb-3 rounded-xl bg-slate-50 p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Your Answer
                        </p>
                        <p className="whitespace-pre-wrap text-sm text-slate-700">{answer.answer}</p>
                      </div>

                      <FeedbackCard score={answer.score} feedback={answer.feedback} />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Report */}
          <TabsContent value="report" className="pt-6">
            {report ? (
              <ReportView report={report} interview={interview} />
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                {isCompleted
                  ? "No report is available for this attempt yet."
                  : "The report will be available once this attempt is completed."}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
