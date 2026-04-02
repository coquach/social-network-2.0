import { createCloudinaryUploadService } from '@/lib/services/cloudinary-upload.service';
import { MediaItem } from '@/lib/types/media';
import { MediaDTO, MediaType } from '@/models/social/enums/social.enum';
import { getRecommendedUploadBatchOptions } from '@repo/shared';

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
  concurrency?: number,
  chunkSize?: number,
) => {
  const uploadService = getUploadService();
  const results = await uploadService.uploadMultiple(
    files,
    getRecommendedUploadBatchOptions(files, {
      folder,
      signal,
      concurrency,
      chunkSize,
    }),
  );

  return results.map(mapUploadResultToMediaDTO);
};

export const uploadToCloudinary = async (
  file: File,
  type: MediaType,
  folder: string,
  signal?: AbortSignal,
  publicId?: string
): Promise<MediaDTO> => {
  const uploadService = getUploadService();
  const result = await uploadService.uploadFile(
    {
      file,
      type,
    },
    {
      folder,
      signal,
      publicId,
    }
  );

  return mapUploadResultToMediaDTO(result);
};
