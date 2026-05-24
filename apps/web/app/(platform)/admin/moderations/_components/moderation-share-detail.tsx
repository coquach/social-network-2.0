'use client';

import * as React from 'react';
import { SharePostDTO } from '@repo/shared';

import { Button } from '@/components/ui/button';
import { formatDateVN } from '@/utils/user.utils';
import { MediaPreviewGrid } from './media-preview-grid';

type Props = {
  share: SharePostDTO;
};

export function ModerationShareDetail({ share }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [postExpanded, setPostExpanded] = React.useState(false);

  return (
    <section className="space-y-4 rounded-xl border border-slate-100 bg-white p-4">
      <h3 className="text-sm font-semibold text-sky-700">Chi tiết chia sẻ</h3>

      <div className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Nội dung share</p>
        <p
          className={`whitespace-pre-wrap text-sm text-slate-700 ${expanded ? '' : 'line-clamp-4'}`}
        >
          {share.content || 'Không có nội dung chia sẻ.'}
        </p>
        {share.content && share.content.length > 220 ? (
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
          <p className="text-xs text-slate-500">Audience</p>
          <p className="text-sm font-medium text-slate-700">{share.audience}</p>
        </div>
        <div className="rounded-lg border border-slate-100 p-3">
          <p className="text-xs text-slate-500">Created At</p>
          <p className="text-sm font-medium text-slate-700">
            {formatDateVN(share.createdAt as unknown as string)}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs font-medium text-slate-500">
          Thông tin bài post được share
        </p>
        <p
          className={`whitespace-pre-wrap text-sm text-slate-700 ${postExpanded ? '' : 'line-clamp-4'}`}
        >
          {share.post?.content || 'Bài viết gốc không có nội dung.'}
        </p>
        {share.post?.content && share.post.content.length > 220 ? (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-xs text-sky-700"
            onClick={() => setPostExpanded((prev) => !prev)}
          >
            {postExpanded ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-white p-3">
            <p className="text-xs text-slate-500">Audience bài gốc</p>
            <p className="text-sm font-medium text-slate-700">
              {share.post?.audience ?? 'N/A'}
            </p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-white p-3">
            <p className="text-xs text-slate-500">Created At bài gốc</p>
            <p className="text-sm font-medium text-slate-700">
              {share.post?.createdAt
                ? formatDateVN(share.post.createdAt as unknown as string)
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">
          Media preview bài gốc
        </p>
        <MediaPreviewGrid
          media={share.post?.media ?? []}
          emptyText="Bài viết gốc không có media preview."
        />
      </div>
    </section>
  );
}
