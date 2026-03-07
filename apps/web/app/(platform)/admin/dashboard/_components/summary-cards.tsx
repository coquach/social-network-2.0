'use client';

import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type SummaryCard = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  accent: string;
};

export function SummaryCards({ items, loading }: { items: SummaryCard[] ; loading: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((card) => (
        <div key={card.label} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className={cn('absolute inset-0 bg-linear-to-br', card.gradient)} />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-sky-600">{card.label}</p>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-24" />
              ) : (
                <p className={cn('text-3xl font-bold', card.accent)}>{card.value.toLocaleString('vi-VN')}</p>
              )}
            
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-sky-600 shadow-inner">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
