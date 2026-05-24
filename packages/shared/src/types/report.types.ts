/**
 * Report Types
 * Platform-agnostic report-related type definitions
 */

import type { ReportStatus, TargetType } from './enums';

export interface ReportDTO {
  id: string;
  groupId?: string;
  reporterId: string;
  targetType: TargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface CreateReportInput {
  targetId: string;
  targetType: TargetType;
  reason: string;
}

export interface UpdateReportInput {
  status?: ReportStatus;
  reason?: string;
}
