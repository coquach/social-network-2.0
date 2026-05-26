/**
 * Emotion Service
 * Platform-agnostic emotion API operations
 */

import { CursorPageResponse, TargetType } from '../../types';
import {
  AnalysisSummaryDto,
  CreateFeedbackDto,
  DashboardDistributionResponseDto,
  DashboardInsightItemDto,
  DashboardSummaryResponseDto,
  DashboardTrendResponseDto,
  EmotionHistoryItemDto,
  EmotionTrendWindow,
  FeedbackResponseDto,
} from '../../types/emotion.types';
import { getApiClient } from '../client';

// ==================== Filter Types ====================

/**
 * Emotion trend filter
 */
export interface EmotionTrendFilter {
  window: EmotionTrendWindow;
}

/**
 * Emotion distribution filter
 */
export interface EmotionDistributionFilter {
  window: EmotionTrendWindow;
}

/**
 * Emotion history filter
 */
export interface EmotionHistoryFilter {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

// ==================== Service ====================

export const emotionService = {
  /**
   * Get emotion dashboard summary
   */
  async getDashboardSummary(): Promise<DashboardSummaryResponseDto> {
    return getApiClient().get('/emotions/summary');
  },

  /**
   * Get emotion dashboard trend
   */
  async getDashboardTrend(
    filter: EmotionTrendFilter,
  ): Promise<DashboardTrendResponseDto> {
    return getApiClient().get('/emotions/trend', {
      params: filter,
    });
  },

  /**
   * Get emotion dashboard distribution
   */
  async getDashboardDistribution(
    filter: EmotionDistributionFilter,
  ): Promise<DashboardDistributionResponseDto> {
    return getApiClient().get('/emotions/distribution', {
      params: filter,
    });
  },

  /**
   * Get emotion dashboard insights
   */
  async getDashboardInsights(): Promise<DashboardInsightItemDto[]> {
    return getApiClient().get('/emotions/insights');
  },

  /**
   * Get emotion history
   */
  async getEmotionHistory(
    filter: EmotionHistoryFilter,
  ): Promise<CursorPageResponse<EmotionHistoryItemDto>> {
    return getApiClient().getCursorPage('/emotions/history', {
      params: filter,
    });
  },

  /**
   * Get emotion analysis by target
   */
  async getEmotionAnalysis(
    targetType: TargetType,
    targetId: string,
  ): Promise<AnalysisSummaryDto> {
    return getApiClient().get(`/emotions/${targetType}/${targetId}`);
  },

  /**
   * Submit emotion feedback
   */
  async submitFeedback(
    payload: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return getApiClient().post('/emotions/feedback', payload);
  },

  /**
   * Get feedback by target
   */
  async getFeedbackByTarget(
    targetType: TargetType,
    targetId: string,
  ): Promise<FeedbackResponseDto[]> {
    return getApiClient().get(`/emotions/feedback/${targetType}/${targetId}`);
  },
};
