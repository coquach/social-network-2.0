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
  INTERVENTION = 'INTERVENTION',
}

/**
 * Safe Space intervention card payload (AI chatbot entry point)
 */
export interface FeedInterventionDTO {
  id: string;
  type: 'AI_CHATBOT_SAFE_SPACE';
  title: string;
  description: string;
  buttonText: string;
}

/**
 * Feed item DTO
 */
export interface FeedDTO {
  id: string;
  type: FeedType;
  item?: PostSnapshotDTO | ShareSnapshotDTO; // Can be post or shared post
  intervention?: FeedInterventionDTO; // Present when type is INTERVENTION
}

export type FeedItem =
  | {
      id: string;
      type: FeedType.POST;
      data: PostSnapshotDTO;
    }
  | {
      id: string;
      type: FeedType.SHARE;
      data: ShareSnapshotDTO;
    }
  | {
      id: string;
      type: FeedType.INTERVENTION;
      data: FeedInterventionDTO;
    };

/**
 * Backwards-compatible alias: personal feed items share the same
 * polymorphic shape as trending feed items.
 */
export type PersonalFeedItem = FeedItem;
