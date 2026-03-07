/**
 * Reaction Service
 * Platform-agnostic reaction-related API operations
 */

import { getApiClient } from '../client';
import type {
  CursorPaginatedResponse,
  CreateReactionInput,
  RemoveReactionInput,
  ReactionDTO,
  CursorPagination,
  TargetType,
  ReactionType,
} from '../../types';

export interface GetReactionsParams extends CursorPagination {
  targetId: string;
  targetType: TargetType;
  reactionType?: ReactionType;
}

export const reactionService = {
  /**
   * Get reactions for a target (post, comment, share)
   */
  async getReactions(params: GetReactionsParams): Promise<CursorPaginatedResponse<ReactionDTO>> {
    return getApiClient().get('/reactions', { params });
  },

  /**
   * React to a target
   */
  async react(input: CreateReactionInput): Promise<void> {
    return getApiClient().post('/reactions/react', input);
  },

  /**
   * Remove reaction from a target
   */
  async disReact(input: RemoveReactionInput): Promise<void> {
    return getApiClient().delete('/reactions/dis-react', { data: input });
  },
};
