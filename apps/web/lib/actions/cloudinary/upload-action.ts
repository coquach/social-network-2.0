import { createCloudinaryUploadService } from '@/lib/services/cloudinary-upload.service';
import { MediaItem } from '@/lib/types/media';
import { MediaDTO, MediaType } from '@/models/social/enums/social.enum';

let uploadServiceInstance:
  | ReturnType<typeof createCloudinaryUploadService>
  | null = null;

const getUploadService = () => {
  if (!uploadServiceInstance) {
    uploadServiceInstance = createCloudinaryUploadService();
  }

  return uploadServiceInstance;
};

const mapUploadResultToMediaDTO = (result: {
  url: string;
  type: MediaType;
  publicId?: string;
}): MediaDTO => ({
  url: result.url,
  type: result.type,
  publicId: result.publicId,
});

export const uploadMultipleToCloudinary = async (
  files: MediaItem[],
  folder: string,
  signal?: AbortSignal,
  concurrency = 3
) => {
  const uploadService = getUploadService();
  const results = await uploadService.uploadMultiple(files, {
    folder,
    signal,
    concurrency,
  });

  return results.map(mapUploadResultToMediaDTO);
};

export const uploadToCloudinary = async (
  file: File,
  type: 'image' | 'video',
  folder: string,
  signal?: AbortSignal,
  publicId?: string
): Promise<MediaDTO> => {
  const uploadService = getUploadService();
  const result = await uploadService.uploadFile(
    {
      file,
      type: type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
    },
    {
      folder,
      signal,
      publicId,
    }
  );

  return mapUploadResultToMediaDTO(result);
};
