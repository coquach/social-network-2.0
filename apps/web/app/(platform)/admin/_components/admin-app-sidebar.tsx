'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { Role } from '@/lib/role';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SIDEBAR_ITEMS } from '@/config/admin-sidebar.config';
import { SidebarUserFooter } from './footer';

export function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = SIDEBAR_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <Sidebar className="border-r border-slate-200 bg-white/90 backdrop-blur">
      <SidebarHeader>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white font-bold">
              S
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-sky-700">
                Sentimeta
              </span>
              <span className="text-xs text-slate-500 capitalize">
                {role} quản trị
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400">
            Quản lý hệ thống
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  pathname === item.url || pathname.startsWith(item.url + '/');

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="
    h-14
    p-4
    rounded-xl
    transition-all
    text-[15px]

    data-[active=true]:bg-sky-100
    data-[active=true]:text-sky-700
    data-[active=true]:font-semibold
    text-sky-500

    hover:bg-sky-50
    hover:text-sky-700
  "
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <div
                          className="
        flex h-8 w-8 items-center justify-center
        rounded-lg
        bg-sky-50
        text-sky-600

        group-data-[active=true]:bg-sky-500
        group-data-[active=true]:text-white
      "
                        >
                          <item.icon className="h-4 w-4" />
                        </div>

                        <span className="">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
