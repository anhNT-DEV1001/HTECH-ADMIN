import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
      </div>

      <div className="space-y-6">
        {/* Title field skeleton */}
        <div className="space-y-1">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        </div>

        {/* Summary field skeleton */}
        <div className="space-y-1">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-20 w-full bg-muted animate-pulse rounded-md" />
        </div>

        {/* Thumbnail skeleton */}
        <div className="space-y-1">
          <div className="h-4 w-44 bg-muted animate-pulse rounded" />
          <div className="h-40 w-40 bg-muted animate-pulse rounded-lg border-2 border-dashed border-muted-foreground/20 mt-2" />
        </div>

        {/* Editor skeleton */}
        <div className="space-y-1">
          <div className="h-4 w-36 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-muted-foreground/40" />
            </div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-end gap-3 pt-4">
          <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
