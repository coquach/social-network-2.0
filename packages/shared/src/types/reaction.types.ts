/**
 * Reaction Types
 * Platform-agnostic reaction-related type definitions
 */

import type { ReactionType, TargetType } from './enums';

/**
 * Reaction data transfer object
 */
export interface ReactionDTO {
  id: string;
  userId: string;
  reactionType: ReactionType;
}

/**
 * Reaction with target information
 */
export interface ReactionWithTargetDTO extends ReactionDTO {
  targetId: string;
  targetType: TargetType;
  createdAt: Date;
}

/**
 * Aggregated reaction counts
 */
export interface ReactionCountDTO {
  reactionType: ReactionType;
  count: number;
}

/**
 * Input types for reaction operations
 */
export interface CreateReactionInput {
  targetId: string;
  targetType: TargetType;
  reactionType: ReactionType;
}

export interface RemoveReactionInput {
  targetId: string;
  targetType: TargetType;
}
