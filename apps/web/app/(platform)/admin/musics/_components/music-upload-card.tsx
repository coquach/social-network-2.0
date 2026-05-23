'use client';

import * as React from 'react';
import { Image, Music2, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

type MusicUploadCardProps = {
  type: 'audio' | 'image';
  title: string;
  description: string;
  accept: string;
  previewUrl?: string;
  fileName?: string;
  meta?: string;
  progress?: number;
  uploading?: boolean;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  className?: string;
};

const iconByType = {
  audio: Music2,
  image: Image,
};

export function MusicUploadCard({
  type,
  title,
  description,
  accept,
  previewUrl,
  fileName,
  meta,
  progress = 0,
  uploading,
  disabled,
  onFileSelect,
  onRemove,
  className,
}: MusicUploadCardProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const isBusy = Boolean(disabled || uploading);

  const Icon = iconByType[type];

  const openPicker = () => {
    if (isBusy) return;
    inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    onFileSelect(files[0]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/40',
        dragActive &&
          'border-sky-300 bg-sky-50/70 dark:border-sky-700 dark:bg-sky-950/25',
        isBusy && 'cursor-not-allowed opacity-80',
        className,
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isBusy) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        if (isBusy) return;

        handleFiles(event.dataTransfer.files);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      }}
      onClick={openPicker}
      aria-disabled={isBusy}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(event) => handleFiles(event.target.files)}
        disabled={isBusy}
      />

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-sky-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-sky-300 dark:ring-slate-800">
          {uploading ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-sky-200/80 border-t-sky-600 animate-spin dark:border-sky-900/60 dark:border-t-sky-300" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>

            {previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
                className="h-8 w-8 rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                aria-label="Xóa file"
                disabled={isBusy}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-3">
            {previewUrl ? (
              <div onClick={(event) => event.stopPropagation()}>
                {type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt={fileName || title}
                    className="h-48 w-full rounded-2xl object-cover ring-1 ring-slate-200/70 dark:ring-slate-800"
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <audio src={previewUrl} controls className="w-full" />
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {fileName ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                  {fileName}
                </span>
              ) : null}
              {meta ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">
                  {meta}
                </span>
              ) : null}
              {uploading ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                  <span className="h-3 w-3 rounded-full border border-sky-300 border-t-sky-700 animate-spin dark:border-sky-900/60 dark:border-t-sky-300" />
                  Đang tải...
                </span>
              ) : null}
            </div>

            {uploading ? (
              <Progress
                value={progress}
                className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"
              />
            ) : !previewUrl ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Upload className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Kéo thả file vào đây hoặc bấm để chọn
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {accept}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
