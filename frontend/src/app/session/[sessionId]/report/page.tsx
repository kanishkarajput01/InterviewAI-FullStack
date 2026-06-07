"use client";

import { useParams } from "next/navigation";

import ReportComponent from "./Components/ReportComponent";

export default function ReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
return <ReportComponent sessionId={sessionId} />
}
