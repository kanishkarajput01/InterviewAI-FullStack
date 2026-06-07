"use client";

import { useParams } from "next/navigation";

import SessionComponent from "./Components/SessionComponent";

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
 
  return <SessionComponent sessionId={sessionId} />
}
