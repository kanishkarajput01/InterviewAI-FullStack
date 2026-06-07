import { ChevronRight } from "lucide-react";

import { Button } from "@/app/_shared-components/Button";

import { FeedbackCard } from "./FeedbackCard";

interface FeedbackViewProps {
  answer: string;
  feedback: string;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function FeedbackView({ answer, feedback, isLastQuestion, onNext }: FeedbackViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Your Answer</p>
        <p className="text-sm text-slate-700">{answer}</p>
      </div>

      <FeedbackCard feedback={feedback} />

      <div className="flex justify-end">
        <Button onClick={onNext} size="sm" className="gap-2 bg-violet-600 text-white hover:bg-violet-700">
          {isLastQuestion ? "View Report" : "Next Question"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
