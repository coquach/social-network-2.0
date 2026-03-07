import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmotionByHourDTO } from '@/models/emotion/emotionDTO';
import { EMOTION_KEYS, emotionMeta } from './emotion-meta';

interface EmotionHeatmapCardProps {
  data?: EmotionByHourDTO[];
  loading: boolean;
}

const hours = Array.from({ length: 24 }, (_, idx) => idx);

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return { r, g, b };
};

export const EmotionHeatmapCard = ({
  data,
  loading,
}: EmotionHeatmapCardProps) => {
  const values = data ?? [];
  const maxCount = values.reduce((max, row) => {
    const rowMax = EMOTION_KEYS.reduce((acc, key) => {
      const value = (row as any)[key] ?? 0;
      return Math.max(acc, value);
    }, 0);
    return Math.max(max, rowMax);
  }, 0);

  return (
    <Card className="border-slate-100 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-sky-500">
          Phân bố cảm xúc theo giờ
        </CardTitle>
        <p className="text-sm text-slate-500">
          Xem khung giờ bạn thường thể hiện cảm xúc khác nhau.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : values.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
            Chưa có dữ liệu để hiển thị heatmap.
          </div>
        ) : (
          <div>
            <div className="grid w-full grid-cols-[120px_repeat(24,minmax(0,1fr))] gap-2 text-xs">
              <div />
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="text-center font-medium text-slate-500"
                >
                  {hour}:00
                </div>
              ))}

              {EMOTION_KEYS.map((emotion) => {
                const meta = emotionMeta[emotion];
                return (
                  <div key={emotion} className="contents">
                    <div className="flex items-center justify-end gap-2 pr-3 font-medium text-slate-700">
                      <span className="text-base">{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </div>
                    {hours.map((hour) => {
                      const hourData = values.find((item) => item.hour === hour);
                      const count = (hourData as any)?.[emotion] ?? 0;
                      const intensity = maxCount > 0 ? count / maxCount : 0;
                      const rgb = hexToRgb(meta.color);
                      const alpha = 0.12 + intensity * 0.65;
                      const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(
                        3
                      )})`;

                      return (
                        <div
                          key={`${emotion}-${hour}`}
                          className="flex h-14 items-center justify-center rounded-xl border border-slate-100 text-sm font-semibold text-slate-700 shadow-[0_6px_16px_-12px_rgba(15,23,42,0.3)] transition hover:-translate-y-0.5"
                          style={{
                            backgroundColor: bg,
                          }}
                          title={`${meta.label} lúc ${hour}:00 - ${count} lần`}
                        >
                          {count > 0 ? count : ''}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
