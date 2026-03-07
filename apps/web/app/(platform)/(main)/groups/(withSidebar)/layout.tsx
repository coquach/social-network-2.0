'use client';

import { useMemo, useState } from 'react';
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
import { Globe2, Mail, PlusCircle, UsersRound } from 'lucide-react';
import { CreateGroupDialog } from './_components/create-group';
import { Button } from '@/components/ui/button';

export default function GrroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const title = useMemo(() => {
    if (pathname?.includes('/groups/explore')) return 'Nhóm đề xuất';
    if (pathname?.includes('/groups/my-groups')) return 'Nhóm đã tham gia';
    if (pathname?.includes('/groups/invites')) return 'Lời mời tham gia';
    return 'Nhóm';
  }, [pathname]);

  return (
    <SidebarProvider>
      <CreateGroupDialog
        open={createGroupModalOpen}
        onOpenChange={setCreateGroupModalOpen}
      />
      <div className="flex w-full min-h-w-full">
        <Sidebar className="sm:block pt-16">
          <SidebarHeader className="px-3 py-3">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-sky-500">Nhóm</div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-sky-600"
                onClick={() => setCreateGroupModalOpen(true)}
                asChild
              >
                <PlusCircle className="h-6 w-6 text-sky-500" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarCustom
              items={[
                {
                  label: 'Khám phá',
                  href: `/groups/explore`,
                  icon: Globe2,
                },
                {
                  label: 'Nhóm của tôi',
                  href: '/groups/my-groups',
                  icon: UsersRound,
                },
                {
                  label: 'Lời mời',
                  href: '/groups/invites',
                  icon: Mail,
                },
              ]}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/70 px-4 py-3 backdrop-blur">
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
