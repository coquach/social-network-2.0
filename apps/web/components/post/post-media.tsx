'use client';

import { cn } from "@/lib/utils";
import { MediaDTO, MediaType } from "@/models/social/enums/social.enum";
import { CldImage } from "next-cloudinary";
import { useMemo } from "react";

interface PostMediaProps {
  media?: MediaDTO[];
  mediaRemaining?: number;
  onClick?: () => void;
}

export default function PostMedia({ media, mediaRemaining = 0, onClick}: PostMediaProps) {
  const preview = useMemo(
    () => (media?.length ? media.slice(0, 4) : []),
    [media]
  );

  if (!preview.length) return null;

  const isSingle = preview.length === 1;
  const isThree = preview.length === 3;

  const itemBorderClass = (i: number) => {
    if (isSingle) return '';
    if (isThree) {
      if (i === 0) return 'border-gray-200 border-r';
      if (i === 1) return 'border-gray-200 border-b';
      return '';
    }

    const isLeft = i % 2 === 0;
    const isTop = i < 2;

    return cn('border-gray-200', isLeft && 'border-r', isTop && 'border-b');
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div
        className={cn(
          'grid',
          isSingle ? 'grid-cols-1' : isThree ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2'
        )}
      >
        {preview.map((item, i) => {
          const showMore = i === 3 && mediaRemaining > 0;
          const isTallLeft = isThree && i === 0;

          return (
            <div
              key={`${item.url}-${i}`}
              className={cn(
                'relative overflow-hidden',
                isTallLeft ? 'row-span-2 h-full' : 'aspect-square',
                itemBorderClass(i)
              )}
            >
              {item.type === MediaType.IMAGE ? (
                <button
                  type="button"
                  onClick={onClick}
                  className="group absolute inset-0 w-full h-full cursor-pointer"
                  aria-label="Mở bài viết"
                >
                  <CldImage
                    src={item.url}
                    fill
                    alt={`media-${i}`}
                    sizes={
                      isSingle ? '100vw' : '(min-width: 640px) 50vw, 100vw'
                    }
                    className="object-cover"
                  />
                </button>
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              )}

              {showMore && (
                <button
                  type="button"
                  onClick={onClick}
                  className="absolute inset-0 bg-black/55 flex items-center justify-center hover:bg-black/60 transition"
                  aria-label="Xem thêm media"
                >
                  <span className="text-white text-2xl font-semibold">
                    +{mediaRemaining}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
