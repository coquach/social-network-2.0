'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { History, PencilLine, Loader2 } from '@/lib/icons';
import { useMemo } from 'react';
import { usePostEditHistory } from '@repo/shared';

export interface EditHistoryDTO {
  id: string;
  oldContent: string;
  editAt: Date | string;
}

export function PostEditHistoryModal({
  open,
  onOpenChange,
  postId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postId?: string;
}) {
  // ✅ chỉ fetch khi modal mở + có postId
  const enabled = open && !!postId;

  const {
    data: histories = [],
    isLoading,
    isFetching,
    isError,
  } = usePostEditHistory(enabled ? postId! : '', { enabled });

  const sorted = useMemo(() => {
    return (histories ?? [])
      .slice()
      .sort(
        (a, b) => new Date(b.editAt).getTime() - new Date(a.editAt).getTime()
      );
  }, [histories]);

  const loading = isLoading || isFetching;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-sky-100 bg-white/95">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                <History className="h-5 w-5 text-sky-600" />
              </div>

              <div>
                <DialogTitle className="text-base sm:text-lg">
                  Lịch sử chỉnh sửa
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  {loading
                    ? 'Đang tải...'
                    : sorted.length > 0
                    ? `Có ${sorted.length} lần chỉnh sửa`
                    : 'Chưa có chỉnh sửa nào'}
                </DialogDescription>
              </div>
            </div>

           
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[72vh]">
          <div className="px-5 py-4">
            {!postId ? (
              <div className="rounded-2xl border border-dashed bg-white p-6 text-center">
                <div className="mt-1 text-xs text-gray-500">
                  Không có postId để tải lịch sử.
                </div>
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-dashed bg-white p-6 text-center">
                <div className="text-sm font-medium text-gray-800">
                  Không tải được lịch sử chỉnh sửa
                </div>
    
              </div>
            ) : sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-linear-to-b from-sky-50/60 to-white p-6 text-center">
                <div className="mx-auto h-11 w-11 rounded-2xl bg-white border border-sky-100 flex items-center justify-center">
                  <PencilLine className="h-5 w-5 text-sky-600" />
                </div>
                <div className="mt-3 text-sm font-medium text-gray-800">
                  Chưa có lịch sử chỉnh sửa
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Khi bài viết được sửa, phiên bản cũ sẽ xuất hiện ở đây.
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* timeline line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-sky-100" />

                <div className="space-y-3">
                  {sorted.map((h, i) => {
                    const d = new Date(h.editAt);
                    const valid = !Number.isNaN(d.getTime());
                    const rel = valid
                      ? formatDistanceToNowStrict(d, {
                          addSuffix: true,
                          locale: vi,
                        })
                      : '';
                    const abs = valid ? format(d, 'dd/MM/yyyy HH:mm') : '';

                    return (
                      <div key={h.id} className="relative pl-7">
                        <div
                          className={cn(
                            'absolute left-1 top-4 h-3.5 w-3.5 rounded-full border',
                            i === 0
                              ? 'bg-sky-500 border-sky-200'
                              : 'bg-white border-sky-200'
                          )}
                        />

                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-3 px-4 pt-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[11px] px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                                Phiên bản #{sorted.length - i}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                {rel}
                              </span>
                            </div>

                            {abs && (
                              <span className="text-[11px] text-gray-400 shrink-0">
                                {abs}
                              </span>
                            )}
                          </div>

                          <div className="px-4 pb-4 pt-3">
                            <div className="whitespace-pre-wrap wrap-break-word text-sm text-gray-800 leading-relaxed">
                              {h.oldContent?.trim()
                                ? h.oldContent
                                : '(Không có nội dung)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
