import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
    </div>
  );
}
