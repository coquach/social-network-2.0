'use client';

import { ImageIcon, VideoIcon } from '@/lib/icons';
import { MediaType } from '@repo/shared';
import { toast } from 'sonner';
import { useCreatePostContext } from './context';

/**
 * MediaUpload - File input buttons for images and videos
 */
export const CreatePostMediaUpload = () => {
  const { setMedia, maxMedia } = useCreatePostContext();

  const handleFiles = (files: File[], type: MediaType) => {
    const mapped = files.map((file) => ({ file, type }));
    setMedia((prev) => {
      const total = prev.length + mapped.length;
      if (total > maxMedia) {
        toast.error(`Bạn không thể tải nhiều hơn ${maxMedia} tệp.`);
        return prev;
      }
      return [...prev, ...mapped];
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Images */}
      <label
        htmlFor="images"
        className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
        title="Ảnh"
        aria-label="Tải lên ảnh"
      >
        <ImageIcon className="size-5 text-gray-600" />
      </label>
      <input
        type="file"
        id="images"
        accept="image/*"
        hidden
        multiple
        onChange={(e) => {
          if (!e.target.files) return;
          handleFiles(Array.from(e.target.files), MediaType.IMAGE);
        }}
      />

      {/* Videos */}
      <label
        htmlFor="videos"
        className="h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition"
        title="Video"
        aria-label="Tải lên video"
      >
        <VideoIcon className="size-5 text-gray-600" />
      </label>
      <input
        type="file"
        id="videos"
        accept="video/*"
        hidden
        multiple
        onChange={(e) => {
          if (!e.target.files) return;
          handleFiles(Array.from(e.target.files), MediaType.VIDEO);
        }}
      />
    </div>
  );
};
