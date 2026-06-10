'use client';

import { NotificationCardFull } from '@/components/notification-card-full';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { Button } from '@/components/ui/button';
import { 
  useNotifications, 
  useUnreadCount, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead 
} from '@repo/shared';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

export default function NotificationsPage() {
  const { userId } = useAuth();
  
  const { data, isLoading, fetchNextPage, hasNextPage } = useNotifications();
  const { data: unreadCountData } = useUnreadCount();
  const markReadMutation = useMarkNotificationAsRead();
  const markReadAllMutation = useMarkAllNotificationsAsRead();

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  
  const unreadCount = unreadCountData ?? 0;

  return (
    <QueryErrorBoundary>
      <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-sky-400">Thông báo</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={() => markReadAllMutation.mutate()}
          disabled={unreadCount === 0}
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <NotificationCardFull.Skeleton key={i} />
          ))}
        </div>
      )}

      {/* Notification list */}
      {!isLoading && notifications.length === 0 && (
        <div className="text-gray-500 text-center py-8">Chưa có thông báo</div>
      )}

      <div className="flex flex-col gap-2">
        {notifications.map((notif) => (
          <NotificationCardFull
            key={notif._id}
            notif={notif}
            onClick={() => markReadMutation.mutate(notif._id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button onClick={() => fetchNextPage()} variant="ghost">
            Xem thêm
          </Button>
        </div>
      )}
    </div>
    </QueryErrorBoundary>
  );
}
