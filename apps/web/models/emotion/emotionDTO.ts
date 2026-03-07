import { Emotion, TargetType } from '@/models/social/enums/social.enum';

export type EmotionKey =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'disgust'
  | 'surprise'
  | 'neutral';

export type EmotionPreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'week'
  | 'month';

export enum AnalysisStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface EmotionScoresDTO {
  anger: number;
  disgust: number;
  joy: number;
  fear: number;
  neutral: number;
  sadness: number;
  surprise: number;
}

export interface TextEmotionDTO {
  dominantEmotion: Emotion;
  emotionScores: EmotionScoresDTO;
}

export interface ImageEmotionDTO {
  url: string;
  faceCount: number;
  dominantEmotion: Emotion;
  emotionScores: EmotionScoresDTO;
  error: string | null;
}

export interface EmotionAnalysisDTO {
  userId: string;
  targetId: string;
  targetType: TargetType;
  textEmotion: TextEmotionDTO | null;
  imageEmotions: ImageEmotionDTO[];
  finalEmotion: Emotion;
  finalScores: EmotionScoresDTO;
  status: AnalysisStatus;
  errorReason: string | null;
  createdAt: Date;
}

export interface AnalysisHistoryDTO {
  id: string;
  content: string;
  finalEmotion: Emotion;
  targetType: TargetType;
  createdAt: Date;
  status: AnalysisStatus;
}

export interface EmotionSummaryDTO {
  topEmotion: Emotion | string | null;
  count: number;
  distribution: Record<string, number>;
}

export interface EmotionDailyTrendDTO {
  date: Date | string;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
}

export interface EmotionByHourDTO {
  hour: number;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
}

export interface EmotionHistoryResponse {
  data: AnalysisHistoryDTO[];
  meta: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
