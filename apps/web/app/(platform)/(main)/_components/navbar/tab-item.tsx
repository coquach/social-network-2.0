'use client';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface TabItemProps {
  label?: string;
  href?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export const TabItem = ({
  label,
  href,
  icon: Icon,
  onClick,
}: TabItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const handleClick = useCallback(() => {
    if (onClick) {
      return onClick();
    }
    if (href) {
      router.push(href);
    }
  }, [router, onClick, href]);

  const isActive =
    href && pathname
      ? pathname === href || pathname.startsWith(`${href}/`)
      : false;


  return (
    <div title={label} onClick={handleClick} className='flex-1 flex items-center w-full h-full p-2 '>
      <div
        className={cn(
          ' rounded-sm w-full h-full flex items-center justify-center cursor-pointer transition  ',
          isActive ? "bg-sky-500/10 border-b-4 border-b-sky-500" : "hover:my-2   hover:bg-sky-500/10",
        )}
      >
        {Icon && <Icon size={26} color='#00bcff'  />}
      </div>
    </div>
  );
};
