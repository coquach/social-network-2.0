'use client';

import { CommentInput } from '@/components/comment/comment-input';
import { CommentList } from '@/components/comment/comment-list';
import { PostCardFull } from '@/components/post/post-card-full';
import { RootType, TargetType } from '@/models/social/enums/social.enum';
import PostActions from '@/components/post/post-action';
import PostHeader from '@/components/post/post-header';
import PostStats from '@/components/post/post-stats';
import { cn } from '@/lib/utils';
import { TextCollapse } from '@/components/text-collapse';
import { PostDTO, SharePostDTO, PostSnapshotDTO, SharePostSnapshotDTO } from '@repo/shared';
import { mapPostToSnapshot } from '@/utils/map-post-to-snapshot';
import { mapShareToSnapshot } from '@/utils/map-share-to-snapshot';
import SharedPostPreview from './share-post-review';
// Import MediaCarousel from the old location for now, we can move it later if needed.
import { MediaCarousel } from '@/app/(platform)/(main)/posts/[postId]/_components/media-carousel';

interface DetailViewProps {
  type: RootType;
  post?: PostDTO;
  share?: SharePostDTO;
  isLoading?: boolean;
  isError?: boolean;
  isModal?: boolean;
}

export function DetailView({ type, post, share, isLoading, isError, isModal }: DetailViewProps) {
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white h-[70vh]" />
          <PostCardFull.Skeleton />
        </div>
      </div>
    );
  }

  const data = type === RootType.POST && post
    ? mapPostToSnapshot(post, { previewLimit: post.media?.length ?? 0 })
    : type === RootType.SHARE && share
      ? mapShareToSnapshot(share, { previewLimit: share.post?.media?.length ?? 0 })
      : null;

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-gray-500">
        Không tải được dữ liệu.
      </div>
    );
  }

  const isShare = type === RootType.SHARE;
  
  // Type casting for easier access
  const postData = data as PostSnapshotDTO;
  const shareData = data as SharePostSnapshotDTO;

  // Determine what to show on the left side
  const originalPost = isShare ? shareData.post : null;
  const media = isShare ? [] : post?.media ?? [];
  const hasLeftContent = isShare || media.length > 0;

  // Determine stats and target info
  const targetId = isShare ? shareData.shareId : postData.postId;
  const ownerId = isShare ? shareData.userId : postData.userId;
  const stats = isShare ? shareData.shareStat : postData.postStat;
  const reactedType = isShare ? shareData.reactedType : postData.reactedType;

  return (
    <section className={cn("mx-auto w-full max-w-6xl h-full", isModal ? "p-0" : "px-2 sm:px-4 py-4 sm:py-6")}>
      <div
        className={cn(
          'grid gap-4 h-full',
          hasLeftContent ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1',
          isModal && !hasLeftContent && 'gap-0'
        )}
      >
        {/* LEFT SIDE: Media (for Post) OR Shared Post Preview (for Share) */}
        {hasLeftContent && (
          <div
            className={cn(
              'rounded-2xl overflow-hidden',
              // mobile: must have height so viewer doesn't collapse
              'h-[55vh] min-h-80',
              // lg: full height for 2-column layout
              'lg:h-auto lg:min-h-[70vh]',
              !isShare && 'border bg-black flex items-center justify-center'
            )}
          >
            {isShare && originalPost ? (
              <div className="h-full overflow-y-auto app-scroll">
                <SharedPostPreview post={originalPost} />
              </div>
            ) : (
              <MediaCarousel media={media.map(m => ({ id: m.publicId ?? m.url, url: m.url, type: m.type }))} />
            )}
          </div>
        )}

        {/* RIGHT SIDE: Header + Text + Actions + Comments */}
        <div
          className={cn(
            'bg-white overflow-hidden flex flex-col',
            hasLeftContent ? 'min-h-[70vh]' : 'min-h-[70vh] lg:min-h-[75vh]',
            isModal ? 'rounded-none border-none' : 'rounded-2xl border'
          )}
        >
          <div className="px-4 pt-4">
            <PostHeader
              data={data}
              postId={targetId}
              userId={ownerId}
              audience={data.audience}
              createdAt={data.createdAt}
            />

            <div className="mt-3">
              <TextCollapse
                text={data.content}
                maxLength={100}
                className="min-w-0 text-[15px] leading-6 text-slate-800"
                buttonClassName="mt-1 text-sm"
              />
            </div>

            <div className="mt-3">
              <PostStats
                targetId={targetId}
                targetType={isShare ? TargetType.SHARE : TargetType.POST}
                stats={stats}
                data={data}
                isShare={isShare}
              />
            </div>

            <div className="mt-2">
              <PostActions
                reactType={reactedType}
                rootId={targetId}
                rootType={type}
                data={data}
                isShare={isShare}
                disableCommentModal
              />
            </div>
          </div>

          {/* comment list scroll */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-2 app-scroll">
            <CommentList
              postId={targetId}
              ownerPostId={ownerId}
              rootType={type}
            />
          </div>

          {/* input sticky bottom */}
          <div className="border-t bg-white px-4 py-3">
            <CommentInput
              rootId={targetId}
              rootType={type}
              placeholder="Viết bình luận..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
