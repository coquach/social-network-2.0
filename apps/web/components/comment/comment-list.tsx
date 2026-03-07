'use client';

import { useGetComments } from '@/hooks/user-comment-hook';
import { RootType } from '@/models/social/enums/social.enum';
import { useMemo } from 'react';
import { ErrorFallback } from '../error-fallback';
import { CommentItem } from './comment-item';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface CommentListProps {
  postId: string;
  ownerPostId: string;
  rootType: RootType;
}

export const CommentList = ({ postId, ownerPostId ,rootType }: CommentListProps) => {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetComments({
    rootId: postId,
    rootType,
  });

  const { rootComments } = useMemo(() => {
    const all = data?.pages?.flatMap((p) => p.data) ?? [];
    const root = all.filter((c) => !c.parentId);
    return { rootComments: root };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <CommentItem.Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorFallback
        message={error?.message || 'Đã có lỗi xảy ra khi tải bình luận.'}
      />
    );
  }

  return (
    <div className="space-y-3 w-full">
      {rootComments.length === 0 ? (
        <div className="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận nhé!
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((c) => (
            <CommentItem
              key={c.id}
              ownerPostId={ownerPostId}
              comment={c}
              rootId={postId}
              rootType={rootType}
            />
          ))}
        </div>
      )}

      {/* fetching next page skeleton */}
      {isFetchingNextPage && (
        <div className="space-y-2">
          <CommentItem.Skeleton />
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center pt-1">
          <Button
            variant="ghost"
            className="text-xs text-sky-600 font-medium"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Tải thêm bình luận'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
