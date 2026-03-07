'use client';

import { addDays, differenceInCalendarDays, format, subDays } from 'date-fns';
import {
  Activity,
  Download,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users2
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  useContentChart,
  useDashboardSummary,
  useEmotionChart,
  useReportChart,
} from '@/hooks/use-admin-dashboard';

import { ContentPerformanceChart } from './_components/content-performance-chart';
import { DateRangeFilter } from './_components/date-range-filter';
import { EmotionTrendChart } from './_components/emotion-trend-chart';
import { ReportStatusChart } from './_components/report-status-chart';
import { SummaryCards } from './_components/summary-cards';
import { vi } from 'date-fns/locale';

const MAX_RANGE_DAYS = 30;
const formatInputDate = (date: Date) => format(date, 'yyyy-MM-dd', {
  locale: vi
});
const parseInputDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!day || !month || !year) return null;
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) return null;
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
};

export default function DashboardPage() {
  const defaultTo = React.useMemo(() => new Date(), []);
  const defaultFrom = React.useMemo(() => subDays(defaultTo, 6), [defaultTo]);
  const [range, setRange] = React.useState<{ from: Date; to: Date }>({
    from: defaultFrom,
    to: defaultTo,
  });
  const [inputRange, setInputRange] = React.useState({
    from: formatInputDate(defaultFrom),
    to: formatInputDate(defaultTo),
  });
  const [exporting, setExporting] = React.useState(false);

  const summaryQuery = useDashboardSummary(range);
  const contentChartQuery = useContentChart(range);
  const reportChartQuery = useReportChart(range);
  const emotionChartQuery = useEmotionChart(range);

  const applyRange = React.useCallback(
    (from: Date, to: Date) => {
      if (differenceInCalendarDays(to, from) > MAX_RANGE_DAYS) {
        toast.error(`Chỉ cho phép tối đa ${MAX_RANGE_DAYS} ngày.`);
        setInputRange({
          from: formatInputDate(range.from),
          to: formatInputDate(range.to),
        });
        return;
      }
      setRange({ from, to });
      setInputRange({ from: formatInputDate(from), to: formatInputDate(to) });
    },
    [range.from, range.to]
  );

  const handleFromChange = (value: string) => {
    const parsedFrom = parseInputDate(value);
    const parsedTo = parseInputDate(inputRange.to);
    setInputRange((prev) => ({ ...prev, from: value }));
    if (!parsedFrom) return;

    if (parsedTo && parsedFrom > parsedTo) {
      applyRange(parsedFrom, parsedFrom);
    } else if (parsedTo) {
      applyRange(parsedFrom, parsedTo);
    }
  };

  const handleToChange = (value: string) => {
    const parsedTo = parseInputDate(value);
    const parsedFrom = parseInputDate(inputRange.from);
    setInputRange((prev) => ({ ...prev, to: value }));
    if (!parsedTo) return;

    if (parsedFrom && parsedTo < parsedFrom) {
      applyRange(parsedTo, parsedTo);
    } else if (parsedFrom) {
      applyRange(parsedFrom, parsedTo);
    }
  };

  const handleQuickWeek = () => {
    const to = new Date();
    const from = subDays(to, 6);
    applyRange(from, to);
  };

  const dateLabel = `${format(range.from, 'dd/MM/yyyy')} - ${format(
    range.to,
    'dd/MM/yyyy'
  )}`;

  const fromDate = parseInputDate(inputRange.from) ?? range.from;
  const toDate = parseInputDate(inputRange.to) ?? range.to;
  const fromMin = formatInputDate(subDays(toDate, MAX_RANGE_DAYS));
  const fromMax = formatInputDate(toDate);
  const toMin = formatInputDate(fromDate);
  const toMax = formatInputDate(addDays(fromDate, MAX_RANGE_DAYS));

  const summaryCards = [
    {
      label: 'Người dùng hoạt động',
      value: summaryQuery.data?.activeUsers ?? 0,
      icon: Users2,
      gradient: 'from-sky-500/15 to-sky-500/0',
      accent: 'text-sky-700',
    },
    {
      label: 'Tương tác nội dung',
      value: summaryQuery.data?.totalPosts ?? 0,
      icon: Sparkles,
      gradient: 'from-emerald-500/15 to-emerald-500/0',
      accent: 'text-emerald-700',
    },
    {
      label: 'Nhóm hoạt động',
      value: summaryQuery.data?.totalGroups ?? 0,
      icon: Activity,
      gradient: 'from-amber-400/20 to-amber-400/0',
      accent: 'text-amber-700',
    },
    {
      label: 'Báo cáo chờ',
      value: summaryQuery.data?.pendingReports ?? 0,
      icon: ShieldCheck,
      gradient: 'from-rose-400/20 to-rose-400/0',
      accent: 'text-rose-700',
    },
  ];

  const handleExport = () => {
    setExporting(true);
    try {
      const summarySection = [
        'Tổng quan',
        'Chỉ số,Giá trị',
        ...summaryCards.map(
          (card) =>
            `${card.label},${(summaryQuery.data
              ? card.value
              : 0
            ).toLocaleString('vi-VN')}`
        ),
      ];

      const contentSection = [
        '',
        'Hiệu suất nội dung',
        'Ngày,Bài viết,Bình luận,Chia sẻ',
        ...(contentChartQuery.data ?? []).map(
          (item) =>
            `${format(new Date(item.date), 'dd/MM/yyyy')},${item.postCount},${
              item.commentCount
            },${item.shareCount}`
        ),
      ];

      const reportSection = [
        '',
        'Trạng thái báo cáo',
        'Ngày,Chờ,Đã xử lý,Bỏ qua',
        ...(reportChartQuery.data ?? []).map(
          (item) =>
            `${format(new Date(item.date), 'dd/MM/yyyy')},${
              item.pendingCount
            },${item.resolvedCount},${item.rejectedCount}`
        ),
      ];

      const emotionSection = [
        '',
        'Cảm xúc',
        'Ngày,Vui vẻ,Buồn,Tức giận,Lo lắng,Ngạc nhiên,Chán ghét',
        ...(emotionChartQuery.data ?? []).map((item) => {
          return `${format(new Date(item.date), 'dd/MM/yyyy')},${item.joy},${
            item.sadness
          },${item.anger},${item.fear},${item.surprise},${item.disgust}`;
        }),
      ];

      const csv = [
        ...summarySection,
        ...contentSection,
        ...reportSection,
        ...emotionSection,
      ].join('\n');
      const blob = new Blob([`\uFEFF${csv}`], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-${format(range.from, 'yyyyMMdd')}-${format(
        range.to,
        'yyyyMMdd'
      )}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-sky-600">
            Tổng quan hệ thống
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi tương tác, cảm xúc và báo cáo trong khoảng thời gian:{' '}
            <span className="font-semibold text-sky-600">{dateLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            from={inputRange.from}
            to={inputRange.to}
            fromMin={fromMin}
            fromMax={fromMax}
            toMin={toMin}
            toMax={toMax}
            onFromChange={handleFromChange}
            onToChange={handleToChange}
            onQuickWeek={handleQuickWeek}
          />

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-sky-600 text-white shadow-sm hover:bg-sky-700"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Xuất Excel
          </Button>
        </div>
      </div>

      <SummaryCards
        items={summaryCards}
        loading={summaryQuery.isLoading}
      />
      <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-sky-600">
              Cảm xúc nội dung
            </p>
            <p className="text-xs text-slate-500">
              Theo dõi xu hướng cảm xúc trong khoảng thời gian
            </p>
          </div>
        </div>
        <div className="mt-4">
          <EmotionTrendChart
            data={emotionChartQuery.data}
            loading={emotionChartQuery.isLoading}
          />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[2fr,1.1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-sky-600">
                Hiệu suất nội dung
              </p>
              <p className="text-xs text-slate-500">
                Theo dõi bài viết, bình luận và chia sẻ theo ngày
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ContentPerformanceChart
              data={contentChartQuery.data}
              loading={contentChartQuery.isLoading}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-sky-600">
                Trạng thái báo cáo
              </p>
              <p className="text-xs text-slate-500">
                Theo dõi quá trình xử lý vi phạm trong phạm vi đã chọn
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ReportStatusChart
              data={reportChartQuery.data}
              loading={reportChartQuery.isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
