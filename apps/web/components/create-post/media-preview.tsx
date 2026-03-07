'use client';

import { X } from '@/lib/icons';
import { MediaType } from '@/models/social/enums/social.enum';
import Image from 'next/image';
import { useCreatePostContext } from './context';

/**
 * MediaPreview - Grid display of uploaded media files
 * Shows image/video previews with remove buttons
 */
export const CreatePostMediaPreview = () => {
  const { previews, setMedia } = useCreatePostContext();

  if (previews.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-gray-50 p-2">
      {previews.map((item) => (
        <div key={item.key} className="relative group">
          {item.type === MediaType.IMAGE ? (
            <Image
              src={item.preview}
              alt=""
              height={96}
              width={96}
              loading="lazy"
              className="rounded-xl object-cover h-24 w-24"
            />
          ) : (
            <video
              src={item.preview}
              className="rounded-xl object-cover h-24 w-24"
            />
          )}

          <button
            type="button"
            onClick={() =>
              setMedia((prev) =>
                prev.filter(
                  (entry) =>
                    `${entry.file.name}-${entry.file.lastModified}-${entry.file.size}` !==
                    item.key
                )
              )
            }
            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hidden group-hover:flex"
            aria-label="Xóa tệp"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
};
