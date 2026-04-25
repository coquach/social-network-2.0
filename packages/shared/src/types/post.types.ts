/**
 * Post Types
 * Platform-agnostic post-related type definitions
 */

import type { Audience, Emotion, MediaType, ReactionType } from './enums';

/**
 * Media item in posts
 */
export interface MediaDTO {
  type: MediaType;
  url: string;
  publicId?: string;
}

/**
 * Post statistics/metrics
 */
export interface PostStatDTO {
  reactions: number;
  likes: number;
  loves: number;
  hahas: number;
  wows: number;
  angrys: number;
  sads: number;
  comments: number;
  shares: number;
}

/**
 * Share statistics/metrics
 */
export interface ShareStatDTO {
  reactions: number;
  likes: number;
  loves: number;
  hahas: number;
  wows: number;
  angrys: number;
  sads: number;
  comments: number;
}

/**
 * Group info embedded in posts
 */
export interface GroupInfoDTO {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Complete post data transfer object
 */
export interface PostDTO {
  id: string;
  userId: string;
  group?: GroupInfoDTO;
  content: string;
  media: MediaDTO[];
  feeling?: Emotion;
  audience: Audience;
  postStat: PostStatDTO;
  createdAt: Date;
  updatedAt: Date;
  reactedType?: ReactionType;
}

/**
 * Minimal post data for feed/lists
 */
export interface PostSnapshotDTO {
  postId: string;
  userId: string;
  group?: GroupInfoDTO;
  content?: string;
  audience: Audience;
  mediaPreviews?: MediaDTO[];
  mediaRemaining?: number;
  mainEmotion?: Emotion;
  postStat?: PostStatDTO;
  reactedType?: ReactionType;
  createdAt: Date;
}

export interface ShareSnapshotDTO {
  shareId: string;
  userId: string;
  audience: Audience;
  content?: string;
  createdAt: Date;
  post: PostSnapshotDTO;
  shareStat: ShareStatDTO;
  reactedType?: ReactionType;
}

/**
 * Post edit history entry
 */
export interface EditHistoryDTO {
  id: string;
  oldContent: string;
  editAt: Date;
}

/**
 * Input types for post operations
 */
export interface CreatePostInput {
  content: string;
  media?: MediaDTO[];
  feeling?: Emotion;
  audience?: Audience;
  groupId?: string;
}

export interface UpdatePostInput {
  content?: string;
  audience?: Audience;
}

export interface SharePostInput {
  postId: string;
  content?: string;
  audience?: Audience;
}
