import {
  FeedDTO,
  FeedItem,
  FeedType,
  PostDTO,
  PostSnapshotDTO,
  SharePostDTO,
  ShareSnapshotDTO,
} from '../../types';
import { parseSafeDate } from '../../utils/date';

const postSnapshotCache = new WeakMap<object, PostSnapshotDTO>();
const shareSnapshotCache = new WeakMap<object, ShareSnapshotDTO>();

export const toPostSnapshot = (
  post: PostDTO | PostSnapshotDTO,
): PostSnapshotDTO => {
  const cached = postSnapshotCache.get(post as object);
  if (cached) return cached;

  if ('postId' in post) {
    const createdAt = parseSafeDate(post.createdAt);

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
    mainEmotion: post.mainEmotion ?? post.feeling,
    secondaryEmotions: post.secondaryEmotions,
    postStat: post.postStat,
    reactedType: post.reactedType,
    createdAt: parseSafeDate(post.createdAt),
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
    const createdAt = parseSafeDate(share.createdAt);
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
    createdAt: parseSafeDate(share.createdAt),
    reactedType: share.reactedType,
    shareStat: share.shareStat,
  };

  shareSnapshotCache.set(share as object, normalized);
  return normalized;
};

export const normalizeFeedItem = (feed: FeedDTO): FeedItem => {
  if (feed.type === FeedType.INTERVENTION) {
    const intervention = feed.intervention;
    if (!intervention) {
      throw new Error(
        `Feed item ${feed.id} of type INTERVENTION is missing intervention payload`,
      );
    }
    return {
      id: feed.id,
      type: FeedType.INTERVENTION,
      data: intervention,
    };
  }

  if (feed.type === FeedType.SHARE) {
    if (!feed.item) {
      throw new Error(
        `Feed item ${feed.id} of type SHARE is missing item payload`,
      );
    }
    return {
      id: feed.id,
      type: FeedType.SHARE,
      data: toShareSnapshot(feed.item as ShareSnapshotDTO),
    };
  }

  if (!feed.item) {
    throw new Error(
      `Feed item ${feed.id} of type POST is missing item payload`,
    );
  }

  return {
    id: feed.id,
    type: FeedType.POST,
    data: toPostSnapshot(feed.item as PostSnapshotDTO),
  };
};

/**
 * Backwards-compatible alias for normalizeFeedItem.
 */
export const normalizePersonalFeedItem = normalizeFeedItem;

export const normalizeTrendingPost = (
  post: PostDTO | PostSnapshotDTO,
): PostSnapshotDTO => toPostSnapshot(post);
