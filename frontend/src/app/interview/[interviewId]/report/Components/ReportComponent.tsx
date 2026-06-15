"use client";

import { useEffect, useState } from "react";

import type { IReportResponse, IInterview } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { ErrorState } from "@/app/_shared-components/ErrorState";

import ReportLoadingState from "./ReportLoadingState";
import { ReportView } from "./ReportView";

export default function ReportComponent({ interviewId }: { interviewId: string }) {
  const [report, setReport] = useState<IReportResponse | null>(null);
  const [interview, setInterview] = useState<IInterview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      ApiClientService.getReport({ interviewId }),
      ApiClientService.getInterview({ interviewId }),
    ]).then(([reportRes, interviewRes]) => {
      if (reportRes.error || !reportRes.data) {
        setError(reportRes.error ?? "Failed to load report");
        return;
      }
      if (interviewRes.error || !interviewRes.data) {
        setError(interviewRes.error ?? "Failed to load interview");
        return;
      }
      setReport(reportRes.data);
      setInterview(interviewRes.data);
    });
  }, [interviewId]);

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
