export function ErrorState({ error }: { error: string }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">Something went wrong</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    </div>
  );
}
