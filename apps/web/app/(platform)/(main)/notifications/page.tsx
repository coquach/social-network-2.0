'use client';

import { NotificationCardFull } from '@/components/notification-card-full';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { Button } from '@/components/ui/button';
import { AsyncList } from '@/components/ui/async-list';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@repo/shared/hooks';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications({});
  const notifications = data?.pages.flatMap((p) => p.data) ?? [];
  const { data: unreadCount } = useUnreadCount();
  const { mutate: markRead } = useMarkNotificationAsRead();
  const { mutate: markReadAll } = useMarkAllNotificationsAsRead();

  const { sentinelRef } = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });

  return (
    <QueryErrorBoundary>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Thông báo</h1>
              {(unreadCount ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} chưa đọc
                </p>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => markReadAll()}
            disabled={(unreadCount ?? 0) === 0}
          >
            <CheckCheck size={15} />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>

        {/* ── Notification AsyncList ── */}
        <AsyncList
          items={notifications}
          keyExtractor={(notif) => notif._id}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          skeletonCount={6}
          className="flex flex-col gap-2"
          skeleton={<NotificationCardFull.Skeleton />}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <BellOff size={28} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">Chưa có thông báo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Các hoạt động từ bạn bè và nhóm sẽ xuất hiện ở đây.
                </p>
              </div>
            </div>
          }
          renderItem={(notif) => (
            <NotificationCardFull
              notif={notif}
              onClick={() => markRead(notif._id)}
            />
          )}
          sentinelRef={sentinelRef}
          loadingMore={
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <NotificationCardFull.Skeleton key={i} />
              ))}
            </div>
          }
          stagger
        />
      </div>
    </QueryErrorBoundary>
  );
}
