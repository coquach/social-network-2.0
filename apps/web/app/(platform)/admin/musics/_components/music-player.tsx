'use client';

import { Pause, Play, Music2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

import { formatMusicDuration } from './music-utils';

type MusicPlayerProps = {
  title: string;
  artist?: string;
  duration?: number;
  currentTime?: number;
  progress?: number;
  playing?: boolean;
  compact?: boolean;
  onToggle?: () => void;
  onSeek?: (time: number) => void;
  className?: string;
};

export function MusicPlayer({
  title,
  artist,
  duration,
  currentTime = 0,
  progress = 0,
  playing = false,
  compact = false,
  onToggle,
  onSeek,
  className,
}: MusicPlayerProps) {
  const totalDuration = Number.isFinite(duration) && duration ? duration : 0;
  const seekable = Boolean(onSeek && totalDuration > 0);
  const currentProgress = seekable
    ? Math.min(totalDuration, Math.max(0, currentTime))
    : 0;

  const timeLabel = `${formatMusicDuration(currentTime)} / ${formatMusicDuration(duration)}`;

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/60',
        compact ? 'space-y-2' : 'space-y-3',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onToggle}
          className="h-9 w-9 shrink-0 rounded-full border border-sky-100 bg-sky-50 text-sky-700 shadow-none hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </div>

          {artist ? (
            <div className="truncate text-xs text-slate-500 dark:text-slate-400">
              {artist}
            </div>
          ) : null}
        </div>

        <Music2 className="h-4 w-4 shrink-0 text-slate-400" />
      </div>

      <div className="space-y-1.5">
        <div className="relative">
          <Progress
            value={progress}
            className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"
          />

          {seekable ? (
            <div
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/30 bg-white shadow-sm shadow-sky-500/15 ring-2 ring-sky-500/20 dark:bg-slate-950"
              style={{ left: `${progress}%` }}
            />
          ) : null}

          {seekable ? (
            <input
              aria-label={`Seek ${title}`}
              type="range"
              min={0}
              max={totalDuration}
              step="0.1"
              value={currentProgress}
              onChange={(event) => onSeek?.(Number(event.target.value))}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{playing ? 'Đang phát' : 'Sẵn sàng phát'}</span>
          <span>{timeLabel}</span>
        </div>
      </div>
    </div>
  );
}
