/**
 * Moderation Service
 * Platform-agnostic moderation API operations
 */

import { getApiClient } from '../client';
import type {
  CreateAppealRequestDTO,
  GetMyModerationQuery,
  ModerationAppealResponseDTO,
  ModerationRecordDetailDTO,
  ModerationPageResponseDTO,
} from '../../types/moderation.types';

export const moderationService = {
  /**
   * Get current user's moderation records
   */
  async getMyModerationRecords(
    query?: GetMyModerationQuery,
  ): Promise<ModerationPageResponseDTO> {
    return getApiClient().get('/moderations/me', {
      params: query,
    });
  },

  /**
   * Get moderation record detail
   */
  async getModerationRecordDetail(
    id: string,
  ): Promise<ModerationRecordDetailDTO> {
    return getApiClient().get(`/moderations/records/${id}`);
  },

  /**
   * Create appeal for a moderation record
   */
  async createAppeal(
    body: CreateAppealRequestDTO,
  ): Promise<ModerationAppealResponseDTO> {
    return getApiClient().post('/moderations/appeals', body);
  },
};

export const ModerationService = moderationService;

export type ModerationService = typeof moderationService;
