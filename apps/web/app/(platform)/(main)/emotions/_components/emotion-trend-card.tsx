import { EmotionTrendChart } from '@/components/emotion/emotion-trend-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmotionDailyTrendDTO } from '@/models/emotion/emotionDTO';
import { format } from 'date-fns';

interface EmotionTrendCardProps {
  data?: EmotionDailyTrendDTO[];
  loading: boolean;
}

export const EmotionTrendCard = ({ data, loading }: EmotionTrendCardProps) => {
  const chartData =
    data?.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd'),
    })) ?? [];

  return (
    <Card className="h-full border-slate-100 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold text-sky-500">
          Xu hướng theo ngày
        </CardTitle>
        <p className="text-sm text-slate-500">
          Theo dõi biến động cảm xúc trong khoảng thời gian đã chọn.
        </p>
      </CardHeader>
      <CardContent className="mt-2">
        <EmotionTrendChart
          data={chartData}
          loading={loading}
          emptyText="Chưa có đủ dữ liệu để vẽ biểu đồ."
          legendPosition="bottom"
        />
      </CardContent>
    </Card>
  );
};
