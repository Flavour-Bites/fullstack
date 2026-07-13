type SkeletonProps = { className?: string; key?: number | string };

export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`h-3 bg-stone-200 dark:bg-stone-800 rounded-sm animate-pulse ${className}`}
    />
  );
}

export function SkeletonBlock({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-stone-200 dark:bg-stone-800 rounded-sm animate-pulse ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm p-5 space-y-3">
      <SkeletonLine className="w-1/3 h-4" />
      <SkeletonLine className="w-2/3 h-3" />
      <SkeletonLine className="w-full h-3" />
      <SkeletonLine className="w-3/4 h-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
      <div className="bg-stone-100 dark:bg-[#15110f] p-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_1, i) => (
            <SkeletonLine key={i} className="h-3 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_1, r) => (
        <div key={r} className="flex gap-8 p-4 border-b border-stone-200/50 dark:border-stone-800/50">
          {Array.from({ length: cols }).map((_2, c) => (
            <SkeletonLine key={c} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-stone-50 dark:bg-[#1d1916] border border-stone-200 dark:border-stone-800 rounded-sm overflow-hidden">
          <SkeletonBlock className="aspect-[3/4] w-full rounded-none" />
          <div className="p-4 space-y-2">
            <SkeletonLine className="w-1/2 h-4" />
            <SkeletonLine className="w-3/4 h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
