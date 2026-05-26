import * as React from 'react';

import { cn } from '@/lib/utils';

type ProgressProps = React.ComponentProps<'div'> & {
  value?: number;
};

function Progress({ className, value = 0, ...props }: ProgressProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(normalized)}
      className={cn(
        'bg-secondary/70 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <div
        className="bg-primary h-full w-full flex-1 transition-transform"
        style={{ transform: `translateX(-${100 - normalized}%)` }}
      />
    </div>
  );
}

export { Progress };
