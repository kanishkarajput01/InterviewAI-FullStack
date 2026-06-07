"use client";

import { useEffect, useState } from "react";

import type { IReportResponse, ISession } from "@/_shared/types";
import ApiClientService from "@/app/_client-services/ApiService";
import { ErrorState } from "@/app/_shared-components/ErrorState";

import { ReportView } from "../Components/ReportView";

import ReportLoadingState from "./ReportLoadingState";

export default function ReportComponent({ sessionId }: { sessionId: string }) {
  const [report, setReport] = useState<IReportResponse | null>(null);
  const [session, setSession] = useState<ISession | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      ApiClientService.getReport({ sessionId }),
      ApiClientService.getSession({ sessionId }),
    ]).then(([reportRes, sessionRes]) => {
      if (reportRes.error || !reportRes.data) {
        setError(reportRes.error ?? "Failed to load report");
        return;
      }
      if (sessionRes.error || !sessionRes.data) {
        setError(sessionRes.error ?? "Failed to load session");
        return;
      }
      setReport(reportRes.data);
      setSession(sessionRes.data);
    });
  }, [sessionId]);

  if (error) return <ErrorState error={error} />;
  if (!report || !session) return <ReportLoadingState />;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-slate-50 to-violet-50/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <ReportView report={report} session={session} />
      </div>
    </div>
  );
}
