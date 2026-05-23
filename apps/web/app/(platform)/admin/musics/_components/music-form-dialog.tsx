'use client';

import * as React from 'react';
import { Loader2, Wand2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MusicFeatureResponseDTO, MusicGenre } from '@/models/music/musicDTO';
import type { AudioDTO } from '@/models/music/musicDTO';
import type { MediaDTO } from '@repo/shared';

import { MusicPlayer } from './music-player';
import { MusicEmotionVisualizer } from './music-emotion-visualizer';
import { MusicUploadCard } from './music-upload-card';
import {
  musicGenreLabels,
  musicGenreOptions,
  formatMusicDuration,
} from './music-utils';
import { uploadMusicAsset, UploadedMusicAsset } from './music-upload-utils';

export type MusicFormSubmitPayload = {
  title: string;
  artist?: string;
  genre?: MusicGenre;
  valence: number;
  arousal: number;
  audio: AudioDTO;
  coverImage: MediaDTO;
};

type AssetState = {
  remote: UploadedMusicAsset | null;
  fileName: string | null;
  progress: number;
  uploading: boolean;
  duration?: number;
};

type MusicFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  music: MusicFeatureResponseDTO | null;
  saving?: boolean;
  analyzing?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: MusicFormSubmitPayload) => Promise<void>;
  onAnalyze: (
    url: string,
  ) => Promise<{ valence: number; arousal: number } | null>;
};

const emptyAssetState = (): AssetState => ({
  remote: null,
  fileName: null,
  progress: 0,
  uploading: false,
  duration: undefined,
});

export function MusicFormDialog({
  open,
  mode,
  music,
  saving,
  analyzing,
  onOpenChange,
  onSubmit,
  onAnalyze,
}: MusicFormDialogProps) {
  const [title, setTitle] = React.useState('');
  const [artist, setArtist] = React.useState('');
  const [genre, setGenre] = React.useState<MusicGenre | ''>('');
  const [valence, setValence] = React.useState(0.5);
  const [arousal, setArousal] = React.useState(0.5);
  const [audio, setAudio] = React.useState<AssetState>(emptyAssetState);
  const [cover, setCover] = React.useState<AssetState>(emptyAssetState);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const audioAbortRef = React.useRef<AbortController | null>(null);
  const coverAbortRef = React.useRef<AbortController | null>(null);

  const initializeForm = React.useCallback(() => {
    setTitle(music?.title ?? '');
    setArtist(music?.artist ?? '');
    setGenre(music?.genre ?? '');
    setValence(music?.valence ?? 0.5);
    setArousal(music?.arousal ?? 0.5);
    setAudio(
      music
        ? {
            remote: {
              url: music.audio.url,
              publicId: music.audio.publicId ?? '',
              type: 'audio' as any,
              duration: music.audio.duration,
            },
            fileName: music.audio.publicId ?? null,
            progress: 100,
            uploading: false,
            duration: music.audio.duration,
          }
        : emptyAssetState(),
    );
    setCover(
      music
        ? {
            remote: {
              ...music.coverImage,
              publicId: music.coverImage.publicId ?? '',
              type: 'image' as any,
            },
            fileName: music.coverImage.publicId ?? null,
            progress: 100,
            uploading: false,
          }
        : emptyAssetState(),
    );
    setLocalError(null);
  }, [music]);

  React.useEffect(() => {
    if (open) {
      initializeForm();
    }
  }, [initializeForm, open]);

  React.useEffect(
    () => () => {
      audioAbortRef.current?.abort();
      coverAbortRef.current?.abort();
    },
    [],
  );

  const resolveAudio = () => audio.remote;
  const resolveCover = () => cover.remote;

  const uploadAsset = async (target: 'audio' | 'image', file: File) => {
    const controller = new AbortController();

    if (target === 'audio') {
      audioAbortRef.current?.abort();
      audioAbortRef.current = controller;
      setAudio((current) => ({
        ...current,
        uploading: true,
        progress: 0,
        fileName: file.name,
      }));
    } else {
      coverAbortRef.current?.abort();
      coverAbortRef.current = controller;
      setCover((current) => ({
        ...current,
        uploading: true,
        progress: 0,
        fileName: file.name,
      }));
    }

    try {
      const uploaded = await uploadMusicAsset({
        file,
        target,
        folder: target === 'audio' ? 'music/audio' : 'music/covers',
        signal: controller.signal,
        onProgress: (progress) => {
          if (target === 'audio') {
            setAudio((current) => ({ ...current, progress }));
          } else {
            setCover((current) => ({ ...current, progress }));
          }
        },
      });

      if (target === 'audio') {
        setAudio({
          remote: uploaded,
          fileName: file.name,
          progress: 100,
          uploading: false,
          duration: uploaded.duration,
        });
      } else {
        setCover({
          remote: uploaded,
          fileName: file.name,
          progress: 100,
          uploading: false,
        });
      }

      return uploaded;
    } catch (error: any) {
      if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
        toast.error(error?.message ?? 'Upload thất bại');
      }

      if (target === 'audio') {
        setAudio(emptyAssetState());
      } else {
        setCover(emptyAssetState());
      }

      return null;
    } finally {
      if (target === 'audio') {
        setAudio((current) => ({ ...current, uploading: false }));
      } else {
        setCover((current) => ({ ...current, uploading: false }));
      }
    }
  };

  const handleAnalyze = async () => {
    const audioAsset = resolveAudio();

    if (!audioAsset?.url) {
      toast.error('Vui lòng tải lên audio trước khi phân tích');
      return;
    }

    const results = await onAnalyze(audioAsset.url);

    if (results) {
      setValence(results.valence);
      setArousal(results.arousal);
    }
  };

  const handleSubmit = async () => {
    setLocalError(null);

    const audioAsset = resolveAudio();
    const coverAsset = resolveCover();

    if (!title.trim()) {
      setLocalError('Vui lòng nhập tiêu đề bài nhạc');
      return;
    }

    if (!audioAsset) {
      setLocalError('Vui lòng tải lên audio');
      return;
    }

    if (!coverAsset) {
      setLocalError('Vui lòng tải lên cover');
      return;
    }

    const audioPayload: AudioDTO = {
      url: audioAsset.url,
      publicId: audioAsset.publicId,
      duration: audioAsset.duration,
    };

    await onSubmit({
      title: title.trim(),
      artist: artist.trim() || undefined,
      genre: genre || undefined,
      valence,
      arousal,
      audio: audioPayload,
      coverImage: coverAsset,
    });
  };

  const titlePrefix = mode === 'create' ? 'Thêm nhạc' : 'Chỉnh sửa nhạc';
  const coverUrl = cover.remote?.url ?? music?.coverImage.url ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        onPointerDownOutside={(event) => {
          event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          event.preventDefault();
        }}
        className="!h-[100dvh] !w-screen !max-w-none p-0 sm:!w-[760px] [&>button]:hidden"
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white dark:bg-slate-950">
          <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
            <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={title || 'Cover preview'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      Cover
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    {title || titlePrefix}
                  </div>
                  <div className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {artist || 'Unknown artist'}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {mode === 'create' ? 'Create mode' : 'Edit mode'}
                    </Badge>
                    <Badge className="rounded-full border-0 bg-sky-50 px-2.5 py-1 text-[11px] text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      {audio.remote ? 'Audio ready' : 'Audio pending'}
                    </Badge>
                    <Badge className="rounded-full border-0 bg-violet-50 px-2.5 py-1 text-[11px] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      {cover.remote ? 'Cover ready' : 'Cover pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                >
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Thông tin cơ bản
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Các thông tin cơ bản về bài nhạc.
                </p>

                <Separator className="my-4 bg-slate-200/80 dark:bg-slate-800" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Tên bài nhạc
                    </div>
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Tên bài nhạc"
                      className="h-11 rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Tên nghệ sĩ
                    </div>
                    <Input
                      value={artist}
                      onChange={(event) => setArtist(event.target.value)}
                      placeholder="Tên nghệ sĩ"
                      className="h-11 rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Thể loại
                    </div>
                    <Select
                      value={genre || undefined}
                      onValueChange={(value) => setGenre(value as MusicGenre)}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                        <SelectValue placeholder="Chọn thể loại" />
                      </SelectTrigger>
                      <SelectContent>
                        {musicGenreOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Tải nhạc lên
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Chọn file âm thanh để lấy thời lượng và phân tích cảm xúc.
                </p>

                <div className="mt-4">
                  <MusicUploadCard
                    type="audio"
                    title="Audio file"
                    description="Kéo thả hoặc chọn file audio. Sau khi upload xong bạn có thể phân tích valence/arousal."
                    accept="audio/*"
                    previewUrl={audio.remote?.url ?? undefined}
                    fileName={audio.fileName ?? undefined}
                    meta={
                      audio.duration
                        ? formatMusicDuration(audio.duration)
                        : undefined
                    }
                    progress={audio.progress}
                    uploading={audio.uploading}
                    onFileSelect={(file) => void uploadAsset('audio', file)}
                    onRemove={() => {
                      audioAbortRef.current?.abort();
                      if (mode === 'edit' && music) {
                        setAudio({
                          remote: {
                            url: music.audio.url,
                            publicId: music.audio.publicId ?? '',
                            type: 'audio' as any,
                            duration: music.audio.duration,
                          },
                          fileName: music.audio.publicId ?? null,
                          progress: 100,
                          uploading: false,
                          duration: music.audio.duration,
                        });
                      } else {
                        setAudio(emptyAssetState());
                      }
                    }}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Tải lên ảnh nền
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Ảnh nền sẽ hiển thị trong danh sách, xem trước và tiêu đề.
                </p>

                <div className="mt-4">
                  <MusicUploadCard
                    type="image"
                    title="Cover image"
                    description="Chọn ảnh bìa để hiển thị trong dashboard và preview."
                    accept="image/*"
                    previewUrl={cover.remote?.url ?? undefined}
                    fileName={cover.fileName ?? undefined}
                    progress={cover.progress}
                    uploading={cover.uploading}
                    onFileSelect={(file) => void uploadAsset('image', file)}
                    onRemove={() => {
                      coverAbortRef.current?.abort();
                      if (mode === 'edit' && music) {
                        setCover({
                          remote: {
                            ...music.coverImage,
                            publicId: music.coverImage.publicId ?? '',
                            type: 'image' as any,
                          },
                          fileName: music.coverImage.publicId ?? null,
                          progress: 100,
                          uploading: false,
                        });
                      } else {
                        setCover(emptyAssetState());
                      }
                    }}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Phân tích Valence/Arousal
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Tự động điền valence/arousal từ audio đã upload.
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Trang thái phân tích
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {audio.remote ? 'Đã tải lên' : 'Chưa có audio'}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Quá trình có thể mất vài phút tuỳ thuộc độ dài của audio.
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => void handleAnalyze()}
                    disabled={analyzing || audio.uploading || !audio.remote}
                    className="h-10 rounded-xl bg-sky-600 px-4 shadow-sm hover:bg-sky-700"
                  >
                    {analyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    {analyzing ? 'Đang phân tích...' : 'Phân tích'}
                  </Button>
                </div>
              </section>

              <section>
                <MusicEmotionVisualizer
                  valence={valence}
                  arousal={arousal}
                  onValenceChange={setValence}
                  onArousalChange={setArousal}
                  analyzing={analyzing}
                  className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/50"
                />
              </section>

              {localError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
                  {localError}
                </div>
              ) : null}
            </div>
          </ScrollArea>

          <SheetFooter className="sticky bottom-0 z-20 flex-row items-center justify-end gap-3 border-t border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950"
              >
                Đóng
              </Button>
            </SheetClose>

            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={
                saving || audio.uploading || cover.uploading || analyzing
              }
              className="h-10 rounded-xl bg-sky-600 px-5 shadow-sm hover:bg-sky-700"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
