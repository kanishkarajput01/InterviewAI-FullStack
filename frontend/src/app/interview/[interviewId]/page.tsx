"use client";

import { useParams } from "next/navigation";

import InterviewComponent from "./Components/InterviewComponent";

export default function InterviewPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
 
  return <InterviewComponent interviewId={interviewId} />
}
