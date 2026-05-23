'use client';

import * as React from 'react';
import { CommentDTO } from '@repo/shared';

import { Button } from '@/components/ui/button';
import { formatDateVN } from '@/utils/user.utils';
import { MediaPreviewGrid } from './media-preview-grid';

type Props = {
  comment: CommentDTO;
};

export function ModerationCommentDetail({ comment }: Props) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <section className="space-y-4 rounded-xl border border-slate-100 bg-white p-4">
      <h3 className="text-sm font-semibold text-sky-700">Chi tiết bình luận</h3>

      <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Nội dung comment</p>
        <p
          className={`whitespace-pre-wrap text-sm text-slate-700 ${expanded ? '' : 'line-clamp-4'}`}
        >
          {comment.content || 'Không có nội dung bình luận.'}
        </p>
        {comment.content && comment.content.length > 220 ? (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs text-sky-700"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-xs text-slate-500">Root type</p>
          <p className="text-sm font-medium text-slate-700">
            {comment.rootType}
          </p>
        </div>

        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-xs text-slate-500">Created At</p>
          <p className="text-sm font-medium text-slate-700">
            {formatDateVN(comment.createdAt as unknown as string)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Media</p>
        <MediaPreviewGrid
          media={comment.media ? [comment.media] : []}
          emptyText="Comment không có media."
        />
      </div>
    </section>
  );
}
