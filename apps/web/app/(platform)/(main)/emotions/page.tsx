'use client';

import { QueryErrorBoundary } from '@/components/query-error-boundary';

import { EmotionDashboardHeader } from './_components/emotion-dashboard-header';
import { EmotionDistributionCard } from './_components/emotion-distribution-card';
import { EmotionInsightsCard } from './_components/emotion-insights-card';
import { EmotionHistorySection } from './_components/emotion-history-section';
import { EmotionSummaryGrid } from './_components/emotion-summary-card';
import { EmotionTrendCard } from './_components/emotion-trend-card';

export default function EmotionJournalPage() {
  return (
    <QueryErrorBoundary>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:space-y-12 lg:py-10">
        <EmotionDashboardHeader />

        <EmotionSummaryGrid />

        <EmotionTrendCard />

        <EmotionDistributionCard />

        <EmotionInsightsCard />

        <EmotionHistorySection />
      </div>
    </QueryErrorBoundary>
  );
}
