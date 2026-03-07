'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { QueryErrorBoundary } from '@/components/query-error-boundary';
import {
  useEmotionByHour,
  useEmotionHistory,
  useEmotionSummary,
  useEmotionTrend,
} from '@/hooks/use-emotion-journal';
import { EmotionPreset } from '@/models/emotion/emotionDTO';

import { EmotionHeatmapCard } from './_components/emotion-heatmap-card';
import { EmotionHero } from './_components/emotion-hero';
import { EmotionHistorySection } from './_components/emotion-history-section';
import { EmotionSummaryCard } from './_components/emotion-summary-card';
import { EmotionTrendCard } from './_components/emotion-trend-card';
import { PresetSwitcher } from './_components/preset-switcher';

export default function EmotionJournalPage() {
  const [preset, setPreset] = useState<EmotionPreset>('today');
  const trendPreset = useMemo<EmotionPreset>(
    () => (preset === 'today' || preset === 'yesterday' ? 'thisWeek' : preset),
    [preset]
  );

  const summaryQuery = useEmotionSummary({ preset });
  const trendQuery = useEmotionTrend({ preset: trendPreset });
  const heatmapQuery = useEmotionByHour();
  const historyQuery = useEmotionHistory({ preset, limit: 10 });

  const handleAddMood = () => {
    toast.success('Tính năng ghi cảm xúc sẽ sớm xuất hiện!');
  };

  return (
    <QueryErrorBoundary>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <EmotionHero onAddMood={handleAddMood} />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-sky-600">Chọn mốc thời gian</p>
          <p className="text-xs text-slate-500">
            Điều chỉnh để xem lại tâm trạng của bạn theo từng giai đoạn.
          </p>
        </div>
        <PresetSwitcher value={preset} onChange={setPreset} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr,1fr]">
        <EmotionSummaryCard data={summaryQuery.data} loading={summaryQuery.isLoading} />
        <EmotionTrendCard data={trendQuery.data} loading={trendQuery.isLoading} />
      </div>

      <EmotionHeatmapCard data={heatmapQuery.data} loading={heatmapQuery.isLoading} />

      <EmotionHistorySection
        entries={historyQuery.entries}
        loading={historyQuery.isLoading}
        hasMore={Boolean(historyQuery.hasNextPage)}
        onLoadMore={() => historyQuery.fetchNextPage()}
        loadingMore={historyQuery.isFetchingNextPage}
      />
    </div>
    </QueryErrorBoundary>
  );
}
