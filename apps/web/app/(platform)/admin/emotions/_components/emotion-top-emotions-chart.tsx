'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  Activity,
  Eye,
  EyeOff,
  Layers,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmotionDashboardChartItemDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  chartsData?: EmotionDashboardChartItemDTO[];
  loading?: boolean;
};

type ViewMode = 'trend' | 'stacked' | 'distribution';

export const EMOTIONS_CONFIG = [
  {
    key: 'joy',
    label: 'Vui vẻ',
    color: '#eab308',
    stroke: '#ca8a04',
    bg: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  {
    key: 'sadness',
    label: 'Buồn',
    color: '#3b82f6',
    stroke: '#2563eb',
    bg: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  {
    key: 'anger',
    label: 'Tức giận',
    color: '#ef4444',
    stroke: '#dc2626',
    bg: 'bg-red-500',
    lightBg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  {
    key: 'fear',
    label: 'Sợ hãi',
    color: '#8b5cf6',
    stroke: '#7c3aed',
    bg: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  {
    key: 'disgust',
    label: 'Chán ghét',
    color: '#10b981',
    stroke: '#059669',
    bg: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  {
    key: 'surprise',
    label: 'Ngạc nhiên',
    color: '#f97316',
    stroke: '#ea580c',
    bg: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
  },
  {
    key: 'neutral',
    label: 'Trung lập',
    color: '#64748b',
    stroke: '#475569',
    bg: 'bg-slate-500',
    lightBg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  },
] as const;

type EmotionKey = (typeof EMOTIONS_CONFIG)[number]['key'];

interface DailyChartRow {
  rawDate: string;
  dateLabel: string;
  fullDate: string;
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
  neutral: number;
  total: number;
}

const parseDateLabel = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, 'dd/MM');
  } catch {
    return dateStr;
  }
};

const parseFullDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return format(d, 'dd/MM/yyyy');
  } catch {
    return dateStr;
  }
};

const formatCount = (value: number) => value.toLocaleString('vi-VN');

export function EmotionTopEmotionsChart({ chartsData, loading }: Props) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('trend');
  const [visibleEmotions, setVisibleEmotions] = React.useState<
    Record<EmotionKey, boolean>
  >({
    joy: true,
    sadness: true,
    anger: true,
    fear: true,
    disgust: true,
    surprise: true,
    neutral: true,
  });

  const toggleEmotion = (key: EmotionKey) => {
    setVisibleEmotions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showAllEmotions = () => {
    setVisibleEmotions({
      joy: true,
      sadness: true,
      anger: true,
      fear: true,
      disgust: true,
      surprise: true,
      neutral: true,
    });
  };

  // Chuẩn hoá dữ liệu chuỗi thời gian theo từng ngày
  const normalizedDailyData = React.useMemo<DailyChartRow[]>(() => {
    if (!chartsData || !chartsData.length) return [];

    return chartsData.map((item) => {
      const joy = item.joy ?? item.happy ?? 0;
      const sadness = item.sadness ?? item.sad ?? 0;
      const anger = item.anger ?? item.angry ?? 0;
      const fear = item.fear ?? 0;
      const disgust = item.disgust ?? 0;
      const surprise = item.surprise ?? 0;
      const neutral = item.neutral ?? 0;
      const total = joy + sadness + anger + fear + disgust + surprise + neutral;

      return {
        rawDate: item.date,
        dateLabel: parseDateLabel(item.date),
        fullDate: parseFullDate(item.date),
        joy,
        sadness,
        anger,
        fear,
        disgust,
        surprise,
        neutral,
        total,
      };
    });
  }, [chartsData]);

  // Tổng hợp dữ liệu toàn chu kỳ
  const totals = React.useMemo(() => {
    const acc: Record<EmotionKey, number> & { total: number } = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      disgust: 0,
      surprise: 0,
      neutral: 0,
      total: 0,
    };

    normalizedDailyData.forEach((day) => {
      acc.joy += day.joy;
      acc.sadness += day.sadness;
      acc.anger += day.anger;
      acc.fear += day.fear;
      acc.disgust += day.disgust;
      acc.surprise += day.surprise;
      acc.neutral += day.neutral;
      acc.total += day.total;
    });

    return acc;
  }, [normalizedDailyData]);

  // Danh sách phân bố và tỷ lệ
  const distributionData = React.useMemo(() => {
    return EMOTIONS_CONFIG.map((cfg) => {
      const count = totals[cfg.key] || 0;
      const percentage = totals.total > 0 ? (count / totals.total) * 100 : 0;
      return {
        ...cfg,
        count,
        percentage,
      };
    }).sort((a, b) => b.count - a.count);
  }, [totals]);

  // Cảm xúc chiếm tỷ lệ cao nhất
  const dominantEmotion =
    distributionData[0]?.count > 0 ? distributionData[0] : null;

  // Ngày có nhiều cảm xúc được ghi nhận nhất
  const peakDay = React.useMemo(() => {
    if (!normalizedDailyData.length) return null;
    return [...normalizedDailyData].sort((a, b) => b.total - a.total)[0];
  }, [normalizedDailyData]);

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="space-y-2 pb-0">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  if (!normalizedDailyData.length) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <div className="text-base font-semibold text-slate-900">
            Biểu đồ diễn biến & phân bố cảm xúc
          </div>
          <div className="text-sm text-slate-500">
            Chưa có dữ liệu cảm xúc trong phạm vi thời gian này.
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Hệ thống sẽ tự động cập nhật biểu đồ khi có dữ liệu phân tích cảm xúc
            từ cộng đồng.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      {/* Card Header & Controls */}
      <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-900">
              Diễn biến & Phân bố cảm xúc cộng đồng
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Theo dõi xu hướng cảm xúc qua chuỗi ngày (
            {normalizedDailyData[0]?.dateLabel} -{' '}
            {normalizedDailyData[normalizedDailyData.length - 1]?.dateLabel}) •
            Tổng ghi nhận:{' '}
            <strong className="text-slate-800">
              {formatCount(totals.total)} lượt
            </strong>
          </p>
        </div>

        {/* View Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 rounded-lg px-3 text-xs font-medium transition-all ${
              viewMode === 'trend'
                ? 'bg-white font-semibold text-sky-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setViewMode('trend')}
          >
            <Activity className="mr-1.5 h-3.5 w-3.5" />
            Xu hướng ngày
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 rounded-lg px-3 text-xs font-medium transition-all ${
              viewMode === 'stacked'
                ? 'bg-white font-semibold text-sky-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setViewMode('stacked')}
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Cột xếp chồng
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-8 rounded-lg px-3 text-xs font-medium transition-all ${
              viewMode === 'distribution'
                ? 'bg-white font-semibold text-sky-700 shadow-xs ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setViewMode('distribution')}
          >
            <PieIcon className="mr-1.5 h-3.5 w-3.5" />
            Cơ cấu & Phân bố
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-5">
        {/* Quick Highlights / Stats Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <span className="text-xs font-medium text-slate-500">
              Tổng cảm xúc chu kỳ
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">
                {formatCount(totals.total)}
              </span>
              <span className="text-xs text-slate-500">lượt quét</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <span className="text-xs font-medium text-slate-500">
              Cảm xúc nổi bật nhất
            </span>
            <div className="mt-1 flex items-center gap-2">
              {dominantEmotion ? (
                <>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: dominantEmotion.color }}
                  />
                  <span className="text-sm font-semibold text-slate-900">
                    {dominantEmotion.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({dominantEmotion.percentage.toFixed(1)}%)
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-500">Chưa ghi nhận</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <span className="text-xs font-medium text-slate-500">
              Ngày cao điểm
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {peakDay && peakDay.total > 0
                  ? peakDay.fullDate
                  : 'Bình thường'}
              </span>
              {peakDay && peakDay.total > 0 && (
                <span className="text-xs text-slate-500">
                  ({peakDay.total} lượt)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Emotion Legend & Interactive Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-100 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-medium text-slate-400">
              Bộ lọc cảm xúc:
            </span>
            {EMOTIONS_CONFIG.map((item) => {
              const count = totals[item.key] || 0;
              const isVisible = visibleEmotions[item.key];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleEmotion(item.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                    isVisible
                      ? `${item.lightBg} ${item.border} ${item.text} shadow-2xs`
                      : 'border-slate-200 bg-slate-100 text-slate-400 opacity-60 line-through'
                  }`}
                  title={
                    isVisible
                      ? 'Nhấp để ẩn đường này'
                      : 'Nhấp để hiện đường này'
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                  <span className="text-[11px] opacity-75">({count})</span>
                  {isVisible ? (
                    <Eye className="h-3 w-3 opacity-60" />
                  ) : (
                    <EyeOff className="h-3 w-3 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={showAllEmotions}
            className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline"
          >
            Hiện tất cả
          </button>
        </div>

        {/* Main Chart Rendering depending on viewMode */}
        {viewMode === 'trend' && (
          <div className="space-y-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={normalizedDailyData}
                  margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                >
                  <defs>
                    {EMOTIONS_CONFIG.map((item) => (
                      <linearGradient
                        key={`gradient-${item.key}`}
                        id={`gradient-${item.key}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={item.color}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="95%"
                          stopColor={item.color}
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dateLabel"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    content={(props: TooltipProps<number, string>) => {
                      if (!props.active || !props.payload?.length) return null;
                      const label = props.label as string;
                      const currentDay = normalizedDailyData.find(
                        (d) => d.dateLabel === label,
                      );

                      return (
                        <div className="min-w-[180px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                          <div className="border-b border-slate-100 pb-1.5">
                            <div className="text-xs font-semibold text-slate-900">
                              {currentDay?.fullDate ?? label}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Tổng cộng: {currentDay?.total ?? 0} lượt ghi nhận
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {EMOTIONS_CONFIG.map((item) => {
                              const val = currentDay?.[item.key] ?? 0;
                              if (!visibleEmotions[item.key]) return null;

                              return (
                                <div
                                  key={item.key}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-600">
                                      {item.label}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-mono font-medium ${
                                      val > 0
                                        ? 'font-bold text-slate-900'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {EMOTIONS_CONFIG.map((item) => {
                    if (!visibleEmotions[item.key]) return null;
                    return (
                      <Area
                        key={item.key}
                        type="monotone"
                        dataKey={item.key}
                        name={item.label}
                        stroke={item.stroke}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#gradient-${item.key})`}
                        dot={{ r: 3, strokeWidth: 1, fill: item.color }}
                        activeDot={{ r: 5, strokeWidth: 2 }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'stacked' && (
          <div className="space-y-2">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={normalizedDailyData}
                  margin={{ top: 10, right: 16, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dateLabel"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    content={(props: TooltipProps<number, string>) => {
                      if (!props.active || !props.payload?.length) return null;
                      const label = props.label as string;
                      const currentDay = normalizedDailyData.find(
                        (d) => d.dateLabel === label,
                      );

                      return (
                        <div className="min-w-[180px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                          <div className="border-b border-slate-100 pb-1.5">
                            <div className="text-xs font-semibold text-slate-900">
                              {currentDay?.fullDate ?? label}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Tổng cộng: {currentDay?.total ?? 0} lượt ghi nhận
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {EMOTIONS_CONFIG.map((item) => {
                              const val = currentDay?.[item.key] ?? 0;
                              if (!visibleEmotions[item.key]) return null;

                              return (
                                <div
                                  key={item.key}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-slate-600">
                                      {item.label}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-mono font-medium ${
                                      val > 0
                                        ? 'font-bold text-slate-900'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {val}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {EMOTIONS_CONFIG.map((item) => {
                    if (!visibleEmotions[item.key]) return null;
                    return (
                      <Bar
                        key={item.key}
                        dataKey={item.key}
                        name={item.label}
                        stackId="daily"
                        fill={item.color}
                        radius={[2, 2, 0, 0]}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'distribution' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {distributionData.map((item, idx) => (
                <div
                  key={item.key}
                  className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {item.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatCount(item.count)} lượt
                      </span>
                      <span className="ml-1.5 text-xs text-slate-500">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
