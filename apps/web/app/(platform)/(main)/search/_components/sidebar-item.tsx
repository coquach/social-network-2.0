'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchSidebarNavItem({
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl px-3 py-2 transition text-left cursor-pointer',
        'hover:bg-sky-100',
        active && 'bg-slate-200'
      )}
    >
      <div
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
          active ? 'bg-sky-500 text-white' : 'bg-slate-200 text-sky-500'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className={cn('text-sm', active && 'font-semibold text-sky-600')}>
        {label}
      </div>
    </button>
  );
}
