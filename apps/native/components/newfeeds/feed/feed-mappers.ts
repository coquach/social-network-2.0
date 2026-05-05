import { Audience, FeedType } from '@repo/shared';
import type {
  FeedDTO,
  PostDTO,
  PostSnapshotDTO,
  SharePostDTO,
  SharePostSnapshotDTO,
} from '@repo/shared';

const toDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
};

export const toPostSnapshot = (
  post: PostSnapshotDTO | PostDTO,
): PostSnapshotDTO => {
  if ('postId' in post) {
    return {
      ...post,
      createdAt: toDate(post.createdAt),
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
    createdAt: toDate(post.createdAt),
  };
};

export const toShareSnapshot = (
  share: SharePostSnapshotDTO | SharePostDTO,
): SharePostSnapshotDTO => {
  if ('shareId' in share) {
    return {
      ...share,
      createdAt: toDate(share.createdAt),
      post: toPostSnapshot(share.post),
    };
  }

  return {
    shareId: share.id,
    userId: share.userId,
    audience: share.audience,
    content: share.content,
    post: toPostSnapshot(share.post),
    createdAt: toDate(share.createdAt),
    reactedType: share.reactedType,
    shareStat: share.shareStat,
  };
};

export const isPostFeed = (feed: FeedDTO): boolean =>
  feed.type === FeedType.POST;
export const isShareFeed = (feed: FeedDTO): boolean =>
  feed.type === FeedType.SHARE;

export const defaultAudience = Audience.PUBLIC;
