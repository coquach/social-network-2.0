'use client';

import { useMemo, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaDTO, MediaType } from '@/models/social/enums/social.enum';

export function MediaCarousel({ media }: { media: MediaDTO[] }) {
  const items = useMemo(() => media ?? [], [media]);
  const [idx, setIdx] = useState(0);

  const current = items[idx];

  if (!items.length) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-500">
        Không có ảnh 
      </div>
    );
  }

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Viewer */}
      <div className="relative flex-1 min-h-0 bg-transparent">
        {/* main */}
        <div className="absolute inset-0 flex items-center justify-center">
          {current.type === MediaType.IMAGE ? (
            <CldImage
              src={current.url}
              alt="media"
              width={1200}
              height={1200}
              className="max-h-full w-auto object-contain"
            />
          ) : (
            <video
              src={current.url}
              className="max-h-full w-auto object-contain"
              controls
              playsInline
              preload="metadata"
            />
          )}
        </div>

        {/* controls */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {/* Thumb list */}
      <div className="shrink-0 border-t bg-white p-2 overflow-x-auto">
        <div className="flex gap-2">
          {items.map((m, i) => (
            <button
              key={`${m.url}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'relative h-16 w-16 rounded-lg overflow-hidden border',
                i === idx
                  ? 'border-sky-500'
                  : 'border-gray-200 hover:border-gray-300'
              )}
              aria-label={`Media ${i + 1}`}
            >
              {m.type === MediaType.IMAGE ? (
                <CldImage
                  src={m.url}
                  alt="thumb"
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-black flex items-center justify-center">
                  <Play className="text-white" size={18} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
