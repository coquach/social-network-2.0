'use client';

import { PostSnapshotDTO } from '@repo/shared';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { TextCollapse } from '../text-collapse';
import PostHeader from './post-header';
import PostMedia from './post-media';

interface SharedPostPreviewProps {
  post?: PostSnapshotDTO | null;
}

const SharedPostPreview = ({ post }: SharedPostPreviewProps) => {
  const router = useRouter();

  const goToPost = useCallback(() => {
    if (!post?.postId) return;
    router.push(`/posts/${post.postId}`, { scroll: false });
  }, [router, post?.postId]);

  if (!post || !post.postId) {
    return (
      <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs italic text-neutral-500">
        Bài viết gốc này hiện không khả dụng hoặc đã bị gỡ bỏ.
      </div>
    );
  }


  return (
    <div className="w-full border rounded-lg bg-neutral-50 p-4 space-y-3 hover:bg-neutral-100/50 transition">
      {/* Media (nếu có) */}
      {!!post.mediaPreviews?.length && (
        <div
          onClick={(e) => e.preventDefault()}
          className="pointer-events-auto"
        >
          {/* PostMedia đã có border ngoài + border trong grid theo bản trước */}
          <PostMedia media={post.mediaPreviews} onClick={goToPost} />
        </div>
      )}

      {/* Header */}
      <PostHeader
        data={post}
        userId={post.userId}
        audience={post.audience}
        createdAt={post.createdAt}
        showSettings={false}
      />

      {/* Nội dung bài viết */}
      <TextCollapse
        text={post.content}
        maxLength={100}
        className="min-w-0 text-[15px] leading-6 text-neutral-800"
        textClassName="whitespace-pre-wrap"
        buttonClassName="mt-1 text-sm"
      />
    </div>
  );
};

export default SharedPostPreview;
