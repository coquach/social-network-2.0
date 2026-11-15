import type { PostDTO, PostSnapshotDTO } from '@repo/shared';


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

    // ưu tiên mainEmotion (AI) rồi mới fallback về feeling (user legacy)
    mainEmotion: post.mainEmotion ?? post.feeling,
    secondaryEmotions: post.secondaryEmotions,

    postStat: post.postStat,
    reactedType: post.reactedType,

    createdAt: post.createdAt,
  };
}
