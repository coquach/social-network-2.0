'use client';

import { NotificationCardCompact } from '@/components/notification-card-compact';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notification-hooks';
import { useAuth } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export const NotificationDropdown = () => {
  const { userId } = useAuth();
  const { notifications, isLoading, markRead, markReadAll, unreadCount } =
    useNotifications(userId as string);

  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative h-full flex items-center justify-center p-2 hover:bg-sky-500/10 rounded-md cursor-pointer">
          <Bell size={22} className="text-sky-400" fill="#38bdf8" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 bg-white shadow-xl rounded-xl border border-gray-200"
        align="end"
        sideOffset={8}
      >
        <div className="flex justify-between items-center px-3 py-2 border-b">
          <span className="font-semibold text-sky-400">Thông báo</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              markReadAll();
              setOpen(false);
            }}
            disabled={unreadCount === 0}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </div>
        {/* Nội dung */}
        <div className="flex flex-col gap-2 p-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <NotificationCardCompact.Skeleton key={i} />
            ))
          ) : notifications.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              Chưa có thông báo
            </div>
          ) : (
            notifications.slice(0, 5).map((notif) => (
              <DropdownMenuItem
                key={notif._id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <NotificationCardCompact notif={notif} onClick={markRead} />
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuItem asChild>
          <Link
            href="/notifications"
            className="w-full flex items-center justify-center py-2 text-sm text-sky-500 hover:bg-sky-500/10 cursor-pointer"
          >
            Xem tất cả
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
