'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardOverviewResponseDTO } from '@/models/emotion/adminEmotionDTO';

type Props = {
  data?: DashboardOverviewResponseDTO;
  loading?: boolean;
};

type EmotionMeta = {
  label: string;
  color: string;
  display: string;
};

const emotionMeta = (emotion: string): EmotionMeta => {
  const key = emotion.toLowerCase();

  if (key.includes('sad')) {
    return { label: 'Buồn', color: '#3b82f6', display: 'Buồn' };
  }

  if (key.includes('anger') || key.includes('angry')) {
    return { label: 'Tức giận', color: '#ef4444', display: 'Tức giận' };
  }

  if (key.includes('joy')) {
    return { label: 'Vui', color: '#eab308', display: 'Vui' };
  }

  if (key.includes('fear')) {
    return { label: 'Sợ hãi', color: '#8b5cf6', display: 'Sợ hãi' };
  }

  if (key.includes('disgust')) {
    return { label: 'Chán ghét', color: '#10b981', display: 'Chán ghét' };
  }

  if (key.includes('surprise')) {
    return { label: 'Ngạc nhiên', color: '#f97316', display: 'Ngạc nhiên' };
  }

  if (key.includes('neutral')) {
    return { label: 'Trung lập', color: '#64748b', display: 'Trung lập' };
  }

  return { label: emotion, color: '#64748b', display: emotion };
};

const formatCount = (value: number) => value.toLocaleString('vi-VN');

export function EmotionTopEmotionsChart({ data, loading }: Props) {
  const chartData = React.useMemo(() => {
    const source = data?.topEmotions ?? {};

    return Object.entries(source)
      .map(([emotion, count]) => {
        const meta = emotionMeta(emotion);

        return {
          emotion,
          count,
          label: meta.label,
          display: meta.display,
          color: meta.color,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [data?.topEmotions]);

  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="space-y-2 pb-0">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData.length) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <div className="text-base font-semibold text-slate-900">
            Top emotions
          </div>
          <div className="text-sm text-slate-500">
            Chưa có dữ liệu cảm xúc để hiển thị biểu đồ.
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Hệ thống sẽ tự động tổng hợp biểu đồ khi có dữ liệu phân tích.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader className="space-y-2 pb-0">
        <div className="text-base font-semibold text-slate-900">
          Top emotions
        </div>
        <div className="text-sm text-slate-500">
          Tần suất các cảm xúc xuất hiện trong cụm dữ liệu gần nhất.
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {chartData.map((item) => (
            <div
              key={item.emotion}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-600">{item.display}</span>
            </div>
          ))}
          <div className="ml-auto text-xs font-medium text-slate-400">
            Tổng: {formatCount(total)}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                horizontal={false}
              />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="display"
                width={88}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const item = payload[0].payload as {
                    display: string;
                    count: number;
                    color: string;
                  };

                  const percentage = total ? (item.count / total) * 100 : 0;

                  return (
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                      <div className="text-sm font-medium text-slate-900">
                        {item.display}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatCount(item.count)} lần • {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={20}>
                {chartData.map((item) => (
                  <Cell key={item.emotion} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
