import { CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";

function scoreColorFor(rounded: number | null) {
  if (rounded === null) return "border-slate-200";
  if (rounded >= 8) return "border-emerald-400 bg-emerald-50";
  if (rounded >= 6) return "border-violet-400 bg-violet-50";
  return "border-orange-400 bg-orange-50";
}

export function FeedbackCard({ score, feedback }: { score?: number | null; feedback: string }) {
  const rounded = typeof score === "number" ? Math.round(score) : null;
  const scoreColor = scoreColorFor(rounded);

  return (
    <div className={cn("rounded-xl border-2 p-5", scoreColor)}>
      {rounded !== null && (
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-slate-700">Score: {rounded}/10</span>
        </div>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{feedback}</p>
    </div>
  );
}
