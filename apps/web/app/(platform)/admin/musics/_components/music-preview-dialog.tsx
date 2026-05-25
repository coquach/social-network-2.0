'use client';

import { Edit3, CalendarClock, Disc3, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetClose, SheetContent } from '@/components/ui/sheet';
import { MusicFeatureResponseDTO } from '@/models/music/musicDTO';

import { MusicPlayer } from './music-player';
import {
  formatMusicDate,
  formatMusicDuration,
  musicGenreLabels,
} from './music-utils';
import { MusicPlaybackState } from './music-table';

type MusicPreviewDialogProps = {
  music: MusicFeatureResponseDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playback: MusicPlaybackState;
  onEdit: (music: MusicFeatureResponseDTO) => void;
};

export function MusicPreviewDialog({
  music,
  open,
  onOpenChange,
  playback,
  onEdit,
}: MusicPreviewDialogProps) {
  if (!music) return null;

  const isActive = playback.activeMusicId === music.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!h-[100dvh] !w-screen !max-w-none p-0 sm:!w-[760px] [&>button]:hidden"
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-950">
          <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={music.coverImage.url}
                    alt={music.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    {music.title}
                  </div>
                  <div className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {music.artist || 'Unknown artist'}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Xem trước
                    </Badge>
                    {music.genre ? (
                      <Badge className="rounded-full border-0 bg-sky-50 px-2.5 py-1 text-[11px] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                        {musicGenreLabels[music.genre]}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(music)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>

                <SheetClose asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </SheetClose>
              </div>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={music.coverImage.url}
                    alt={music.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </div>
              </section>

              <section className="sticky top-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <MusicPlayer
                  title={music.title}
                  artist={music.artist}
                  duration={playback.duration || music.audio.duration}
                  currentTime={isActive ? playback.currentTime : 0}
                  progress={
                    isActive && playback.duration > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (playback.currentTime / playback.duration) * 100,
                          ),
                        )
                      : 0
                  }
                  playing={isActive && playback.isPlaying}
                  onToggle={() => playback.onToggle(music)}
                  onSeek={playback.onSeek}
                  compact
                  className="border-0 bg-transparent p-0 shadow-none"
                />
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Emotion stats
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Snapshot cảm xúc của bản nhạc.
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        Valence
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {Math.round(music.valence * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round(music.valence * 100)}
                      className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        Arousal
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {Math.round(music.arousal * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round(music.arousal * 100)}
                      className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Metadata
                </div>

                <Separator className="my-4 bg-slate-200/80 dark:bg-slate-800" />

                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-slate-400" />
                    <span>{formatMusicDate(music.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Disc3 className="h-4 w-4 text-slate-400" />
                    <span className="min-w-0 truncate">
                      {music.audio.publicId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Duration</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {formatMusicDuration(music.audio.duration)}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Description
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Audio preview tập trung vào trải nghiệm admin: cover lớn,
                  player rõ trạng thái, và chỉ số cảm xúc trực quan để ra quyết
                  định nhanh.
                </p>
              </section>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
