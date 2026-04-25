/**
 * Feed Types
 * Platform-agnostic feed-related type definitions
 */

import type { PostSnapshotDTO, ShareSnapshotDTO } from './post.types';

/**
 * Feed item type
 */
export enum FeedType {
  POST = 'POST',
  SHARE = 'SHARE',
}

/**
 * Feed item DTO
 */
export interface FeedDTO {
  id: string;
  type: FeedType;
  item: PostSnapshotDTO | ShareSnapshotDTO; // Can be post or shared post
}

export type PersonalFeedItem =
  | {
      id: string;
      type: FeedType.POST;
      data: PostSnapshotDTO;
    }
  | {
      id: string;
      type: FeedType.SHARE;
      data: ShareSnapshotDTO;
    };
