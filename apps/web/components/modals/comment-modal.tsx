'use client';
import { RootType, PostSnapshotDTO, SharePostSnapshotDTO } from '@repo/shared';
import { useCommentModal } from '@/store/use-post-modal';
import { useMemo } from 'react';
import { CommentInput } from '../comment/comment-input';
import { CommentList } from '../comment/comment-list';
import { PostCardFull } from '../post/post-card-full';
import { ShareCard } from '../post/share-post';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

export const CommentPostModal = () => {
  const { isOpen, rootId, rootType,ownerPostId, data, closeModal } = useCommentModal();
  const renderedPost = useMemo(() => {
    if (!data || !rootId || !rootType || !ownerPostId) return null;

    if (rootType === RootType.SHARE) {
      return <ShareCard data={data as SharePostSnapshotDTO} />;
    }
    return <PostCardFull data={data as PostSnapshotDTO} />;
  }, [data, rootId, rootType, ownerPostId]);

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-2xl w-[92vw] max-w-2xl p-0 overflow-hidden overflow-x-hidden">
        <DialogHeader className="shrink-0 border-b border-sky-100 bg-white/95 px-4 py-3">
          <DialogTitle className="text-center">
            Bình luận
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="max-h-[65vh]">
          <div className="flex flex-col gap-2 ">
            {renderedPost || (
              <div className="text-center text-gray-500 ">
                Không có dữ liệu bài viết
              </div>
            )}

            {/* Danh sách comment */}
            <div className="px-4">
              {rootId && rootType && ownerPostId && (
                <CommentList postId={rootId} ownerPostId={ownerPostId} rootType={rootType} />
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="shrink-0 border-t border-sky-100 bg-white/95 px-4 py-3">
          {rootId && rootType && (
            <CommentInput
              rootId={rootId}
              rootType={rootType}
              placeholder="Viết bình luận..."
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
