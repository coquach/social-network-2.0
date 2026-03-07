'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { SIDEBAR_ITEMS } from '@/config/admin-sidebar.config';

export function AdminTopbar() {
  const pathname = usePathname();
  const title = useMemo(() => {
    const currentItem = SIDEBAR_ITEMS.find((item) => pathname === item.url || pathname.startsWith(item.url + '/'));
    return currentItem ? currentItem.title : 'Bảng điều khiển';
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-sky-600" />
          <span className="text-lg font-semibold text-sky-600">{title}</span>
        </div>
      </div>
    </header>
  );
}
