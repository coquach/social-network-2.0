'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnalysisSummaryDto } from '@repo/shared';
import {
  getEmotionEmoji,
  getEmotionLabel,
  getEmotionColor,
  isPositiveEmotion,
  isNegativeEmotion,
} from '../lib/emotion-mappers';
import { formatRiskLevel } from '../lib/emotion-formatters';

type Props = {
  summary: AnalysisSummaryDto;
};

export const EmotionHeroCard = ({ summary }: Props) => {
  const label = getEmotionLabel(summary.finalEmotion as string) ?? 'Trung tính';
  const emoji = getEmotionEmoji(summary.finalEmotion as string) ?? '🙂';
  const color = getEmotionColor(summary.finalEmotion as string) ?? '#94a3b8';
  const confidence = Math.round((summary.confidence ?? 0) * 100);

  const riskClass = {
    none: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    low: 'border-sky-100 bg-sky-50 text-sky-700',
    medium: 'border-amber-100 bg-amber-50 text-amber-700',
    high: 'border-rose-100 bg-rose-50 text-rose-700',
  }[summary.riskLevel ?? 'none'];

  const summaryText = isPositiveEmotion(summary.finalEmotion)
    ? 'Nội dung mang sắc thái tích cực và phấn khởi.'
    : isNegativeEmotion(summary.finalEmotion)
      ? 'Nội dung mang sắc thái tiêu cực, cần lưu ý.'
      : 'Nội dung mang sắc thái trung tính.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36 }}
    >
      <Card className="rounded-[20px] border border-slate-200 bg-white/95 shadow-[0_20px_40px_-30px_rgba(2,6,23,0.35)] overflow-hidden">
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] items-center p-5">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-xl text-4xl shadow-inner"
              style={{
                background: `linear-gradient(135deg, ${color}22 0%, transparent 60%)`,
              }}
              aria-hidden
            >
              <span className="select-none">{emoji}</span>
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold text-slate-900">
                {label}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{summaryText}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-500">Độ tin cậy</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-slate-900">
                  {confidence}%
                </span>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${confidence}%`,
                      background: `linear-gradient(90deg, ${color}, rgba(148,163,184,0.2))`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <Badge
                variant="outline"
                className={`${riskClass} rounded-lg px-3 py-1 text-sm`}
              >
                Mức rủi ro: {formatRiskLevel(summary.riskLevel)}
              </Badge>
              {summary.createdAt ? (
                <p className="text-xs text-slate-500">
                  Cập nhật {new Date(summary.createdAt).toLocaleString('vi-VN')}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EmotionHeroCard;
