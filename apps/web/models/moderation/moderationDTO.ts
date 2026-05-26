// models/moderation/content-moderation.dto.ts

import { CommentDTO, MediaDTO, PostDTO, SharePostDTO } from '@repo/shared';
import { AppealStatus } from './enums/moderationEnum';

export interface ViolationDTO {
  category: string;
  reason: string;
}

export interface ContentModerationDTO {
  id: string;

  userId: string;

  targetId: string;

  targetType: string;

  isViolation: boolean;

  violations: ViolationDTO[];

  maxSeverity: string;

  confidence: number;

  displayMessage: string;

  finalDecision?: string;

  createdAt: string;

  targetPreview?: {
    content?: string;
    imageUrl?: MediaDTO;
  };
}

export interface ModerationRecordDetailDTO {
  moderation: ContentModerationDTO;

  target: CommentDTO | PostDTO | SharePostDTO | null;
}

// models/moderation/moderation-appeal.dto.ts

export interface ModerationAppealResponseDTO {
  id: string;

  moderationId: string;

  userId: string;

  reason: string;

  status: AppealStatus;

  reviewedBy: string;

  reviewNote: string;

  reviewedAt: string;

  createdAt: string;
}
