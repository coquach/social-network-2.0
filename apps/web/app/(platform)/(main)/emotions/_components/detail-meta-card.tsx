import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnalysisStatus, EmotionAnalysisDTO } from '@/models/emotion/emotionDTO';

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
  summary: EmotionAnalysisDTO;
  analysisId: string;
  createdAt: Date | null;
  targetLabel: Record<string, string>;
}

export const DetailMetaCard = ({
  summary,
  analysisId,
  createdAt,
  targetLabel,
}: DetailMetaCardProps) => {
  const statusBadge =
    summary.status === AnalysisStatus.SUCCESS
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-rose-50 text-rose-700 border-rose-100';

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardContent className="space-y-3 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`border ${statusBadge}`}>
            {summary.status === AnalysisStatus.SUCCESS ? 'Thành công' : 'Thất bại'}
          </Badge>
          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
            {targetLabel[summary.targetType] ?? summary.targetType}
          </Badge>
          {createdAt && (
            <Badge
              variant="outline"
              className="border-sky-100 bg-sky-50 text-sky-700"
            >
              {format(createdAt, 'dd/MM/yyyy HH:mm')}
            </Badge>
          )}
        </div>
        {summary.errorReason ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">
            {summary.errorReason}
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
            Phân tích hoàn tất. Cảm xúc đã được tổng hợp từ văn bản và hình ảnh (nếu có).
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Mã phân tích" value={analysisId} />
          <InfoItem label="User ID" value={summary.userId} />
          <InfoItem label="Target ID" value={summary.targetId} />
          <InfoItem label="Loại nội dung" value={targetLabel[summary.targetType] ?? summary.targetType} />
          <InfoItem
            label="Trạng thái"
            value={summary.status === AnalysisStatus.SUCCESS ? 'Thành công' : 'Thất bại'}
          />
          {createdAt ? (
            <InfoItem label="Thời gian" value={format(createdAt, 'dd/MM/yyyy HH:mm')} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
