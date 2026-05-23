import { UserSnapshotDTO } from '@repo/shared';

export type RiskLevel = 'normal' | 'warning' | 'high' | 'critical';

export interface DashboardOverviewResponseDTO {
  totalAnalyzedSnapshots: number;

  highRiskUsers: number;

  criticalRiskUsers: number;

  averageNegativityScore: number;

  topEmotions: Record<string, number>;
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
