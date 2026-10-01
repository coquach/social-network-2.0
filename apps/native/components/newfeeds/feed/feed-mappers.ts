import { Audience, FeedType, parseSafeDate } from '@repo/shared';
import type {
  FeedDTO,
  PostDTO,
  PostSnapshotDTO,
  SharePostDTO,
  SharePostSnapshotDTO,
} from '@repo/shared';

export const toPostSnapshot = (
  post: PostSnapshotDTO | PostDTO,
): PostSnapshotDTO => {
  if ('postId' in post) {
    return {
      ...post,
      createdAt: parseSafeDate(post.createdAt),
    };
  }

  return {
    postId: post.id,
    userId: post.userId,
    group: post.group,
    content: post.content,
    audience: post.audience,
    mediaPreviews: post.media,
    mediaRemaining: 0,
    mainEmotion: post.feeling,
    postStat: post.postStat,
    reactedType: post.reactedType,
    createdAt: parseSafeDate(post.createdAt),
  };
};

export const toShareSnapshot = (
  share: SharePostSnapshotDTO | SharePostDTO,
): SharePostSnapshotDTO => {
  if ('shareId' in share) {
    return {
      ...share,
      createdAt: parseSafeDate(share.createdAt),
      post: toPostSnapshot(share.post),
    };
  }

  return {
    shareId: share.id,
    userId: share.userId,
    audience: share.audience,
    content: share.content,
    post: toPostSnapshot(share.post),
    createdAt: parseSafeDate(share.createdAt),
    reactedType: share.reactedType,
    shareStat: share.shareStat,
  };
};

export const isPostFeed = (feed: FeedDTO): boolean =>
  feed.type === FeedType.POST;
export const isShareFeed = (feed: FeedDTO): boolean =>
  feed.type === FeedType.SHARE;

export const defaultAudience = Audience.PUBLIC;
