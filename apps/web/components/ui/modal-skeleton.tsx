import { Skeleton } from './skeleton';

/**
 * Loading skeleton for dynamically imported modals
 * Displays a centered skeleton UI while modal chunks are being loaded
 */
export function ModalLoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-slate-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
}
