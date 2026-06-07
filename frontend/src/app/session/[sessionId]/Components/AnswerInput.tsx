import { ChevronRight, Loader2, Mic, Square } from "lucide-react";

import { Button } from "@/app/_shared-components/Button";
import { Textarea } from "@/components/_shared/textarea";
import { cn } from "@/lib/utils";

interface AnswerInputProps {
  answer: string;
  onAnswerChange: (value: string) => void;
  isSubmitting: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  recordingError: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSubmit: () => void;
}

export function AnswerInput({
  answer,
  onAnswerChange,
  isSubmitting,
  isRecording,
  isTranscribing,
  recordingError,
  onStartRecording,
  onStopRecording,
  onSubmit,
}: AnswerInputProps) {
  const inputDisabled = isSubmitting || isTranscribing;

  return (
    <div className="flex flex-col gap-4">

      <Textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="Type your answer here..."
        rows={16}
        disabled={inputDisabled}
        className="resize"
      />

      {recordingError && <p className="text-xs text-red-500">{recordingError}</p>}

      <div className="flex items-center justify-between">
      <Button
          type="button"
          size="sm"
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={inputDisabled}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
            isRecording
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          {isTranscribing && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Transcribing...
            </>
          )}
          {!isTranscribing && isRecording && (
            <>
              <Square className="h-4 w-4 fill-current" />
              Stop Recording
            </>
          )}
          {!isTranscribing && !isRecording && (
            <>
              <Mic className="h-4 w-4" />
              Record Answer
            </>
          )}
        </Button>
        <Button
          loading={isSubmitting}
          onClick={onSubmit}
          size="sm"
          disabled={!answer.trim() || isSubmitting || isRecording || isTranscribing}
          className="gap-2 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
        >
            <>
              Submit Answer
              <ChevronRight className="h-4 w-4" />
            </>
        </Button>
      </div>
    </div>
  );
}
