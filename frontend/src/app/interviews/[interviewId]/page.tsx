"use client";

import { useParams } from "next/navigation";

import InterviewDetailComponent from "./Components/InterviewDetailComponent";

export default function InterviewDetailPage() {
  const { interviewId } = useParams<{ interviewId: string }>();

  return <InterviewDetailComponent interviewId={interviewId} />;
}
