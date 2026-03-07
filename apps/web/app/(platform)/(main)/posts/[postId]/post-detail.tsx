'use client';

import { CommentInput } from '@/components/comment/comment-input';
import { CommentList } from '@/components/comment/comment-list';
import { PostCardFull } from '@/components/post/post-card-full';
import { RootType, TargetType } from '@/models/social/enums/social.enum';

import PostActions from '@/components/post/post-action';

import PostHeader from '@/components/post/post-header';
import PostStats from '@/components/post/post-stats';
import { useGetPost } from '@/hooks/use-post-hook';
import { cn } from '@/lib/utils';
import { mapPostToSnapshot } from '@/utils/map-post-to-snapshot';
import { MediaCarousel } from './_components/media-carousel';
import { TextCollapse } from '@/components/text-collapse';

export default function PostDetailView({ postId }: { postId: string }) {
  const { data: post, isLoading, isError } = useGetPost(postId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white h-[70vh]" />
          <PostCardFull.Skeleton />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-gray-500">
        Không tải được bài viết.
      </div>
    );
  }
  const snapshot = mapPostToSnapshot(post, {
    previewLimit: post?.media?.length ?? 0,
  });

  const hasMedia = (post.media?.length ?? 0) > 0;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 h-full">
      <div
        className={cn(
          'grid gap-4 h-full',
          hasMedia ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        )}
      >
        {/* LEFT: media (chỉ render nếu có) */}
        {hasMedia && (
          <div
            className={cn(
              'rounded-2xl border overflow-hidden',
              // mobile: phải có height thì viewer mới không collapse
              'h-[55vh] min-h-80',
              // lg: cho full chiều cao layout 2 cột
              'lg:h-auto lg:min-h-[70vh]'
            )}
          >
            <MediaCarousel media={post.media} />
          </div>
        )}

        {/* RIGHT: post + comments (full width nếu không có media) */}
        <div
          className={cn(
            'rounded-2xl border bg-white overflow-hidden flex flex-col',
            hasMedia ? 'min-h-[70vh]' : 'min-h-[70vh] lg:min-h-[75vh]'
          )}
        >
          <div className="px-4 pt-4">
            <PostHeader
              data={snapshot}
              postId={snapshot.postId}
              userId={snapshot.userId}
              audience={snapshot.audience}
              createdAt={snapshot.createdAt}
            />

            <div className="mt-3">
              <TextCollapse
                text={snapshot.content}
                maxLength={100}
                className="min-w-0 text-[15px] leading-6 text-slate-800"
                buttonClassName="mt-1 text-sm"
              />
            </div>

            <div className="mt-3">
              <PostStats
                targetId={snapshot.postId}
                targetType={TargetType.POST}
                stats={snapshot.postStat}
                data={snapshot}
                isShare
              />
            </div>

            <div className="mt-2">
              <PostActions
                reactType={snapshot.reactedType}
                rootId={snapshot.postId}
                rootType={RootType.POST}
                data={snapshot}
                isShare
                disableCommentModal
              />
            </div>
          </div>

          {/* comment list scroll */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-2 app-scroll">
            <CommentList
              postId={snapshot.postId}
              ownerPostId={snapshot.userId}
              rootType={RootType.POST}
            />
          </div>

          {/* input sticky bottom */}
          <div className="border-t bg-white px-4 py-3">
            <CommentInput
              rootId={snapshot.postId}
              rootType={RootType.POST}
              placeholder="Viết bình luận..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
