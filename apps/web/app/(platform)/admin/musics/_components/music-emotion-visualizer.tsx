'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { getEmotionHint, getEmotionLabel } from './music-utils';

type MusicEmotionVisualizerProps = {
  valence: number;
  arousal: number;
  onValenceChange?: (value: number) => void;
  onArousalChange?: (value: number) => void;
  analyzing?: boolean;
  disabled?: boolean;
  className?: string;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function MusicEmotionVisualizer({
  valence,
  arousal,
  onValenceChange,
  onArousalChange,
  analyzing,
  disabled,
  className,
}: MusicEmotionVisualizerProps) {
  const label = getEmotionLabel(valence, arousal);
  const hint = getEmotionHint(valence, arousal);
  const interactive = Boolean(onValenceChange && onArousalChange);
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = React.useState(false);

  const updateFromPointer = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!interactive || disabled) return;

      const board = boardRef.current;
      if (!board || !onValenceChange || !onArousalChange) return;

      const rect = board.getBoundingClientRect();
      const nextValence = clamp((clientX - rect.left) / rect.width);
      const nextArousal = clamp(1 - (clientY - rect.top) / rect.height);

      onValenceChange(nextValence);
      onArousalChange(nextArousal);
    },
    [disabled, interactive, onArousalChange, onValenceChange],
  );

  const pointerHandlers = interactive
    ? {
        onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
          if (disabled) return;

          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          updateFromPointer(event.clientX, event.clientY);
        },
        onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
          if (!dragging) return;
          updateFromPointer(event.clientX, event.clientY);
        },
        onPointerUp: () => setDragging(false),
        onPointerCancel: () => setDragging(false),
      }
    : undefined;

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950/50',
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Phổ cảm xúc âm nhạc
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Valence / arousal được tự động gợi ý nhưng vẫn có thể chỉnh tay.
          </p>
        </div>

        <Badge className="rounded-full border-0 bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
          {label}
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Cảm xúc hiện tại
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {label}
            </div>
          </div>

          <div className="rounded-full border-0 bg-sky-50 px-3 py-1 text-[11px] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            {Math.round(clamp(valence) * 100)}% /{' '}
            {Math.round(clamp(arousal) * 100)}%
          </div>
        </div>

        <div
          ref={boardRef}
          className={cn(
            'relative min-h-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950',
            analyzing && 'opacity-90',
            interactive && !disabled && 'cursor-grab active:cursor-grabbing',
          )}
          {...pointerHandlers}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.10),transparent_26%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.08),transparent_26%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.08),transparent_26%)]" />
          <div className="absolute inset-x-8 top-1/2 h-px -translate-y-1/2 bg-slate-200/80 dark:bg-slate-800" />
          <div className="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-slate-200/80 dark:bg-slate-800" />

          <div className="absolute left-4 top-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Low valence
          </div>
          <div className="absolute right-4 top-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            High valence
          </div>
          <div className="absolute left-4 bottom-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            Low arousal
          </div>
          <div className="absolute right-4 bottom-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            High arousal
          </div>

          <div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-sky-500 shadow-[0_0_0_10px_rgba(14,165,233,0.12)] dark:border-slate-950"
            style={{
              left: `${clamp(valence) * 100}%`,
              top: `${(1 - clamp(arousal)) * 100}%`,
            }}
          />
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>

        {analyzing ? (
          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200">
            Đang phân tích cảm xúc âm nhạc...
          </div>
        ) : null}
      </div>
    </div>
  );
}
