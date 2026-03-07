'use client';

import { format } from 'date-fns';

import { EmotionTrendChart as SharedEmotionTrendChart } from '@/components/emotion/emotion-trend-chart';
import { EmotionDashboardDTO } from '@/lib/actions/admin/dashboard-action';

export function EmotionTrendChart({
  data,
  loading,
}: {
  data?: EmotionDashboardDTO[];
  loading: boolean;
}) {
  const chartData =
    data?.map((item) => ({
      ...item,
      date: format(new Date(item.date), 'yyyy-MM-dd'),
    })) ?? [];

  return (
    <SharedEmotionTrendChart
      data={chartData}
      loading={loading}
      emptyText="Không có dữ liệu cảm xúc trong khoảng thời gian này."
    />
  );
}
