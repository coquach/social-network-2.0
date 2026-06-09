'use client';

import { MediaDTO, MediaType } from '@repo/shared';
import { Film, ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type Props = {
  media: MediaDTO[];
  emptyText?: string;
};

const isVideoMedia = (item: MediaDTO) => {
  if (item.type === 'video') {
    return true;
  }

  return /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(item.url);
};

export function MediaPreviewGrid({ media, emptyText }: Props) {
  if (!media.length) {
    return (
      <p className="text-sm text-slate-500">{emptyText ?? 'Không có media.'}</p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {media.map((item, index) => {
        const isVideo = isVideoMedia(item);

        return (
          <div
            key={`${item.url}-${index}`}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="relative flex h-36 items-center justify-center bg-slate-100">
              {isVideo ? (
                <div className="flex flex-col items-center gap-2 text-slate-600">
                  <Film className="h-8 w-8" />
                  <Badge
                    variant="secondary"
                    className="bg-slate-200 text-slate-700"
                  >
                    Video
                  </Badge>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={`media-${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                {isVideo ? (
                  <Film className="h-3.5 w-3.5" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                <span>{isVideo ? 'Video' : 'Hình ảnh'}</span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-sky-700 hover:underline"
              >
                Mở
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
