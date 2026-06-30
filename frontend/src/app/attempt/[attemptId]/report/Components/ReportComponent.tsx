"use client";

import { useEffect, useState } from "react";

import type { IInterview, IReport } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { ErrorState } from "@/app/_shared-components/ErrorState";

import ReportLoadingState from "./ReportLoadingState";
import { ReportView } from "./ReportView";

export default function ReportComponent({ attemptId }: { attemptId: string }) {
  const [report, setReport] = useState<IReport | null>(null);
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Fetch the report; if it hasn't been generated yet, generate it now.
      let reportRes = await ApiClientService.getReport({ attemptId });
      if (reportRes.error || !reportRes.data) {
        reportRes = await ApiClientService.generateReport({ attemptId });
      }
      if (cancelled) return;
      if (reportRes.error || !reportRes.data) {
        setError(reportRes.error ?? "Failed to load report");
        return;
      }

      const interviewRes = await ApiClientService.getInterview({
        interviewId: reportRes.data.interview_id,
      });
      if (cancelled) return;
      if (interviewRes.error || !interviewRes.data) {
        setError(interviewRes.error ?? "Failed to load interview");
        return;
      }

      setReport(reportRes.data);
      setInterview(interviewRes.data);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (error) return <ErrorState error={error} />;
  if (!report || !interview) return <ReportLoadingState />;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <ReportView report={report} interview={interview} />
      </div>
    </div>
  );
}
