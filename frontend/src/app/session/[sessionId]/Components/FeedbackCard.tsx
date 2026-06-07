import { CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function FeedbackCard({ feedback }: { feedback: string }) {
  const scoreMatch = feedback.match(/Score:\s*(\d+)\/10/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

  const scoreColor =
    score === null ? "border-slate-200" :
    score >= 8 ? "border-emerald-400 bg-emerald-50" :
    score >= 6 ? "border-violet-400 bg-violet-50" :
    "border-orange-400 bg-orange-50";

  return (
    <div className={cn("rounded-xl border-2 p-5", scoreColor)}>
      {score !== null && (
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">Score: {score}/10</span>
        </div>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{feedback}</p>
    </div>
  );
}
