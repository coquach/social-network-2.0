import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnalysisSummaryDto } from '@repo/shared';
import { getEmotionEmoji, getEmotionLabel } from '../lib/emotion-mappers';

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-slate-800">
      {value ?? '—'}
    </p>
  </div>
);

interface DetailMetaCardProps {
  summary: AnalysisSummaryDto;
}

export const DetailMetaCard = ({ summary }: DetailMetaCardProps) => {
  const emotionLabel = getEmotionLabel(summary.finalEmotion as string);
  const emotionEmoji = getEmotionEmoji(summary.finalEmotion as string);

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-sky-100 bg-sky-50 text-sky-700"
          >
            {emotionEmoji} {emotionLabel}
          </Badge>
          <Badge
            variant="outline"
            className="border-slate-200 bg-slate-50 text-slate-700"
          >
            {summary.targetType}
          </Badge>
          {summary.createdAt && (
            <Badge
              variant="outline"
              className="border-sky-100 bg-sky-50 text-sky-700"
            >
              {format(new Date(summary.createdAt), 'dd/MM/yyyy HH:mm')}
            </Badge>
          )}
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-700">
          Phân tích được tổng hợp từ dữ liệu cảm xúc của đối tượng này.
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Cảm xúc cuối" value={emotionLabel} />
          <InfoItem
            label="Độ tin cậy"
            value={`${(summary.confidence * 100).toFixed(1)}%`}
          />
          <InfoItem label="Mức rủi ro" value={summary.riskLevel} />
          <InfoItem label="Target ID" value={summary.targetId} />
          {summary.createdAt ? (
            <InfoItem
              label="Thời gian"
              value={format(new Date(summary.createdAt), 'dd/MM/yyyy HH:mm')}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
