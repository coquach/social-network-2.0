'use client';

import { useShareListModal } from '@/store/use-post-modal';
import { Loader2 } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

import { usePostShares } from '@repo/shared';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { ErrorFallback } from '../error-fallback';

import PostHeader from '../post/post-header';
import { TextCollapse } from '../text-collapse';

export const ShareListModal = () => {
  const { isOpen, closeModal, postId } = useShareListModal();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = usePostShares(postId ?? '', {});

  const { ref, inView } = useInView({
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allShares = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-center text-lg font-semibold">
            Danh sách chia sẻ
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          {isError ? (
            <ErrorFallback message={error.message} />
          ) : isLoading ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Đang tải...
            </div>
          ) : allShares.length > 0 ? (
            <div className="divide-y space-y-2 p-4">
              {allShares.map((share, idx) => (
                <div
                  key={share.shareId}
                  className="flex flex-col items-start gap-3 p-3 rounded-2xl"
                  ref={idx === allShares.length - 1 ? ref : null}
                >
                  <PostHeader
                    data={share}
                    postId={share.shareId}
                    userId={share.userId}
                    createdAt={share.createdAt}
                    audience={share.audience}
                    showSettings={false}
                  />
                  <TextCollapse
                    text={share.content}
                    maxLength={100}
                    className="min-w-0 text-[15px] leading-6 text-neutral-800"
                    buttonClassName="mt-1 text-sm"
                  />
                </div>
              ))}

              {isFetchingNextPage && (
                <div className="flex justify-center items-center py-4 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Đang tải thêm...
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              Chưa có ai chia sẻ bài viết này
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
