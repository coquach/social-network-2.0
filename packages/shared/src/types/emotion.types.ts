/**
 * Emotion Types
 * Platform-agnostic emotion-related type definitions
 */

import { CommentDTO } from './comment.types';
import { TargetType } from './enums';
import { PostDTO } from './post.types';

// ==================== Enums ====================

export type EmotionLabel =
  | 'JOY'
  | 'SADNESS'
  | 'ANGER'
  | 'FEAR'
  | 'DISGUST'
  | 'SURPRISE'
  | 'NEUTRAL';

export type EmotionRiskLevel = 'none' | 'low' | 'medium' | 'high';

export type EmotionTrendWindow = '1d' | '7d' | '30d';

export type EmotionInsightType =
  | 'ABOVE_BASELINE'
  | 'DETERIORATING_TREND'
  | 'HIGH_NEGATIVITY'
  | 'HIGH_RISK'
  | 'HIGH_VOLATILITY'
  | 'NEGATIVE_STREAK'
  | 'NORMALIZING'
  | 'POSITIVE_STATE'
  | 'RECOVERING_TREND'
  | 'STABLE_STATE';

export type EmotionInsightTone =
  | 'positive'
  | 'neutral'
  | 'warning'
  | 'critical';

// ==================== DTOs ====================

/**
 * Emotion history item
 */
export interface EmotionHistoryItemDto {
  targetId: string;
  targetType: TargetType;
  finalEmotion: EmotionLabel;
  finalConfidence: number;
  riskHintLevel: EmotionRiskLevel;
  createdAt: Date;
}

/**
 * Dashboard insight item
 */
export interface DashboardInsightItemDto {
  type: EmotionInsightType;
  message: string;
  tone: EmotionInsightTone;
}

/**
 * Dashboard summary response
 */
export interface DashboardSummaryResponseDto {
  riskLevel: string;
  riskScore: number;
  recentNegativityScore: number;
  negativeEventStreak: number;
  emotionMomentum: number;
  lastEvaluatedAt?: Date;
  dominantEmotion?: EmotionLabel;
  shortTermTrend?: number;
  vsBaseline?: number;
}

/**
 * Dashboard trend point
 */
export interface DashboardTrendPointDto {
  timestamp: Date;
  negativeRatio: number;
}

/**
 * Dashboard trend response
 */
export interface DashboardTrendResponseDto {
  data: DashboardTrendPointDto[];
  current: number;
  previous: number | null;
  trend: number;
  baseline: number;
}

/**
 * Dashboard distribution response
 */
export interface DashboardDistributionResponseDto {
  distribution: Record<EmotionLabel, number>;

  dominantEmotion: EmotionLabel;
}

/**
 * Emotion analysis summary
 */
export interface AnalysisSummaryDto {
  targetId: string;
  targetType: TargetType;
  finalEmotion: EmotionLabel;
  finalScores: Record<string, number>;
  confidence: number;
  riskLevel: EmotionRiskLevel;
  createdAt: Date;
  content: PostDTO | CommentDTO;
}

/**
 * Create feedback payload
 */
export interface CreateFeedbackDto {
  targetId: string;
  targetType: TargetType;
  isAccurate: boolean;
  expectedEmotion?: EmotionLabel | null;
}

/**
 * Feedback response DTO
 */
export interface FeedbackResponseDto {
  id: string;
  targetId: string;
  targetType: TargetType;
  isAccurate: boolean;
  expectedEmotion?: EmotionLabel | null;
  predictedEmotion: EmotionLabel;
  confidence: number;
  modelVersion: string;
  createdAt: Date;
}
