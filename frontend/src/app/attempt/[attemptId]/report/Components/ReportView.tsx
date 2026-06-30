"use client";

import { ArrowRight, Award, Briefcase, CheckCircle, Lightbulb, RotateCcw, Target, TrendingUp, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { IInterview, IReport } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { Button } from "@/app/_shared-components/Button";
import { useUser } from "@/app/contexts/UserContext";

export function ReportView({ report, interview }: { report: IReport; interview: IInterview }) {
  const router = useRouter();
  const { user } = useUser();
  const [isReattempting, setIsReattempting] = useState(false);
  const [reattemptError, setReattemptError] = useState("");

  const subtitleLabel = interview.type === "job" ? "Job Role" : "Skill";
  const subtitleValue = interview.type === "job" ? interview.role : interview.skill;
  const score = typeof report.score === "number" ? Math.round(report.score * 10) / 10 : null;

  const handleReattempt = async () => {
    setIsReattempting(true);
    setReattemptError("");
    const { data: attempt, error: err } = await ApiClientService.createAttempt({
      interviewId: interview.id,
    });
    if (err || !attempt) {
      setIsReattempting(false);
      setReattemptError(err ?? "Failed to start a new attempt");
      return;
    }
    router.push(`/attempt/${attempt.id}`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-emerald-100 p-4">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="mb-2 text-4xl font-bold">
          <span className="bg-linear-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
            Interview{" "}
          </span>
          <span className="bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Complete!
          </span>
        </h1>
        <p className="text-slate-500">Congratulations! Here&apos;s your detailed performance report.</p>
      </div>

      {/* Two-column layout */}
      <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Interview summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-5 flex flex-col items-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Interview Summary</h2>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <User className="h-4 w-4 shrink-0 text-violet-500" />
              <div>
                <p className="text-xs text-slate-500">Candidate</p>
                {user?.username && (
                  <p className="text-sm font-semibold text-slate-900">{user.username}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Briefcase className="h-4 w-4 shrink-0 text-violet-500" />
              <div>
                <p className="text-xs text-slate-500">{subtitleLabel}</p>
                <p className="text-sm font-semibold text-slate-900">{subtitleValue ?? interview.title}</p>
              </div>
            </div>

            {score !== null && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <TrendingUp className="h-4 w-4 shrink-0 text-violet-500" />
                <div>
                  <p className="text-xs text-slate-500">Overall Score</p>
                  <p className="text-sm font-semibold text-slate-900">{score}/10</p>
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            loading={isReattempting}
            onClick={handleReattempt}
            className="mt-8 w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reattempt Interview
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isReattempting}
            onClick={() => router.push("/interview")}
            className="mt-3 w-full gap-2"
          >
            Start New Interview
            <ArrowRight className="h-4 w-4" />
          </Button>
          {reattemptError && (
            <p className="mt-2 text-center text-xs text-red-500">{reattemptError}</p>
          )}
        </div>

        {/* Report text + strengths/improvements */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            {report.summary && (
              <p className="mb-4 text-base font-semibold text-slate-900">{report.summary}</p>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{report.report}</p>
          </div>

          {report.strengths.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Strengths</h3>
              </div>
              <div className="flex flex-col gap-3">
                {report.strengths.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.improvements.length > 0 && (
            <div className="rounded-2xl bg-linear-to-r from-blue-600 to-violet-600 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-white" />
                <h3 className="text-base font-bold text-white">Areas to Improve</h3>
              </div>
              <div className="flex flex-col gap-3">
                {report.improvements.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-white/80" />
                    <p className="text-sm text-white/90">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border mt-8 border-slate-200 bg-white px-6 py-4 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          Thank you for using our IntervueAI platform! Keep practicing and improving. 🚀
        </p>
      </div>
    </>
  );
}
