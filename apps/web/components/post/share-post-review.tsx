'use client';

import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { TextCollapse } from '../text-collapse';
import PostHeader from './post-header';
import PostMedia from './post-media';

interface SharedPostPreviewProps {
  post: PostSnapshotDTO
}

const SharedPostPreview = ({ post }: SharedPostPreviewProps) => {
  const router = useRouter();

  const goToPost = useCallback(() => {
    if (!post?.postId) return;
    router.push(`/post/${post.postId}`);
  }, [router, post?.postId]);


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
