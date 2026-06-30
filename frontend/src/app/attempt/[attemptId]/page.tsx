"use client";

import { useParams } from "next/navigation";

import AttemptComponent from "./Components/AttemptComponent";

export default function AttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return <AttemptComponent attemptId={attemptId} />;
}
