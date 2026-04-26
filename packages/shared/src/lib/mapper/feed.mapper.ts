import {
  FeedDTO,
  FeedType,
  PersonalFeedItem,
  PostDTO,
  PostSnapshotDTO,
  SharePostDTO,
  ShareSnapshotDTO,
} from '../../types';

const postSnapshotCache = new WeakMap<object, PostSnapshotDTO>();
const shareSnapshotCache = new WeakMap<object, ShareSnapshotDTO>();

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date();
};

export const toPostSnapshot = (
  post: PostDTO | PostSnapshotDTO,
): PostSnapshotDTO => {
  const cached = postSnapshotCache.get(post as object);
  if (cached) return cached;

  if ('postId' in post) {
    const createdAt = toDate(post.createdAt);

    const normalized =
      post.createdAt instanceof Date &&
      post.createdAt.getTime() === createdAt.getTime()
        ? post
        : { ...post, createdAt };

    postSnapshotCache.set(post as object, normalized);
    return normalized;
  }

  const normalized: PostSnapshotDTO = {
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

  postSnapshotCache.set(post as object, normalized);
  return normalized;
};

export const toShareSnapshot = (
  share: SharePostDTO | ShareSnapshotDTO,
): ShareSnapshotDTO => {
  const cached = shareSnapshotCache.get(share as object);
  if (cached) return cached;

  if ('shareId' in share) {
    const createdAt = toDate(share.createdAt);
    const normalizedPost = toPostSnapshot(share.post);

    const normalized =
      share.createdAt instanceof Date &&
      share.createdAt.getTime() === createdAt.getTime() &&
      share.post === normalizedPost
        ? share
        : { ...share, createdAt, post: normalizedPost };

    shareSnapshotCache.set(share as object, normalized);
    return normalized;
  }

  const normalized: ShareSnapshotDTO = {
    shareId: share.id,
    userId: share.userId,
    audience: share.audience,
    content: share.content,
    post: toPostSnapshot(share.post),
    createdAt: toDate(share.createdAt),
    reactedType: share.reactedType,
    shareStat: share.shareStat,
  };

  shareSnapshotCache.set(share as object, normalized);
  return normalized;
};

export const normalizePersonalFeedItem = (feed: FeedDTO): PersonalFeedItem => {
  if (feed.type === FeedType.SHARE) {
    return {
      id: feed.id,
      type: FeedType.SHARE,
      data: toShareSnapshot(feed.item as ShareSnapshotDTO),
    };
  }

  return {
    id: feed.id,
    type: FeedType.POST,
    data: toPostSnapshot(feed.item as PostSnapshotDTO),
  };
};

export const normalizeTrendingPost = (
  post: PostDTO | PostSnapshotDTO,
): PostSnapshotDTO => toPostSnapshot(post);
