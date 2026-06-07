import { BrainCog } from "lucide-react";

interface SessionHeaderProps {
  jobRole: string;
  experience: number;
  currentQIdx: number;
  totalQuestions: number;
}

export function SessionHeader({ jobRole, experience, currentQIdx, totalQuestions }: SessionHeaderProps) {
  const progressPct = (currentQIdx / totalQuestions) * 100;

  return (
    <div className="mb-8 text-center">
      <div className="mb-2 flex items-center justify-center gap-2 text-sm text-violet-600">
        <BrainCog className="h-4 w-4" />
        <span className="font-medium">{jobRole}</span>
        <span className="text-slate-400">•</span>
        <span className="font-medium">
          {experience} {experience === 1 ? "year" : "years"}
        </span>
      </div>

      <div className="mx-auto max-w-xs">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Question {currentQIdx + 1} of {totalQuestions}</span>
          <span>{Math.round(progressPct)}% complete</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
