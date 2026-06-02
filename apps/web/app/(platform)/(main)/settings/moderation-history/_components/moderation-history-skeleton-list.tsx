'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function ModerationSkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/70"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-slate-100 dark:bg-slate-800" />

          <div className="space-y-4 pl-2">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-28 rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <Skeleton className="h-6 w-20 rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <Skeleton className="h-6 w-16 rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <Skeleton className="h-6 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800" />
            </div>

            <div className="space-y-3">
              <Skeleton className="h-5 w-72 max-w-full bg-slate-200/80 dark:bg-slate-800" />
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <Skeleton className="h-4 w-full bg-slate-200/80 dark:bg-slate-800" />
                <Skeleton className="mt-2 h-4 w-11/12 bg-slate-200/80 dark:bg-slate-800" />
                <Skeleton className="mt-2 h-4 w-4/5 bg-slate-200/80 dark:bg-slate-800" />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-8 w-44 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
              <Skeleton className="h-9 w-28 rounded-xl bg-slate-200/80 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
