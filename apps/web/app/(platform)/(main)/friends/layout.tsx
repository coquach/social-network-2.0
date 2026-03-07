'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarCustom } from '@/components/side-bar-custom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ShieldOff, Sparkles, UserPlus, Users } from 'lucide-react';

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const title = useMemo(() => {
    if (pathname?.includes('/friends/blocked')) return 'Danh sách bị chặn';
    if (pathname?.includes('/friends/requests')) return 'Tất cả lời mời';
    if (pathname?.includes('/friends/suggestions')) return 'Đề xuất kết bạn';
    return 'Tất cả bạn bè';
  }, [pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-full w-full">
        <Sidebar className="sm:block pt-16">
          <SidebarHeader className="px-3 py-3">
            <div className="text-2xl font-bold text-sky-500">Bạn bè</div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarCustom
              items={[
                {
                  label: 'Danh sách bạn bè',
                  href: `/friends`,
                  icon: Users,
                },
                {
                  label: 'Lời mời kết bạn',
                  href: '/friends/requests',
                  icon: UserPlus,
                },
                {
                  label: 'Gợi ý kết bạn',
                  href: '/friends/suggestions',
                  icon: Sparkles,
                },
                {
                  label: 'Danh sách chặn',
                  href: '/friends/blocked',
                  icon: ShieldOff,
                },
              ]}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden text-sky-500" />
              <h1 className="text-xl font-bold text-sky-500">{title}</h1>
            </div>
          </div>
          <div className="p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
