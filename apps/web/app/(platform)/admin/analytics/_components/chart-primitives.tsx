"use client";

import { useMemo } from "react";

type SparklineDatum = {
  label: string;
  value: number;
};

type SparklineProps = {
  data: SparklineDatum[];
  height?: number;
  className?: string;
};

export function AreaSparkline({ data, height = 200, className }: SparklineProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const chartWidth = Math.max(1, (data.length - 1) * 120);

  const { points, areaPoints } = useMemo(() => {
    const coordinates = data
      .map((item, index) => {
        const x = (index / Math.max(1, data.length - 1)) * chartWidth;
        const y = height - (item.value / maxValue) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return {
      points: coordinates,
      areaPoints: `0,${height} ${coordinates} ${chartWidth},${height}`,
    };
  }, [chartWidth, data, height, maxValue]);

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${height}`}
      className={className ?? "h-[260px] w-full"}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="trendArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={0}
          x2={chartWidth}
          y1={height * fraction}
          y2={height * fraction}
          className="stroke-sky-100"
          strokeDasharray="4 4"
        />
      ))}

      <polyline fill="url(#trendArea)" stroke="none" points={areaPoints} className="transition-all" />

      <polyline
        fill="none"
        stroke="url(#trendArea)"
        strokeWidth={3}
        strokeLinecap="round"
        points={points}
      />

      {data.map((item, index) => {
        const x = (index / Math.max(1, data.length - 1)) * chartWidth;
        const y = height - (item.value / maxValue) * height;

        return (
          <g key={item.label}>
            <circle cx={x} cy={y} r={5} className="fill-white stroke-sky-500" strokeWidth={3} />
            <text x={x} y={y - 12} textAnchor="middle" className="fill-slate-600 text-[10px]">
              {item.value.toLocaleString("vi-VN")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type StackedSegment = {
  key: string;
  value: number;
  color: string;
};

type StackedBar = {
  label: string;
  segments: StackedSegment[];
};

type StackedColumnsProps = {
  data: StackedBar[];
  height?: number;
};

export function StackedColumns({ data, height = 180 }: StackedColumnsProps) {
  const maxTotal = Math.max(
    ...data.map((entry) => entry.segments.reduce((total, segment) => total + segment.value, 0)),
    1,
  );

  return (
    <div className="flex items-end gap-4 overflow-x-auto pb-2 pt-2">
      {data.map((entry) => {
        const total = entry.segments.reduce((sum, segment) => sum + segment.value, 0);
        const scale = height / Math.max(1, maxTotal);

        return (
          <div key={entry.label} className="flex flex-col items-center gap-2 text-sm text-slate-600">
            <div className="flex h-48 w-10 flex-col justify-end overflow-hidden rounded-md bg-sky-50 shadow-inner">
              {entry.segments.map((segment) => (
                <div
                  key={segment.key}
                  className={`${segment.color} transition-all`}
                  style={{ height: `${segment.value * scale}px` }}
                />
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-700">{entry.label}</div>
            <div className="text-[11px] text-slate-500">{total} lượt</div>
          </div>
        );
      })}
    </div>
  );
}

type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  data: DonutSlice[];
};

export function DonutChart({ data }: DonutChartProps) {
  const total = Math.max(data.reduce((sum, slice) => sum + slice.value, 0), 1);
  const radius = 64;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <svg viewBox="0 0 200 200" className="h-56 w-56">
      <g transform="translate(100, 100)">
        <circle r={radius} fill="none" stroke="#f8fafc" strokeWidth={strokeWidth} />
        {data.map((slice) => {
          const start = accumulated / total;
          accumulated += slice.value;
          const end = accumulated / total;

          const dashArray = `${(end - start) * circumference} ${circumference}`;
          const dashOffset = -start * circumference;

          return (
            <circle
              key={slice.label}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </svg>
  );
}
