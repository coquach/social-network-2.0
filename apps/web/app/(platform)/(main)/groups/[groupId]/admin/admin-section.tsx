'use client';

import { useState } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { GroupAdminJoinRequestsSection } from './_components/join-request/admin-join-request-section';
import { GroupAdminLogsSection } from './_components/logs/admin-logs-section';
import { GroupAdminMembersSection } from './_components/members/admin-members-section';
import { GroupAdminPostsSection } from './_components/posts/admin-posts-section';

type GroupAdminPanelProps = {
  groupId: string;
};

type AdminTabKey = 'members' | 'posts' | 'joinRequests' | 'reports' | 'logs';

const TABS: { key: AdminTabKey; label: string; desc?: string }[] = [
  {
    key: 'members',
    label: 'Quản lý thành viên',
    desc: 'Vai trò, quyền, trạng thái',
  },
  { key: 'posts', label: 'Kiểm duyệt bài', desc: 'Duyệt / từ chối bài viết' },
  {
    key: 'joinRequests',
    label: 'Yêu cầu tham gia',
    desc: 'Xử lý yêu cầu vào nhóm',
  },
  { key: 'logs', label: 'Nhật ký hoạt động', desc: 'Xem hoạt động quản trị' },
];

export const GroupAdminPanel = ({ groupId }: GroupAdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<AdminTabKey>('members');
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen className="min-h-0 items-start">
      <div className="flex w-full gap-4 items-start">
        {/* Sidebar tabs */}
        <Sidebar
          collapsible={isMobile ? 'offcanvas' : 'none'}
          className="border rounded-xl bg-white shadow-md h-fit"
        >
          <SidebarHeader className="p-2">
            <div className="rounded-lg border border-sky-100 bg-sky-50 px-2 py-3">
              <h2 className="text-sm font-semibold text-sky-600">Quản lý nhóm</h2>
              <p className="text-[11px] text-sky-500/80">
                Chỉ hiển thị với quản trị viên / mod.
              </p>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 pb-2">
            <SidebarGroup>
              <SidebarMenu>
                {TABS.map((tab) => (
                  <SidebarMenuItem key={tab.key}>
                    <SidebarMenuButton
                      type="button"
                      isActive={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'h-auto  items-start gap-1.5 px-3 py-2 text-left border border-transparent',
                        'data-[active=true]:bg-sky-500 data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:border-sky-500',
                        'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{tab.label}</span>
                        {tab.desc && (
                          <span
                            className={cn(
                              'text-[11px]',
                              activeTab === tab.key
                                ? 'text-sky-50/90'
                                : 'text-slate-400'
                            )}
                          >
                            {tab.desc}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-3 flex items-center gap-2 md:hidden">
            <SidebarTrigger />
            <div className="text-sm font-semibold text-slate-700">
              {TABS.find((tab) => tab.key === activeTab)?.label}
            </div>
          </div>

          {activeTab === 'members' && (
            <GroupAdminMembersSection groupId={groupId} />
          )}
          {activeTab === 'posts' && <GroupAdminPostsSection groupId={groupId} />}
          {activeTab === 'joinRequests' && (
            <GroupAdminJoinRequestsSection groupId={groupId} />
          )}
          {activeTab === 'logs' && <GroupAdminLogsSection groupId={groupId} />}
        </main>
      </div>
    </SidebarProvider>
  );
};
