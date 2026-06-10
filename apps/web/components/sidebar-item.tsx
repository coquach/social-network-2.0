'use client';

import { LucideIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { IconType } from 'react-icons';

interface SidebarItemProps {
  label?: string;
  href?: string;
  icon?: LucideIcon | IconType;

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
        'group w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 cursor-pointer',
        'hover:bg-sky-50/80 active:scale-[0.98]',
        isActive ? 'bg-sky-50 shadow-sm' : 'bg-transparent',
        className
      )}
    >
      {/* ICON */}
      <div className="flex shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {Icon ? <Icon className="h-8 w-8" /> : null}
      </div>

      {/* LABEL */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-[15px] transition-colors duration-200',
            isActive ? 'font-bold text-sky-700' : 'font-medium text-slate-600 group-hover:text-sky-600'
          )}
        >
          {label}
        </p>
      </div>
    </button>
  );
};
