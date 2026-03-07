/**
 * Feed Types
 * Platform-agnostic feed-related type definitions
 */

import type { PostDTO } from './post.types';

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
  item: PostDTO; // Can be post or shared post
}
