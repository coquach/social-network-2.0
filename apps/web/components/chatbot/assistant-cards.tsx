'use client';

import { useState, useRef } from 'react';
import type { AssistantShowCardAction } from '@repo/shared';
import {
  User,
  Users,
  Music2,
  FileText,
  HeartPulse,
  ExternalLink,
  Play,
  Pause,
} from 'lucide-react';

interface AssistantCardsProps {
  cards: AssistantShowCardAction[];
  onNavigate: (href: string) => void;
}

export function AssistantCards({ cards, onNavigate }: AssistantCardsProps) {
  const [playingTrackUrl, setPlayingTrackUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!cards || cards.length === 0) return null;

  const handleTogglePlay = (audioUrl: string) => {
    if (playingTrackUrl === audioUrl) {
      audioRef.current?.pause();
      setPlayingTrackUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingTrackUrl(null);
      audio.onerror = () => setPlayingTrackUrl(null);
      audio.play().catch(() => setPlayingTrackUrl(null));
      audioRef.current = audio;
      setPlayingTrackUrl(audioUrl);
    }
  };

  return (
    <div className="mt-3 space-y-2 pt-2 border-t border-border/40" role="region" aria-label="Thẻ thông tin đính kèm">
      {cards.map((card) => {
        const { cardType, title, subtitle, imageUrl, actionUrl, actionLabel } = card.payload;
        const isMusic = cardType === 'music';
        const isPlaying = isMusic && actionUrl && playingTrackUrl === actionUrl;

        return (
          <div
            key={card.id}
            className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background/80 hover:bg-background border border-border/80 hover:border-primary/40 shadow-xs transition-all duration-200"
          >
            {/* Left: Thumbnail / Icon & Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border/60">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <>
                    {cardType === 'profile' && <User size={18} className="text-primary" />}
                    {cardType === 'group' && <Users size={18} className="text-indigo-500" />}
                    {cardType === 'music' && <Music2 size={18} className="text-pink-500" />}
                    {cardType === 'post' && <FileText size={18} className="text-amber-500" />}
                    {cardType === 'emotion' && <HeartPulse size={18} className="text-rose-500" />}
                  </>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {title}
                </p>
                {subtitle && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isMusic && actionUrl && (
                <button
                  type="button"
                  onClick={() => handleTogglePlay(actionUrl)}
                  aria-label={isPlaying ? 'Dừng phát' : 'Nghe thử'}
                  className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition cursor-pointer active:scale-95"
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                </button>
              )}

              {actionUrl && (
                <button
                  type="button"
                  onClick={() => onNavigate(actionUrl)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition cursor-pointer active:scale-95 shadow-2xs"
                >
                  <span>{actionLabel || (isMusic ? 'Chi tiết' : 'Xem')}</span>
                  <ExternalLink size={11} className="opacity-80" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
