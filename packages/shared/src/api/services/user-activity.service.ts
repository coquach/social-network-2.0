/**
 * User Activity Service
 * Platform-agnostic user activity API operations
 */

import { CursorPageResponse } from '../../types';
import { ActivityType, UserActivityDto } from '../../types/user-activity.types';
import { getApiClient } from '../client';

// ==================== Filter Types ====================

/**
 * User activity log filter
 */
export interface UserActivityLogFilter {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  activityType?: ActivityType;
  fromDate?: string | Date;
  toDate?: string | Date;
}

// ==================== Service ====================

export const userActivityService = {
  /**
   * Get user activity logs
   */
  async getUserActivityLogs(
    filter?: UserActivityLogFilter,
  ): Promise<CursorPageResponse<UserActivityDto>> {
    return getApiClient().getCursorPage('/logs/user-activities', {
      params: filter,
    });
  },
};

export const UserActivityService = userActivityService;

export type UserActivityService = typeof userActivityService;
