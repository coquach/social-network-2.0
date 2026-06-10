import type { SharePostDTO, SharePostSnapshotDTO } from '@repo/shared';
import { mapPostToSnapshot } from './map-post-to-snapshot';

export function mapShareToSnapshot(
  share: SharePostDTO,
  opts?: { previewLimit?: number }
): SharePostSnapshotDTO {
  return {
    shareId: share.id,
    userId: share.userId,
    audience: share.audience,
    content: share.content,
    post: mapPostToSnapshot(share.post, opts),
    createdAt: share.createdAt,
    reactedType: share.reactedType,
    shareStat: share.shareStat,
  };
}
