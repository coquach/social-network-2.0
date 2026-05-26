'use client';

import { AlertCircle } from 'lucide-react';
import { CommentDTO, PostDTO, SharePostDTO } from '@repo/shared';

import { ModerationCommentDetail } from './moderation-comment-detail';
import { ModerationPostDetail } from './moderation-post-detail';
import { ModerationShareDetail } from './moderation-share-detail';

type Props = {
  targetType?: string;
  target: CommentDTO | PostDTO | SharePostDTO | null;
};

const isShareTarget = (target: unknown): target is SharePostDTO => {
  return (
    Boolean(target) &&
    typeof target === 'object' &&
    'post' in (target as Record<string, unknown>)
  );
};

const isCommentTarget = (target: unknown): target is CommentDTO => {
  return (
    Boolean(target) &&
    typeof target === 'object' &&
    'rootType' in (target as Record<string, unknown>)
  );
};

const isPostTarget = (target: unknown): target is PostDTO => {
  return (
    Boolean(target) &&
    typeof target === 'object' &&
    'media' in (target as Record<string, unknown>) &&
    'audience' in (target as Record<string, unknown>)
  );
};

export function ModerationTargetDetail({ targetType, target }: Props) {
  if (!target) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-2 h-5 w-5 text-slate-400" />
        <p className="text-sm font-medium text-slate-600">
          Chưa có dữ liệu nội dung
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Không tìm thấy dữ liệu chi tiết cho nội dung bị kiểm duyệt.
        </p>
      </section>
    );
  }

  const normalizedType = targetType?.toUpperCase();

  if (normalizedType === 'SHARE' || isShareTarget(target)) {
    return <ModerationShareDetail share={target as SharePostDTO} />;
  }

  if (normalizedType === 'COMMENT' || isCommentTarget(target)) {
    return <ModerationCommentDetail comment={target as CommentDTO} />;
  }

  if (normalizedType === 'POST' || isPostTarget(target)) {
    return <ModerationPostDetail post={target as PostDTO} />;
  }

  return (
    <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <AlertCircle className="mx-auto mb-2 h-5 w-5 text-slate-400" />
      <p className="text-sm font-medium text-slate-600">
        Định dạng nội dung chưa hỗ trợ
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Hệ thống chưa có mẫu hiển thị cho loại nội dung này.
      </p>
    </section>
  );
}
