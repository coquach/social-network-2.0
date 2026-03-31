import type {
  IUploadService,
  UploadableFile,
  UploadOptions,
  UploadResult,
} from '@repo/shared';
import { MediaType } from '@repo/shared';

type NativeCloudinaryConfig = {
  cloudName: string;
  uploadPreset: string;
};

type NativeUploadFile = {
  uri: string;
  name?: string;
  type?: string;
};

const fallbackMimeTypeByMediaType: Record<MediaType, string> = {
  [MediaType.IMAGE]: 'image/jpeg',
  [MediaType.VIDEO]: 'video/mp4',
  [MediaType.AUDIO]: 'audio/m4a',
  [MediaType.FILE]: 'application/octet-stream',
};

const resourceTypeByMediaType: Record<MediaType, 'image' | 'video' | 'auto'> = {
  [MediaType.IMAGE]: 'image',
  [MediaType.VIDEO]: 'video',
  [MediaType.AUDIO]: 'auto',
  [MediaType.FILE]: 'auto',
};

const normalizeFile = (
  uploadableFile: UploadableFile,
): { file: NativeUploadFile; name: string; mimeType: string } => {
  const rawFile = uploadableFile.file as NativeUploadFile | undefined;

  if (!rawFile?.uri) {
    throw new Error('Selected file is missing a local uri.');
  }

  const mimeType =
    rawFile.type?.trim() || fallbackMimeTypeByMediaType[uploadableFile.type];
  const name =
    rawFile.name?.trim() || `upload-${Date.now()}.${mimeType.split('/')[1] ?? 'bin'}`;

  return {
    file: rawFile,
    name,
    mimeType,
  };
};

export class NativeCloudinaryUploadService implements IUploadService {
  private readonly cloudName: string;
  private readonly uploadPreset: string;

  constructor(config: NativeCloudinaryConfig) {
    this.cloudName = config.cloudName;
    this.uploadPreset = config.uploadPreset;
  }

  async uploadFile(
    uploadableFile: UploadableFile,
    options?: UploadOptions,
  ): Promise<UploadResult> {
    const { file, name, mimeType } = normalizeFile(uploadableFile);
    const folder = options?.folder || 'uploads';
    const resourceType =
      options?.resourceType || resourceTypeByMediaType[uploadableFile.type];

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name,
      type: mimeType,
    } as any);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', folder);

    if (options?.publicId) {
      formData.append('public_id', options.publicId);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
        signal: options?.signal,
      },
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Cloudinary upload failed.');
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      type: uploadableFile.type,
      publicId: data.public_id,
      thumbnailUrl: data.thumbnail_url,
      mimeType,
      fileName: name,
      width: data.width,
      height: data.height,
      duration: data.duration,
      size: data.bytes,
    };
  }

  async uploadMultiple(
    files: UploadableFile[],
    options?: UploadOptions & { concurrency?: number },
  ): Promise<UploadResult[]> {
    const concurrency = options?.concurrency || 3;
    const results: UploadResult[] = [];

    for (let index = 0; index < files.length; index += concurrency) {
      const batch = files.slice(index, index + concurrency);
      const batchResults = await Promise.all(
        batch.map((file) => this.uploadFile(file, options)),
      );
      results.push(...batchResults);
    }

    return results;
  }

  async deleteFile(): Promise<void> {
    throw new Error('Delete operation is not supported from the native client.');
  }
}

export function createNativeCloudinaryUploadService(): IUploadService {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.',
    );
  }

  return new NativeCloudinaryUploadService({
    cloudName,
    uploadPreset,
  });
}
