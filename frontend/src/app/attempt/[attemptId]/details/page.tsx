"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";

import AttemptDetailsComponent from "./Components/AttemptDetailsComponent";

export default function AttemptDetailsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return (
    <Suspense fallback={null}>
      <AttemptDetailsComponent attemptId={attemptId} />
    </Suspense>
  );
}
