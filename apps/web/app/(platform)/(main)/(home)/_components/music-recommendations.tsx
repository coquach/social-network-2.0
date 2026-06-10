'use client';

import { Music2, Play, Pause, ChevronRight, SkipForward } from 'lucide-react';
import { useMusicRecommendations } from '@repo/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { MusicExploreModal } from './music-explore-modal';
import { cn } from '@/lib/utils';

const RECOMMENDATION_LIMIT = 5;

export const MusicRecommendations = () => {
  const { data, isPending, isError } = useMusicRecommendations({ 
    page: 1, 
    limit: RECOMMENDATION_LIMIT 
  });
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songs = useMemo(() => data?.data ?? [], [data?.data]);

  const handleTogglePlay = useCallback((songId: string, url: string) => {
    if (playingId === songId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(console.error);
        setPlayingId(songId);
      }
    }
  }, [playingId]);

  const handleNext = useCallback(() => {
    if (songs.length === 0) return;
    
    const currentIndex = songs.findIndex(s => s.id === playingId);
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    
    handleTogglePlay(nextSong.id, nextSong.audio.url);
  }, [playingId, songs, handleTogglePlay]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.onended = () => {
      handleNext();
    };
  }, [handleNext]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-linear-to-r from-sky-50 via-white to-indigo-50 px-4 py-3">
        <p className="text-lg font-bold text-sky-500">Gợi ý âm nhạc</p>
        
        <button
          onClick={() => setIsExploreOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
        >
          Khám phá
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-2 py-2">
        {isPending &&
          Array.from({ length: RECOMMENDATION_LIMIT }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
            </div>
          ))}

        {!isPending && isError && (
          <div className="mx-2 my-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-600">
            Không thể tải gợi ý âm nhạc.
          </div>
        )}

        {!isPending && !isError && songs.length === 0 && (
          <div className="mx-2 my-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 text-center">
            Chưa có gợi ý âm nhạc nào.
          </div>
        )}

        {!isPending &&
          !isError &&
          songs.map((song) => (
            <div
              key={song.id}
              className="group flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-sky-50/50 dark:hover:bg-sky-900/10"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                {song.coverImage?.url ? (
                  <Image
                    src={song.coverImage.url}
                    alt={song.title}
                    fill
                    className="object-cover transition group-hover:scale-110"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Music2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => handleTogglePlay(song.id, song.audio.url)}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100"
                >
                  {playingId === song.id ? (
                    <Pause className="h-5 w-5 text-white fill-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white fill-white" />
                  )}
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className={cn(
                  "truncate text-sm font-semibold transition-colors",
                  playingId === song.id ? "text-sky-600" : "text-slate-800 dark:text-slate-200"
                )}>
                  {song.title}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {song.artist ?? 'Nghệ sĩ ẩn danh'}
                </p>
              </div>

              <div className="flex items-center gap-1 pr-1">
                {playingId === song.id && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
                    >
                      <SkipForward className="h-4 w-4 fill-current" />
                    </button>
                    <div className="flex items-center gap-0.5">
                      <div className="h-3 w-0.5 animate-music-bar-1 bg-sky-500" />
                      <div className="h-4 w-0.5 animate-music-bar-2 bg-sky-500" />
                      <div className="h-2 w-0.5 animate-music-bar-3 bg-sky-500" />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      <MusicExploreModal
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
      />
    </div>
  );
};
