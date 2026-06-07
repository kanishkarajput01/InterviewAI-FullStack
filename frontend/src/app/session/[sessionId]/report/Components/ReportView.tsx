"use client";

import { ArrowRight, Award, Briefcase, CheckCircle, TrendingUp, User } from "lucide-react";
import { useRouter } from "next/navigation";

import type { IReportResponse, ISession } from "@/_shared/types";
import { Button } from "@/app/_shared-components/Button";
import { useUser } from "@/app/contexts/UserContext";

const NEXT_STEPS = [
  "Review the detailed feedback and identify key areas for improvement",
  "Practice similar questions to strengthen your weak areas",
  "Take another practice interview to track your progress",
  "Share your achievements with your network",
];

export function ReportView({ report, session }: { report: IReportResponse; session: ISession }) {
  const router = useRouter();
  const { user } = useUser();

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md h-[500px]">
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
                <p className="text-xs text-slate-500">Job Role</p>
                <p className="text-sm font-semibold text-slate-900">{session.job_role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <TrendingUp className="h-4 w-4 shrink-0 text-violet-500" />
              <div>
                <p className="text-xs text-slate-500">Experience Level</p>
                <p className="text-sm font-semibold text-slate-900">
                  {session.experience} {session.experience === 1 ? "year" : "years"}
                </p>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => router.push("/interview")}
            className="mt-12 w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"
          >
            Start New Interview
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Report text */}
        <div className="flex flex-col gap-8">    
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{report.final_report}</p>
          
        </div>  {/* Recommended next steps */}
      <div className="mb-8 rounded-2xl bg-linear-to-r from-blue-600 to-violet-600 p-8">
        <div className="mb-5 flex items-center gap-3">
          <ArrowRight className="h-5 w-5 text-white" />
          <h3 className="text-lg font-bold text-white">Recommended Next Steps</h3>
        </div>
        <div className="flex flex-col gap-3">
          {NEXT_STEPS.map((step) => (
            <div key={step} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-white/80" />
              <p className="text-sm text-white/90">{step}</p>
            </div>
          ))}
        </div>
      </div>
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
