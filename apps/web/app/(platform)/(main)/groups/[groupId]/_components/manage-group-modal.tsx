'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SettingForm } from './setting-form';
import { UpdateGroupForm } from './update-group-form';

type ManageGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type SectionKey = 'info' | 'settings';

export const ManageGroupDialog = ({
  open,
  onOpenChange,
}: ManageGroupDialogProps) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('info');
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sections: { key: SectionKey; label: string; description?: string }[] = [
    {
      key: 'info',
      label: 'Thông tin nhóm',
      description: 'Tên, mô tả, ảnh cover, quyền riêng tư',
    },
    {
      key: 'settings',
      label: 'Cài đặt nhóm',
      description: 'Quy tắc phê duyệt, giới hạn',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className=" w-[95vw]
          sm:max-w-[720px]
          h-[95vh]            
          p-0               
          flex flex-col
          overflow-hidden "
      >
        <SidebarProvider
          defaultOpen
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          style={{ '--sidebar-width': '16rem' } as CSSProperties}
          className="h-full min-h-0"
        >
          <div className="flex h-full min-h-0 w-full flex-col">
            <DialogHeader className="px-6 pt-4 pb-2 shrink-0">
              <DialogTitle className="text-center">Quản lý nhóm</DialogTitle>
              {
                isMobile && (
                  <SidebarTrigger
                    className="absolute top-4 left-4 p-2 rounded-md hover:bg-sky-500/10"
                    aria-label="Mở menu điều hướng"
                  />
                )
                
                  
              }
            </DialogHeader>

            <div className="flex flex-1 w-full min-h-0">
              {/* Sidebar */}
              {(isMobile || sidebarOpen) && (
                <Sidebar
                  collapsible={isMobile ? 'offcanvas' : 'none'}
                  className="border-r shink-0"
                >
                  <SidebarContent className="py-2">
                    <SidebarGroup>
                      <SidebarMenu>
                        {sections.map((sec) => (
                          <SidebarMenuItem key={sec.key}>
                            <SidebarMenuButton
                              type="button"
                              isActive={activeSection === sec.key}
                              onClick={() => setActiveSection(sec.key)}
                              className={cn(
                                'h-auto items-start gap-1.5 py-2.5',
                                'data-[active=true]:bg-sky-500/10 data-[active=true]:text-sky-500'
                              )}
                            >
                              <div className="flex flex-col">
                                <span>{sec.label}</span>
                                {sec.description && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {sec.description}
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
              )}

              {/* Main */}
              <SidebarInset className="flex-1 min-h-0">
                <div className="flex h-full min-h-0 flex-col">
                  {activeSection === 'info' && <UpdateGroupForm open={open} />}
                  {activeSection === 'settings' && <SettingForm open={open} />}
                </div>
              </SidebarInset>
            </div>
          </div>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
};
