import { z } from 'zod';
import { TargetType } from "../social/enums/social.enum";

export const ReportSchema = z.object({
  targetId: z.string(),
  targetType: z.nativeEnum(TargetType),
  reason: z.string().max(1000, 'Reason is too long!'),
});

export type CreateReportForm = z.infer<typeof ReportSchema>;

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export interface ReportDTO {
  id: string;
  groupId: string;
  reporterId: string;
  targetType: TargetType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
}