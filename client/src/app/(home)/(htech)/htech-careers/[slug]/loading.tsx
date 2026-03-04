import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="container animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
            </div>

            <div className="space-y-6">
                {/* Common fields skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                </div>

                {/* Title field skeleton */}
                <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                </div>

                {/* Job type / Experience skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                    </div>
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
