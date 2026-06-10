'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMusicFeatures } from '@repo/shared';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Music2, Play, Pause, Search, X, SkipForward } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface MusicExploreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MusicExploreModal = ({ isOpen, onClose }: MusicExploreModalProps) => {
  const [search, setSearch] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data, isPending, isError } = useMusicFeatures({
    search: search || undefined,
    limit: 20,
  });

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden sm:max-w-xl">
        <DialogHeader className="px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Music2 className="h-6 w-6" />
            Khám phá âm nhạc
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm bài hát, nghệ sĩ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-2xl border-slate-100 bg-slate-50/50 pl-10 focus-visible:ring-sky-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <ScrollArea className="h-[450px] pr-4 app-scroll">
            <div className="space-y-1">
              {isPending &&
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl p-2">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-2 h-3 w-20" />
                    </div>
                  </div>
                ))}

              {!isPending && songs.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                    <Music2 className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="text-sm font-medium">Không tìm thấy bài hát nào phù hợp.</p>
                  <p className="text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác.</p>
                </div>
              )}

              {!isPending &&
                songs.map((song) => (
                  <div
                    key={song.id}
                    className="group flex items-center gap-4 rounded-2xl p-2 transition hover:bg-sky-50/50 dark:hover:bg-sky-900/10"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      {song.coverImage?.url ? (
                        <Image
                          src={song.coverImage.url}
                          alt={song.title}
                          fill
                          className="object-cover transition group-hover:scale-110"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music2 className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleTogglePlay(song.id, song.audio.url)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100"
                      >
                        {playingId === song.id ? (
                          <Pause className="h-6 w-6 text-white fill-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white fill-white" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "truncate text-sm font-bold transition-colors",
                        playingId === song.id ? "text-sky-600" : "text-slate-800 dark:text-slate-200"
                      )}>
                        {song.title}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {song.artist ?? 'Nghệ sĩ ẩn danh'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pr-1">
                      {playingId === song.id && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNext();
                            }}
                            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800"
                          >
                            <SkipForward className="h-5 w-5 fill-current" />
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
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
