'use client';

export function ErrorState({
  title,
  message,
  onRetry,
  onImport,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  onImport?: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 max-w-lg" role="alert">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-foreground/60">{message}</p>
      <div className="flex flex-wrap gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary text-sm py-2 px-4"
          >
            Try Again
          </button>
        )}
        {onImport && (
          <button
            type="button"
            onClick={onImport}
            className="glass rounded-lg text-sm py-2 px-4 hover:bg-accent"
          >
            Import Collection
          </button>
        )}
      </div>
    </div>
  );
}
