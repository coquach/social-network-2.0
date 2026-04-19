/**
 * Cloudinary Upload Service Implementation
 * Web-specific implementation of IUploadService for Cloudinary
 */

import axios from 'axios';
import type {
  IUploadService,
  UploadBatchOptions,
  UploadableFile,
  UploadResult,
  UploadOptions,
} from '@repo/shared';
import { MediaType, uploadFilesInChunks } from '@repo/shared';

const resourceTypeByMediaType: Record<MediaType, 'image' | 'video' | 'auto'> = {
  [MediaType.IMAGE]: 'image',
  [MediaType.VIDEO]: 'video',
  [MediaType.AUDIO]: 'auto',
  [MediaType.FILE]: 'auto',
};

const getMediaTypeFromCloudinary = (
  resourceType: string | undefined,
  fallbackType: MediaType,
): MediaType => {
  if (fallbackType === MediaType.AUDIO || fallbackType === MediaType.FILE) {
    return fallbackType;
  }

  switch (resourceType) {
    case 'video':
      return MediaType.VIDEO;
    case 'image':
      return MediaType.IMAGE;
    case 'raw':
      return MediaType.FILE;
    default:
      return fallbackType;
  }
};

export class CloudinaryUploadService implements IUploadService {
  private cloudName: string;
  private uploadPreset: string;

  constructor(config: { cloudName: string; uploadPreset: string }) {
    this.cloudName = config.cloudName;
    this.uploadPreset = config.uploadPreset;
  }

  /**
   * Upload a single file to Cloudinary
   */
  async uploadFile(
    uploadableFile: UploadableFile<File>,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const { file, type } = uploadableFile;
    const folder = options?.folder || 'uploads';
    const resourceType =
      options?.resourceType || resourceTypeByMediaType[type];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    if (options?.publicId) {
      formData.append('public_id', options.publicId);
    }

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: options?.signal,
          onUploadProgress: (progressEvent) => {
            if (options?.onProgress && progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              options.onProgress(progress);
            }
          },
        }
      );

      const data = response.data;

      return {
        url: data.secure_url,
        type: getMediaTypeFromCloudinary(data.resource_type, type),
        publicId: data.public_id,
        thumbnailUrl: data.thumbnail_url,
        mimeType: file.type || data.resource_type,
        fileName: file.name,
        width: data.width,
        height: data.height,
        duration: data.duration,
        size: data.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error('File upload failed. Please try again.');
    }
  }

  /**
   * Upload multiple files with concurrency control
   */
  async uploadMultiple(
    files: UploadableFile<File>[],
    options?: UploadBatchOptions
  ): Promise<UploadResult[]> {
    return uploadFilesInChunks(
      (file, uploadOptions) =>
        this.uploadFile(file as UploadableFile<File>, uploadOptions),
      files,
      options,
    );
  }

  /**
   * Delete a file from Cloudinary (optional feature)
   */
  async deleteFile(publicId: string): Promise<void> {
    // Note: Deleting from Cloudinary requires backend API call with signed request
    // This is typically not done from the client for security reasons
    console.warn('Delete operation should be handled by backend API');
    throw new Error('Delete operation not supported from client');
  }
}

/**
 * Factory function to create Cloudinary upload service
 * Uses environment variables for configuration
 */
export function createCloudinaryUploadService(): IUploadService {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  return new CloudinaryUploadService({
    cloudName,
    uploadPreset,
  });
}
