import { MediaType, type AttachmentDTO, type UploadableFile } from '@repo/shared';

export type ChatComposerAttachment = {
  id: string;
  type: MediaType;
  name: string;
  mimeType?: string;
  size?: number;
  durationMs?: number;
  previewUri?: string;
  thumbnailUri?: string;
  uploadFile: UploadableFile;
};

const imageExtensions = new Set([
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'bmp',
  'heic',
  'heif',
]);

const videoExtensions = new Set([
  'mp4',
  'mov',
  'm4v',
  'avi',
  'webm',
  'mkv',
]);

const audioExtensions = new Set([
  'mp3',
  'wav',
  'm4a',
  'aac',
  'ogg',
  'flac',
  'oga',
  'opus',
]);

const getExtension = (fileName?: string) =>
  fileName?.split('.').pop()?.toLowerCase() ?? '';

export const inferMediaType = (mimeType?: string, fileName?: string) => {
  const normalizedMimeType = mimeType?.toLowerCase();

  if (normalizedMimeType?.startsWith('image/')) {
    return MediaType.IMAGE;
  }

  if (normalizedMimeType?.startsWith('video/')) {
    return MediaType.VIDEO;
  }

  if (normalizedMimeType?.startsWith('audio/')) {
    return MediaType.AUDIO;
  }

  const extension = getExtension(fileName);
  if (imageExtensions.has(extension)) {
    return MediaType.IMAGE;
  }

  if (videoExtensions.has(extension)) {
    return MediaType.VIDEO;
  }

  if (audioExtensions.has(extension)) {
    return MediaType.AUDIO;
  }

  return MediaType.FILE;
};

export const getAttachmentTypeFromMessage = (attachment: AttachmentDTO) =>
  inferMediaType(attachment.mimeType, attachment.fileName);

export const formatAttachmentSize = (size?: number) => {
  if (!size || Number.isNaN(size)) {
    return null;
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const formatAttachmentDuration = (durationMs?: number | null) => {
  if (!durationMs || Number.isNaN(durationMs)) {
    return null;
  }

  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const buildAttachmentMeta = (
  size?: number,
  durationMs?: number | null,
) => {
  const parts = [
    formatAttachmentDuration(durationMs),
    formatAttachmentSize(size),
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' • ') : null;
};
