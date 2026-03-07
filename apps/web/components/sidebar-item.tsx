'use client';

import { LucideIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  label?: string;
  href?: string;
  icon?: LucideIcon;

  /** Dùng cho item kiểu “select param” (Search) */
  onClick?: () => void;

  /** Override active (ưu tiên hơn pathname === href) */
  active?: boolean;

  /** Optional: cho phép truyền class ngoài */
  className?: string;
}

export const SidebarItem = ({
  label,
  href,
  icon: Icon,
  onClick,
  active,
  className,
}: SidebarItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    if (onClick) return onClick();
    if (href) router.push(href);
  }, [router, onClick, href]);

  const isActive = useMemo(() => {
    if (typeof active === 'boolean') return active;
    if (!href) return false;
    return pathname === href;
  }, [active, pathname, href]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition cursor-pointer',
        'hover:bg-slate-100 active:scale-[0.99]',
        isActive && 'bg-sky-100',
        className
      )}
    >
      {/* ICON CIRCLE */}
      <div
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
          isActive ? 'bg-sky-500 text-white' : 'bg-slate-200 text-sky-400'
        )}
      >
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>

      {/* LABEL */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm',
            isActive ? 'font-semibold text-sky-700' : 'text-sky-600'
          )}
        >
          {label}
        </p>
      </div>

   
    </button>
  );
};
