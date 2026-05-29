/**
 * Moderation Types
 * Platform-agnostic moderation-related type definitions
 */

import type { PageResponse } from './common.types';
import type { TargetType } from './enums';
import type { CommentDTO } from './comment.types';
import type { PostDTO } from './post.types';
import type { SharePostDTO } from './share.types';

export enum AppealStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface CreateAppealRequestDTO {
  moderationId: string;
  reason: string;
}

export interface ModerationViolationDTO {
  category: string;
  reason: string;
}

export interface ModerationTargetPreviewDTO {
  content?: string;
  imageUrl?: string;
}

export interface ContentModerationDTO {
  id: string;
  userId: string;
  targetId: string;
  targetType: TargetType | string;
  isViolation: boolean;
  violations: ModerationViolationDTO[];
  maxSeverity: string;
  confidence: number;
  displayMessage: string;
  finalDecision?: string;
  createdAt: Date;
  targetPreview?: ModerationTargetPreviewDTO;
}

export interface ModerationAppealResponseDTO {
  id: string;
  moderationId: string;
  userId: string;
  reason: string;
  status: AppealStatus;
  reviewedBy: string;
  reviewNote: string;
  reviewedAt: Date;
  createdAt: Date;
}

export interface ModerationRecordDetailDTO {
  moderation: ContentModerationDTO;
  target: PostDTO | CommentDTO | SharePostDTO | null;
  appeals: ModerationAppealResponseDTO[];
}

export interface GetMyModerationQuery {
  page?: number;
  limit?: number;
  targetType?: TargetType;
}

export type ModerationPageResponseDTO = PageResponse<ContentModerationDTO>;
