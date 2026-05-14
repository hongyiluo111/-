'use client';

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}>
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <ShimmerBlock className="h-2 -mx-6 -mt-6 mb-4 rounded-none" />
      <div className="flex items-center mb-4">
        <ShimmerBlock className="w-16 h-16 rounded-full shrink-0" />
        <div className="ml-3 flex-1 space-y-2">
          <ShimmerBlock className="h-5 w-24" />
          <ShimmerBlock className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <ShimmerBlock className="h-3 w-full" />
        <ShimmerBlock className="h-3 w-4/5" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="space-y-1">
          <ShimmerBlock className="h-6 w-16" />
          <ShimmerBlock className="h-3 w-10" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-8 w-14 rounded-lg" />
          <ShimmerBlock className="h-8 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-2">
          <ShimmerBlock className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-28" />
            <ShimmerBlock className="h-3 w-48" />
          </div>
          <ShimmerBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 gap-4 md:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/90 dark:bg-gray-800/90 p-4 text-center shadow-md">
          <ShimmerBlock className="h-8 w-12 mx-auto mb-2" />
          <ShimmerBlock className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGameCard() {
  return (
    <div className="card overflow-hidden">
      <ShimmerBlock className="aspect-square rounded-xl mb-4" />
      <ShimmerBlock className="h-5 w-24 mb-2" />
      <div className="flex items-center justify-between">
        <ShimmerBlock className="h-4 w-16" />
        <ShimmerBlock className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}
