'use client';

import * as React from 'react';
import {
  HeartHandshake,
  Loader2,
  MessageSquareMore,
  PhoneCall,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAdminFeedbacks,
  useEmotionDashboardOverview,
  useFeedbackAccuracySummary,
} from '@/hooks/admin/use-admin-emotion';
import {
  useAdminHotlines,
  useAdminResources,
} from '@/hooks/admin/use-admin-intervention';
import { AdminFeedbackQuery } from '@/lib/actions/admin/admin-emotion';
import {
  EmotionCommunityDistribution,
  EmotionFeedbackSummary,
  EmotionFeedbackTable,
  EmotionHotlinesManager,
  EmotionOverviewCards,
  EmotionResourcesManager,
  EmotionRiskDistributionCard,
  EmotionTargetAndResourcesCard,
} from './_components';

const PAGE_SIZE = 10;
type TabKey = 'overview' | 'exercises' | 'hotlines' | 'feedback';

const emotionLabels: Record<string, string> = {
  joy: 'Vui',
  sadness: 'Buồn',
  anger: 'Tức giận',
  fear: 'Sợ hãi',
  disgust: 'Chán ghét',
  surprise: 'Ngạc nhiên',
  neutral: 'Trung lập',
};

const formatEmotionLabel = (emotion: string) =>
  emotionLabels[emotion.toLowerCase()] ?? emotion;

const getDefaultFeedbackFilter = (): AdminFeedbackQuery => ({
  page: 1,
  limit: PAGE_SIZE,
});

export default function AdminEmotionsPage() {
  const [tab, setTab] = React.useState<TabKey>('overview');
  const [feedbackFilter, setFeedbackFilter] =
    React.useState<AdminFeedbackQuery>(getDefaultFeedbackFilter);

  const overviewQuery = useEmotionDashboardOverview();
  const resourcesQuery = useAdminResources();
  const hotlinesQuery = useAdminHotlines();
  const feedbackQuery = useAdminFeedbacks(feedbackFilter);
  const feedbackSummaryQuery = useFeedbackAccuracySummary();

  const handleRefresh = async () => {
    await Promise.all([
      overviewQuery.refetch(),
      resourcesQuery.refetch(),
      hotlinesQuery.refetch(),
      feedbackQuery.refetch(),
      feedbackSummaryQuery.refetch(),
    ]);
  };

  const feedbackRows = feedbackQuery.data?.data ?? [];
  const loadingAny =
    overviewQuery.isFetching ||
    resourcesQuery.isFetching ||
    hotlinesQuery.isFetching ||
    feedbackQuery.isFetching ||
    feedbackSummaryQuery.isFetching;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-2 text-sky-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Cảm xúc cộng đồng
              </h1>
              <p className="text-sm text-slate-500">
                Theo dõi cảm xúc cộng đồng, bài tập hỗ trợ, hotline và độ chính xác AI.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          onClick={() => void handleRefresh()}
          disabled={loadingAny}
        >
          {loadingAny ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Làm mới
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)}>
          <TabsList className="mb-5 inline-flex h-auto w-fit max-w-full items-center gap-1.5 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <TabsTrigger
              value="overview"
              className="group flex h-12 items-center rounded-[14px] border border-transparent bg-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-200 data-[state=active]:-translate-y-px data-[state=active]:border-sky-200 data-[state=active]:bg-[#E6F4FF] data-[state=active]:font-semibold data-[state=active]:text-sky-800 data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-inherit transition-all duration-200 group-data-[state=active]:scale-105" />

                <span className="font-semibold text-inherit">Tổng quan</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="exercises"
              className="group flex h-12 items-center rounded-[14px] border border-transparent bg-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-200 data-[state=active]:-translate-y-px data-[state=active]:border-sky-200 data-[state=active]:bg-[#E6F4FF] data-[state=active]:font-semibold data-[state=active]:text-sky-800 data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-inherit transition-all duration-200 group-data-[state=active]:scale-105" />

                <span className="font-semibold text-inherit">
                  Bài tập hỗ trợ
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-data-[state=active]:bg-sky-600 group-data-[state=active]:text-white">
                  {resourcesQuery.data?.length ?? 0}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="hotlines"
              className="group flex h-12 items-center rounded-[14px] border border-transparent bg-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-200 data-[state=active]:-translate-y-px data-[state=active]:border-sky-200 data-[state=active]:bg-[#E6F4FF] data-[state=active]:font-semibold data-[state=active]:text-sky-800 data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-inherit transition-all duration-200 group-data-[state=active]:scale-105" />

                <span className="font-semibold text-inherit">
                  Hotline hỗ trợ
                </span>

                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-data-[state=active]:bg-sky-600 group-data-[state=active]:text-white">
                  {hotlinesQuery.data?.length ?? 0}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="feedback"
              className="group flex h-12 items-center rounded-[14px] border border-transparent bg-transparent px-5 py-3 text-sm font-medium text-slate-500 transition-all duration-200 ease-out hover:bg-white hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-sky-200 data-[state=active]:-translate-y-px data-[state=active]:border-sky-200 data-[state=active]:bg-[#E6F4FF] data-[state=active]:font-semibold data-[state=active]:text-sky-800 data-[state=active]:shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center gap-2">
                <MessageSquareMore className="h-4 w-4 text-inherit transition-all duration-200 group-data-[state=active]:scale-105" />

                <span className="font-semibold text-inherit">Feedback</span>

                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-data-[state=active]:bg-sky-600 group-data-[state=active]:text-white">
                  {feedbackQuery.data?.total ?? 0}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <EmotionOverviewCards
              data={overviewQuery.data}
              loading={overviewQuery.isLoading}
            />

            <EmotionCommunityDistribution
              distribution={overviewQuery.data?.emotionDistribution}
              daysWindow={overviewQuery.data?.daysWindow}
              loading={overviewQuery.isLoading}
            />

            <EmotionRiskDistributionCard
              distribution={overviewQuery.data?.riskDistribution}
              loading={overviewQuery.isLoading}
            />

            <EmotionTargetAndResourcesCard
              targets={overviewQuery.data?.targetTypeDistribution}
              resources={overviewQuery.data?.resourceSummary}
              daysWindow={overviewQuery.data?.daysWindow}
              loading={overviewQuery.isLoading}
            />
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            <EmotionResourcesManager />
          </TabsContent>

          <TabsContent value="hotlines" className="space-y-4">
            <EmotionHotlinesManager />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <EmotionFeedbackSummary
              data={feedbackSummaryQuery.data}
              loading={feedbackSummaryQuery.isLoading}
            />

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-0">
                <div className="text-base font-semibold text-slate-900">
                  Sai lệch phổ biến
                </div>
                <div className="text-sm text-slate-500">
                  Các cặp dự đoán sai xuất hiện nhiều nhất trong feedback gần
                  nhất.
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {feedbackSummaryQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`mismatch-skeleton-${index}`}
                        className="h-14 animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                      />
                    ))}
                  </div>
                ) : (feedbackSummaryQuery.data?.topMismatchPairs ?? [])
                    .length ? (
                  <div className="space-y-3">
                    {feedbackSummaryQuery.data?.topMismatchPairs.map((pair) => {
                      const maxCount = Math.max(
                        ...(feedbackSummaryQuery.data?.topMismatchPairs.map(
                          (item) => item.count,
                        ) ?? [1]),
                      );
                      const width = maxCount
                        ? (pair.count / maxCount) * 100
                        : 0;

                      return (
                        <div
                          key={`${pair.predicted}-${pair.expected}`}
                          className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-slate-800">
                              {formatEmotionLabel(pair.predicted)}{' '}
                              <span className="text-slate-400">→</span>{' '}
                              {formatEmotionLabel(pair.expected)}
                            </div>
                            <div className="text-sm font-semibold text-slate-900">
                              {pair.count.toLocaleString('vi-VN')}
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Chưa có sai lệch phổ biến trong phạm vi dữ liệu hiện tại.
                  </div>
                )}
              </CardContent>
            </Card>

            <EmotionFeedbackTable
              rows={feedbackRows}
              page={feedbackFilter.page ?? 1}
              pageSize={feedbackFilter.limit ?? PAGE_SIZE}
              total={feedbackQuery.data?.total ?? 0}
              loading={feedbackQuery.isLoading || feedbackQuery.isFetching}
              onPageChange={(nextPage) =>
                setFeedbackFilter((previous) => ({
                  ...previous,
                  page: nextPage,
                }))
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
