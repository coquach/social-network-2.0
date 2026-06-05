'use client';

import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

import { useSearchUsers } from '@repo/shared';
import type { UserDTO } from '@/models/user/userDTO';

import { ConversationUserResult } from './conversation-user-result';

export function ConversationSearchOverlay({
  query,
  onPickUser,
  disabled,
}: {
  query: string;
  onPickUser: (u: UserDTO) => void;
  disabled?: boolean;
}) {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;

  const usersQ = useSearchUsers({ query: trimmedQuery });
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usersQ;

  const items = hasQuery
    ? data?.pages.flatMap((page) => page.data ?? []) ?? []
    : [];

  const { ref, inView } = useInView({ rootMargin: '260px' });

  React.useEffect(() => {
    if (!hasQuery) return;
    if (!inView) return;
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasQuery, inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="absolute left-0 right-0 px-5">
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Kết quả tìm kiếm
          </div>
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Đang tải thêm…
            </div>
          )}
        </div>

        <div className="max-h-[calc(100vh-240px)] overflow-y-auto px-1 pb-3">
          {!hasQuery ? (
            <div className="px-3 py-6 text-sm text-slate-500 text-center">
              Hãy nhập từ khóa để tìm người dùng.
            </div>
          ) : isLoading ? (
            <div className="px-3 py-6 text-sm text-slate-500 flex items-center gap-2 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tìm kiếm…
            </div>
          ) : isError ? (
            <div className="px-3 py-4 text-sm text-red-500">
              {(error as Error)?.message ?? 'Tìm kiếm thất bại.'}
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-6 text-sm text-slate-500 text-center">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {items.map((u: UserDTO) => (
                  <ConversationUserResult
                    key={u.id}
                    user={u}
                    onPick={onPickUser}
                    disabled={disabled}
                  />
                ))}
              </div>

              <div ref={ref} />

              {!hasNextPage && (
                <div className="px-3 pt-2 text-[11px] text-slate-500 text-center">
                  Đã hiển thị hết.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
