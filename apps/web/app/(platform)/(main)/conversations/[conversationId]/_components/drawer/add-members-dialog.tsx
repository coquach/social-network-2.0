'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { useMemo, useState } from 'react';

import { useFriends } from '@repo/shared';
import { useGetUser } from '@/hooks/use-user-hook';
import { DirectAvatar } from '../../../_components/direct-avatar';

const FriendRow = ({
  userId,
  query,
  isSelected,
  isExisting,
  disabledAll,
  onToggle,
}: {
  userId: string;
  query: string;
  isSelected: boolean;
  isExisting: boolean;
  disabledAll: boolean;
  onToggle: (id: string) => void;
}) => {
  const { data: user, isPending } = useGetUser(userId);

  if (isPending) {
    return (
      <div className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2">
        <div className="flex items-center gap-3 min-w-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="min-w-0 space-y-1">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-12 rounded" />
      </div>
    );
  }

  if (!user) return null;

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const normalized = `${fullName} ${user.email ?? ''}`.toLowerCase();
  if (query && !normalized.includes(query)) return null;

  return (
    <button
      type="button"
      onClick={() => {
        if (isExisting) return;
        onToggle(user.id);
      }}
      disabled={isExisting || disabledAll}
      className={`w-full flex items-center justify-between gap-3 rounded-lg border p-2 transition cursor-pointer ${
        isSelected
          ? 'border-sky-500 bg-sky-50'
          : 'border-gray-200 hover:bg-gray-50'
      } ${isExisting ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <DirectAvatar userId={user.id} className="h-10 w-10" />
        <div className="text-left min-w-0">
          <div className="text-sm font-medium truncate">{fullName}</div>
          <div className="text-xs text-gray-500 truncate">{user.email ?? ''}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {isExisting ? 'Đã là thành viên' : isSelected ? 'Đã chọn' : 'Chọn'}
      </div>
    </button>
  );
};

export const AddMembersDialog = ({
  open,
  onOpenChange,
  existingUserIds,
  onAdd,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingUserIds: string[];
  onAdd: (userIds: string[]) => void;
  isPending?: boolean;
}) => {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const {
    data,
    isPending: isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriends(undefined, { limit: 30 });

  const friendIds = useMemo(() => {
    const ids = data?.pages.flatMap((page) => page.data) ?? [];
    return Array.from(new Set(ids));
  }, [data]);

  const normalizedQuery = q.trim().toLowerCase();

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    onAdd(ids);
  };

  const disabledAll = !!isPending;
  const selectedCount = selected.size;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setQ('');
          setSelected(new Set());
        }
      }}
    >
      <DialogContent className="max-w-[560px] p-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-sky-600">
            Thêm thành viên
          </DialogTitle>
        </DialogHeader>

        <div className="px-4">
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Đã chọn {selectedCount} người</span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="hover:text-slate-700 disabled:opacity-50"
              disabled={selectedCount === 0 || disabledAll}
            >
              Bỏ chọn
            </button>
          </div>

          <div className="mt-2 h-[360px] overflow-y-auto rounded-lg border border-gray-200 p-2">
            {isLoading && !friendIds.length ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="min-w-0 space-y-1">
                        <Skeleton className="h-4 w-40 rounded" />
                        <Skeleton className="h-3 w-56 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                ))}
              </div>
            ) : friendIds.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Hiện chưa có bạn bè nào.
              </div>
            ) : (
              <div className="space-y-2">
                {friendIds.map((id) => (
                  <FriendRow
                    key={id}
                    userId={id}
                    query={normalizedQuery}
                    isSelected={selected.has(id)}
                    isExisting={existingUserIds.includes(id)}
                    disabledAll={disabledAll}
                    onToggle={toggle}
                  />
                ))}
              </div>
            )}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage || disabledAll}
              >
                {isFetchingNextPage || isFetching ? 'Đang tải...' : 'Tải thêm'}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabledAll}
          >
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={disabledAll || selected.size === 0}
          >
            Thêm ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
