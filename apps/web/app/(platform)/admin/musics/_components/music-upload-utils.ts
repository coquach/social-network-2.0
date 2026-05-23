'use client';

import axios from 'axios';

import type { MediaDTO } from '@repo/shared';

export type MusicUploadTarget = 'audio' | 'image';

export type UploadProgressCallback = (progress: number) => void;

export type UploadedMusicAsset = Omit<MediaDTO, 'publicId'> & {
  publicId: string;
  type: any;
  duration?: number;
};

const readAudioDuration = (file: File) => {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');

    audio.preload = 'metadata';
    audio.src = url;

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc thời lượng âm thanh'));
    };
  });
};

export const uploadMusicAsset = async ({
  file,
  target,
  folder,
  publicId,
  signal,
  onProgress,
}: {
  file: File;
  target: MusicUploadTarget;
  folder: string;
  publicId?: string;
  signal?: AbortSignal;
  onProgress?: UploadProgressCallback;
}): Promise<UploadedMusicAsset> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Thiếu cấu hình Cloudinary upload');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  if (publicId) {
    formData.append('public_id', publicId);
  }

  const duration =
    target === 'audio' ? await readAudioDuration(file) : undefined;
  const resourceType = target === 'audio' ? 'auto' : 'image';

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return;

        onProgress((event.loaded / event.total) * 100);
      },
    },
  );

  const data = response.data;

  return {
    url: data.secure_url,
    publicId: data.public_id,
    type: target === 'audio' ? ('audio' as any) : ('image' as any),
    duration,
  };
};
