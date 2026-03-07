import type { PostDTO, PostSnapshotDTO } from '@/models/social/post/postDTO';


const PREVIEW_LIMIT = 4;

export function mapPostToSnapshot(
  post: PostDTO,
  opts?: { previewLimit?: number }
): PostSnapshotDTO {
  const limit = opts?.previewLimit ?? PREVIEW_LIMIT;

  const media = post.media ?? [];
  const mediaPreviews = media.slice(0, limit);
  const mediaRemaining = Math.max(0, media.length - mediaPreviews.length);

  return {
    postId: post.id,
    userId: post.userId,
    group: post.group,

    content: post.content,
    audience: post.audience,

    // PostCard đang dùng mediaPreviews
    mediaPreviews,

    // nếu component PostMedia đang cần mediaRemaining để show "+N"
    mediaRemaining: mediaRemaining > 0 ? mediaRemaining : undefined,

    // bạn đang có feeling, snapshot dùng mainEmotion
    mainEmotion: post.feeling,

    postStat: post.postStat,
    reactedType: post.reactedType,

    createdAt: post.createdAt,
  };
}
