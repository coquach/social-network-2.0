import { MediaItem } from '@/lib/types/media';
import { MediaDTO, MediaType } from '@/models/social/enums/social.enum';
import axios from 'axios';

export const uploadMultipleToCloudinary = async (
  files: MediaItem[],
  folder: string,
  signal?: AbortSignal,
  concurrency = 3
) => {
  const results: MediaDTO[] = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const chunk = files.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((item) =>
        uploadToCloudinary(
          item.file,
          item.type === MediaType.VIDEO ? 'video' : 'image',
          folder,
          signal
        )
      )
    );
    results.push(...chunkResults);
  }
  window.removeEventListener('beforeunload', () => {});
  return results;
};

export const uploadToCloudinary = async (
  file: File,
  type: 'image' | 'video',
  folder: string,
  signal?: AbortSignal,
  publicId?: string
): Promise<MediaDTO> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append(
    'upload_preset',
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
  );
  formData.append('folder', folder);
  if (publicId) {
    // phải đúng key: public_id
    formData.append('public_id', publicId);
  }

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${type}/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
    }
  );

  const data = res.data;

  return {
    url: data.secure_url,
    type: data.resource_type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
    publicId: data.public_id,
  };
};
