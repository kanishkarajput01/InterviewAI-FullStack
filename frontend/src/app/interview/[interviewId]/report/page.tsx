"use client";

import { useParams } from "next/navigation";

import ReportComponent from "./Components/ReportComponent";

export default function ReportPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
return <ReportComponent interviewId={interviewId} />
}
