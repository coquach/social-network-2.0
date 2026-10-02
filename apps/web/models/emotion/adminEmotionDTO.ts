import { UserSnapshotDTO } from '@repo/shared';

export type RiskLevel = 'normal' | 'warning' | 'high' | 'critical';

export interface EmotionDistributionDTO {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
  total: number;
}

export interface RiskLevelDistributionDTO {
  normal: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  totalUsers: number;
}

export interface TargetTypeBreakdownDTO {
  posts: number;
  comments: number;
  total: number;
}

export interface ResourceSummaryDTO {
  totalHotlines: number;
  activeHotlines: number;
  totalExercises: number;
  activeExercises: number;
}

export interface DashboardOverviewResponseDTO {
  totalAnalyzedSnapshots: number;
  totalInterventionsDispatched: number;
  activeInterventionResources: number;
  feedbackRate?: number;
  aiAccuracyRate?: number;

  daysWindow?: number;
  emotionDistribution: EmotionDistributionDTO;
  riskDistribution: RiskLevelDistributionDTO;
  targetTypeDistribution: TargetTypeBreakdownDTO;
  resourceSummary: ResourceSummaryDTO;
}

export interface EmotionDashboardChartItemDTO {
  date: string;
  joy?: number;
  happy?: number;
  sadness?: number;
  sad?: number;
  anger?: number;
  angry?: number;
  fear?: number;
  disgust?: number;
  surprise?: number;
  neutral?: number;
}

export interface RiskUserItemDTO {
  userId: string;

  riskLevel: RiskLevel;

  riskScore: number;

  signalCount: number;

  updatedAt?: string | null;
}

export interface RiskUserDTO {
  user: UserSnapshotDTO;
  riskItem: RiskUserItemDTO;
}

export interface FeedbackListItemDTO {
  predictedEmotion: string;

  expectedEmotion?: string | null;

  isAccurate: boolean;

  modelVersion?: string | null;

  createdAt: string;
}

export interface MismatchPairDTO {
  predicted: string;

  expected: string;

  count: number;
}

export interface FeedbackAccuracySummaryDTO {
  totalFeedbacks: number;

  accurateCount: number;

  inaccurateCount: number;

  accuracyRate: number;

  topMismatchPairs: MismatchPairDTO[];
}
