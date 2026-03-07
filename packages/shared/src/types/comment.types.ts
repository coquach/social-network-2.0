/**
 * Comment Types
 * Platform-agnostic comment-related type definitions
 */

import type { MediaDTO } from './post.types';
import type { RootType, ReactionType } from './enums';

/**
 * Comment statistics/metrics
 */
export interface CommentStatDTO {
  reactions: number;
  likes: number;
  loves: number;
  hahas: number;
  wows: number;
  angrys: number;
  sads: number;
  replies: number;
}

/**
 * Complete comment data transfer object
 */
export interface CommentDTO {
  id: string;
  userId: string;
  rootId: string;
  rootType: RootType;
  parentId?: string;
  content: string;
  media?: MediaDTO;
  commentStat: CommentStatDTO;
  reactedType?: ReactionType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal comment data for nested replies
 */
export interface CommentSnapshotDTO {
  id: string;
  userId: string;
  content: string;
  media?: MediaDTO;
  replyCount: number;
  createdAt: Date;
}

/**
 * Input types for comment operations
 */
export interface CreateCommentInput {
  rootId: string;
  rootType: RootType;
  parentId?: string;
  content: string;
  media?: MediaDTO;
}

export interface UpdateCommentInput {
  content?: string;
  media?: MediaDTO;
}
