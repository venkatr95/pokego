import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative z-50">
      <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
      <h2 className="text-xl font-display font-bold animate-pulse">Loading...</h2>
      <p className="text-sm text-foreground/60 mt-2">Please wait while we process</p>
    </div>
  );
}
