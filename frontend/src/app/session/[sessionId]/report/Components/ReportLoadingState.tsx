import { BrainCog } from "lucide-react";

export default function ReportLoadingState() {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-linear-to-br from-slate-50 to-violet-50/30">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-200 opacity-60" />
          <div className="absolute inset-2 animate-pulse rounded-full bg-violet-100" />
          <BrainCog
            className="relative h-10 w-10 text-violet-600"
            style={{ animation: "spin 3s linear infinite" }}
          />
        </div>
        <h2 className="mb-1 text-xl font-bold text-slate-900">Generating your report...</h2>
        <p className="mb-6 text-sm text-slate-500">Analyzing your interview performance</p>
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }