import { z } from 'zod';
import { ReportStatus, TargetType } from '../types/enums';

export const CreateReportInputSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(TargetType),
  reason: z.string().max(1000, 'Reason is too long!'),
});

export const UpdateReportInputSchema = z.object({
  status: z.enum(ReportStatus).optional(),
  reason: z.string().max(1000, 'Reason is too long!').optional(),
});
