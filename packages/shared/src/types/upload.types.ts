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
 * Portable file descriptor for React Native / Expo uploads.
 * Web can use the browser File object directly via UploadableFile<File>.
 */
export interface NativeUploadFileDescriptor {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
}

/**
 * Generic file item for upload
 * Platform will provide the appropriate concrete file type.
 */
export interface UploadableFile<TFile = unknown> {
  file: TFile;
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
 * Batch upload options.
 * `concurrency` limits simultaneous uploads inside a chunk.
 * `chunkSize` limits how many files are attempted before moving to the next chunk.
 */
export interface UploadBatchOptions extends UploadOptions {
  concurrency?: number;
  chunkSize?: number;
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
    options?: UploadBatchOptions
  ): Promise<UploadResult[]>;

  /**
   * Delete uploaded file (if supported)
   */
  deleteFile?(publicId: string): Promise<void>;
}
