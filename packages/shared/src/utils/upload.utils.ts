import { MediaType } from '../types/enums';
import type {
  IUploadService,
  UploadBatchOptions,
  UploadOptions,
  UploadResult,
  UploadableFile,
} from '../types/upload.types';

const DEFAULT_UPLOAD_CONCURRENCY = 3;
const DEFAULT_UPLOAD_CHUNK_SIZE = 6;
const HEAVY_MEDIA_CONCURRENCY = 2;
const HEAVY_MEDIA_CHUNK_SIZE = 2;
const MIXED_MEDIA_CHUNK_SIZE = 4;

const clampPositiveInteger = (
  value: number | undefined,
  fallback: number,
): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value as number));
};

export const getRecommendedUploadBatchOptions = (
  files: UploadableFile[],
  options: UploadBatchOptions = {},
): UploadBatchOptions => {
  const hasHeavyMedia = files.some(
    (file) => file.type === MediaType.VIDEO || file.type === MediaType.FILE,
  );
  const hasNonImageMedia = files.some((file) => file.type !== MediaType.IMAGE);

  const fallbackConcurrency = hasHeavyMedia
    ? HEAVY_MEDIA_CONCURRENCY
    : DEFAULT_UPLOAD_CONCURRENCY;
  const fallbackChunkSize = hasHeavyMedia
    ? HEAVY_MEDIA_CHUNK_SIZE
    : hasNonImageMedia
      ? MIXED_MEDIA_CHUNK_SIZE
      : DEFAULT_UPLOAD_CHUNK_SIZE;

  const concurrency = clampPositiveInteger(
    options.concurrency,
    fallbackConcurrency,
  );
  const chunkSize = Math.max(
    concurrency,
    clampPositiveInteger(options.chunkSize, fallbackChunkSize),
  );

  return {
    ...options,
    concurrency,
    chunkSize,
  };
};

const mapWithConcurrency = async <TItem, TResult>(
  items: TItem[],
  concurrency: number,
  mapper: (item: TItem, index: number) => Promise<TResult>,
): Promise<TResult[]> => {
  const results = new Array<TResult>(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  };

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(
    Array.from({ length: workerCount }, () => worker()),
  );

  return results;
};

export const uploadFilesInChunks = async (
  uploadFile: (
    file: UploadableFile,
    options?: UploadOptions,
  ) => Promise<UploadResult>,
  files: UploadableFile[],
  options: UploadBatchOptions = {},
): Promise<UploadResult[]> => {
  if (files.length === 0) {
    return [];
  }

  const resolvedOptions = getRecommendedUploadBatchOptions(files, options);
  const { concurrency, chunkSize, onProgress, ...uploadOptions } = resolvedOptions;
  const safeConcurrency = clampPositiveInteger(
    concurrency,
    DEFAULT_UPLOAD_CONCURRENCY,
  );
  const safeChunkSize = Math.max(
    safeConcurrency,
    clampPositiveInteger(chunkSize, DEFAULT_UPLOAD_CHUNK_SIZE),
  );
  const progressByFile = new Array(files.length).fill(0);
  const emitProgress = () => {
    if (!onProgress) {
      return;
    }

    const totalProgress =
      progressByFile.reduce((sum, progress) => sum + progress, 0) / files.length;
    onProgress(totalProgress);
  };
  const results = new Array<UploadResult>(files.length);

  for (
    let chunkStartIndex = 0;
    chunkStartIndex < files.length;
    chunkStartIndex += safeChunkSize
  ) {
    const chunkEntries = files
      .slice(chunkStartIndex, chunkStartIndex + safeChunkSize)
      .map((file, chunkOffset) => ({
        file,
        absoluteIndex: chunkStartIndex + chunkOffset,
      }));

    const chunkResults = await mapWithConcurrency(
      chunkEntries,
      safeConcurrency,
      async ({ file, absoluteIndex }) => {
        const fileOptions: UploadOptions = {
          ...uploadOptions,
          onProgress: onProgress
            ? (progress) => {
                progressByFile[absoluteIndex] = progress;
                emitProgress();
              }
            : undefined,
        };

        const result = await uploadFile(file, fileOptions);
        progressByFile[absoluteIndex] = 100;
        emitProgress();

        return {
          absoluteIndex,
          result,
        };
      },
    );

    for (const { absoluteIndex, result } of chunkResults) {
      results[absoluteIndex] = result;
    }
  }

  return results;
};

export const uploadMediaBatch = async (
  uploadService: IUploadService,
  files: UploadableFile[],
  options: UploadBatchOptions = {},
): Promise<UploadResult[]> => {
  const resolvedOptions = getRecommendedUploadBatchOptions(files, options);

  return uploadService.uploadMultiple(files, resolvedOptions);
};
