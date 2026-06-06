'use client';
import { PostCardPreview } from '@/components/post/post-card-preview';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useApproveGroupPost, useRejectGroupPost } from '@repo/shared';
import { CheckCircle, XCircle } from 'lucide-react';

type ModerationPostSlideProps = {
  groupId: string;
  post: PostSnapshotDTO;
};

export const ModerationPostSlide = ({ groupId, post }: ModerationPostSlideProps) => {
  const [confirmType, setConfirmType] = useState<'approve' | 'reject' | null>(
    null
  );

  const { mutate: approve, isPending: approveMutationPending } =
    useApproveGroupPost();
  const { mutate: reject, isPending: rejectMutationPending } =
    useRejectGroupPost();

  const isProcessing = approveMutationPending || rejectMutationPending;

  const handleApprove = () => {
    approve(
      { postId: post.postId, groupId },
      { onSettled: () => setConfirmType(null) }
    );
  };

  const handleReject = () => {
    reject(
      { postId: post.postId, groupId },
      { onSettled: () => setConfirmType(null) }
    );
  };


  return (
    <>
      <div className="flex flex-col gap-3 max-w-[640px] w-full">
        {/* Card bài viết, không cần stats & actions */}
        <PostCardPreview data={post} />

        {/* Hai nút duyệt / từ chối nằm chung với card */}
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            disabled={isProcessing}
            onClick={() => setConfirmType('reject')}
          >
            <XCircle className="w-4 h-4" />
            Từ chối
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isProcessing}
            onClick={() => setConfirmType('approve')}
          >
            <CheckCircle className="w-4 h-4" />
            Duyệt bài
          </Button>
        </div>
      </div>

      {/* Dialog xác nhận */}
      <AlertDialog
        open={!!confirmType}
        onOpenChange={(open) => !open && !isProcessing && setConfirmType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmType === 'approve'
                ? 'Duyệt bài viết này?'
                : 'Từ chối bài viết này?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmType === 'approve'
                ? 'Bài viết sẽ được hiển thị với tất cả thành viên trong nhóm.'
                : 'Bài viết sẽ không được hiển thị trong nhóm. Thao tác này không thể hoàn tác.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              className={
                confirmType === 'approve'
                  ? 'bg-sky-500 hover:bg-sky-600 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }
              onClick={confirmType === 'approve' ? handleApprove : handleReject}
            >
              {isProcessing
                ? 'Đang xử lý...'
                : confirmType === 'approve'
                ? 'Duyệt bài'
                : 'Từ chối bài'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
