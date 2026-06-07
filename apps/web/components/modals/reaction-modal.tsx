'use client';

import { useReactions, ReactionType, TargetType } from '@repo/shared';
import { useReactionModal } from '@/store/use-post-modal';
import { Loader2 } from '@/lib/icons';
import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AvatarWithName } from '../avatar';
import { ErrorFallback } from '../error-fallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { reactionMap, reactionsUI } from '@/lib/types/reaction';

// Hoisted constants to prevent re-creation on every render
const createEmptyReactionGroups = (): Record<ReactionType, any[]> => ({
  [ReactionType.LIKE]: [],
  [ReactionType.LOVE]: [],
  [ReactionType.HAHA]: [],
  [ReactionType.WOW]: [],
  [ReactionType.SAD]: [],
  [ReactionType.ANGRY]: [],
});

export const PostReactionsModal = () => {
  const reactionModal = useReactionModal();

  const { targetId, targetType } = reactionModal;
  const [filter, setFilter] = useState<ReactionType | undefined>(undefined);
  const [countsByType, setCountsByType] = useState<Record<
    ReactionType,
    number
  > | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useReactions(
    targetId ?? '',
    (targetType as any) ?? TargetType.POST,
    filter as any,
    { enabled: !!targetId }
  );

  const { ref } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
  });

  // Extract pages array to narrow useMemo dependency
  const pages = data?.pages;
  const allReactions = useMemo(
    () => pages?.flatMap((p) => p.data) ?? [],
    [pages]
  );

  const groupedReactions = useMemo(() => {
    const groups = createEmptyReactionGroups();
    allReactions.forEach((r) => {
      if (groups[r.reactionType]) {
        groups[r.reactionType].push(r);
      }
    });
    return groups;
  }, [allReactions]);

  const groupedCounts = useMemo(() => {
    return {
      [ReactionType.LIKE]: groupedReactions[ReactionType.LIKE].length,
      [ReactionType.LOVE]: groupedReactions[ReactionType.LOVE].length,
      [ReactionType.HAHA]: groupedReactions[ReactionType.HAHA].length,
      [ReactionType.WOW]: groupedReactions[ReactionType.WOW].length,
      [ReactionType.SAD]: groupedReactions[ReactionType.SAD].length,
      [ReactionType.ANGRY]: groupedReactions[ReactionType.ANGRY].length,
    };
  }, [groupedReactions]);

  // Extract isOpen primitive to narrow effect dependency
  const isOpen = reactionModal.isOpen;
  useEffect(() => {
    if (!isOpen) {
      setFilter(() => undefined);
      return;
    }

    if (!filter) {
      setCountsByType(() => groupedCounts);
    }
  }, [isOpen, filter, groupedCounts]);

  const displayCounts = countsByType ?? groupedCounts;
  const totalCount = Object.values(displayCounts).reduce((a, b) => a + b, 0);

  const availableReactions = useMemo(() => {
    return reactionsUI.filter((r) => (displayCounts[r.type] ?? 0) > 0);
  }, [displayCounts]);

  return (
    <Dialog open={reactionModal.isOpen} onOpenChange={reactionModal.closeModal}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="border-b border-sky-100 bg-white/95 px-5 py-4">
          <DialogTitle className="text-center text-base font-semibold">
            Cảm xúc
          </DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="all"
          value={filter ? filter : 'all'}
          onValueChange={(val) => {
            if (val === 'all') setFilter(() => undefined);
            else setFilter(() => val as ReactionType);
          }}
          className="h-[50vh] p-4"
        >
          <TabsList className="flex h-12 gap-2 overflow-x-auto rounded-xl bg-slate-100 px-2">
            <TabsTrigger
              value="all"
              className="flex shrink-0 items-center justify-center gap-1"
            >
              Tất cả ({totalCount})
            </TabsTrigger>

            {availableReactions.map((r) => (
              <TabsTrigger
                key={r.type}
                value={r.type}
                className="flex shrink-0 items-center justify-center gap-1 text-lg font-medium"
              >
                <span className={r.color}>{r.emoji}</span>
                <span className="text-sm text-slate-600">
                  {displayCounts[r.type] ?? 0}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value={filter ? filter : 'all'}
            className="mt-4 max-h-[400px] space-y-3 overflow-y-auto pr-1 app-scroll"
          >
            {isError && (
              <ErrorFallback message="Đã có lỗi xảy ra. Xn vui lòng load lại trang." />
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            {!isLoading && allReactions.length === 0 && !isError && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Chưa có cảm xúc nào.
              </div>
            )}

            {!isLoading &&
              allReactions.map((rx) => {
                const rMeta = reactionMap.get(rx.reactionType);
                return (
                  <div
                    key={rx.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 hover:border-slate-200"
                  >
                    <AvatarWithName
                      userId={rx.userId}
                      reactionEmoji={rMeta?.emoji}
                    />
                  </div>
                );
              })}

            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin" />
              </div>
            )}

            <div ref={ref} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
