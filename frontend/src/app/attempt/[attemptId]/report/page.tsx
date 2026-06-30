"use client";

import { useParams } from "next/navigation";

import ReportComponent from "./Components/ReportComponent";

export default function ReportPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return <ReportComponent attemptId={attemptId} />;
}
