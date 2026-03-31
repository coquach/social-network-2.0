/**
 * Upload Types
 * Platform-agnostic file upload type definitions
 * 
 * Implementations can use:
 * - Web: Cloudinary, AWS S3, direct upload
 * - Mobile: Platform-specific upload services or backend API
 */

import type { MediaType } from './enums';

/**
 * Generic file item for upload
 * Platform will provide appropriate File/Blob/Asset type
 */
export interface UploadableFile {
  // Platform-specific file object (File for web, Asset for mobile, etc.)
  file: any;
  type: MediaType;
  // Optional preview URI for immediate display
  previewUri?: string;
}

/**
 * Result after successful upload
 */
export interface UploadResult {
  url: string;
  type: MediaType;
  publicId?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
  size?: number;
}

/**
 * Upload options/configuration
 */
export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
  signal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

/**
 * Upload service interface
 * Platform must provide implementation
 */
export interface IUploadService {
  /**
   * Upload a single file
   */
  uploadFile(
    file: UploadableFile,
    options?: UploadOptions
  ): Promise<UploadResult>;

  /**
   * Upload multiple files with optional concurrency control
   */
  uploadMultiple(
    files: UploadableFile[],
    options?: UploadOptions & { concurrency?: number }
  ): Promise<UploadResult[]>;

  /**
   * Delete uploaded file (if supported)
   */
  deleteFile?(publicId: string): Promise<void>;
}
