'use client';

import * as React from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MusicFeatureResponseDTO, MusicGenre } from '@/models/music/musicDTO';
import { MusicQuery } from '@/lib/actions/admin/admin-music';
import {
  useAdminMusic,
  useAdminMusicList,
  useAnalyzeMusic,
  useCreateAdminMusic,
  useDeleteAdminMusic,
  useUpdateAdminMusic,
} from '@/hooks/use-admin-music';

import {
  MusicFormDialog,
  MusicFormSubmitPayload,
} from './_components/music-form-dialog';
import { MusicPreviewDialog } from './_components/music-preview-dialog';
import { MusicTable, MusicPlaybackState } from './_components/music-table';
import { MusicToolbar } from './_components/music-toolbar';

const PAGE_SIZE = 10;

type PlaybackState = {
  activeMusicId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
};

export default function AdminMusicsPage() {
  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [genre, setGenre] = React.useState<MusicGenre | 'all'>('all');
  const [formOpen, setFormOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [editingMusicId, setEditingMusicId] = React.useState<string | null>(
    null,
  );
  const [previewMusicId, setPreviewMusicId] = React.useState<string | null>(
    null,
  );
  const [editingSnapshot, setEditingSnapshot] =
    React.useState<MusicFeatureResponseDTO | null>(null);
  const [previewSnapshot, setPreviewSnapshot] =
    React.useState<MusicFeatureResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<MusicFeatureResponseDTO | null>(null);
  const [playbackState, setPlaybackState] = React.useState<PlaybackState>({
    activeMusicId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const playbackStateRef = React.useRef(playbackState);

  React.useEffect(() => {
    playbackStateRef.current = playbackState;
  }, [playbackState]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, 350);

  const query = React.useMemo<MusicQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      genre: genre === 'all' ? undefined : genre,
    }),
    [page, search, genre],
  );

  const listQuery = useAdminMusicList(query);
  const editingQuery = useAdminMusic(editingMusicId ?? undefined);
  const previewQuery = useAdminMusic(previewMusicId ?? undefined);
  const createMutation = useCreateAdminMusic();
  const updateMutation = useUpdateAdminMusic();
  const deleteMutation = useDeleteAdminMusic();
  const analyzeMutation = useAnalyzeMusic();

  const rows = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const editingMusic = editingQuery.data ?? editingSnapshot;
  const previewMusic = previewQuery.data ?? previewSnapshot;

  React.useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const syncPlayback = () => {
      setPlaybackState((current) => ({
        ...current,
        isPlaying: !audio.paused,
        currentTime: audio.currentTime,
        duration: Number.isFinite(audio.duration)
          ? audio.duration
          : current.duration,
      }));
    };

    const handleEnded = () => {
      setPlaybackState((current) => ({
        ...current,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    audio.addEventListener('timeupdate', syncPlayback);
    audio.addEventListener('loadedmetadata', syncPlayback);
    audio.addEventListener('play', syncPlayback);
    audio.addEventListener('pause', syncPlayback);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', syncPlayback);
      audio.removeEventListener('loadedmetadata', syncPlayback);
      audio.removeEventListener('play', syncPlayback);
      audio.removeEventListener('pause', syncPlayback);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playMusic = React.useCallback(
    async (music: MusicFeatureResponseDTO) => {
      const audio = audioRef.current;

      if (!audio) return;

      if (playbackStateRef.current.activeMusicId === music.id) {
        if (audio.paused) {
          await audio.play();
        } else {
          audio.pause();
        }
        return;
      }

      audio.pause();
      audio.src = music.audio.url;
      audio.currentTime = 0;
      audio.load();

      setPlaybackState({
        activeMusicId: music.id,
        isPlaying: true,
        currentTime: 0,
        duration: music.audio.duration ?? 0,
      });

      try {
        await audio.play();
      } catch {
        setPlaybackState((current) => ({ ...current, isPlaying: false }));
      }
    },
    [playbackState.activeMusicId],
  );

  const seekMusic = React.useCallback((time: number) => {
    const audio = audioRef.current;

    if (!audio) return;

    const currentPlayback = playbackStateRef.current;

    if (!currentPlayback.activeMusicId) return;

    const duration = Number.isFinite(audio.duration)
      ? audio.duration
      : currentPlayback.duration;

    if (!duration || duration <= 0) return;

    const nextTime = Math.max(0, Math.min(duration, time));

    audio.currentTime = nextTime;

    setPlaybackState((current) => ({
      ...current,
      currentTime: nextTime,
      duration: Number.isFinite(audio.duration)
        ? audio.duration
        : current.duration,
    }));
  }, []);

  const playback: MusicPlaybackState = React.useMemo(
    () => ({
      ...playbackState,
      onToggle: playMusic,
      onSeek: seekMusic,
    }),
    [playMusic, playbackState, seekMusic],
  );

  const handleRefresh = async () => {
    await listQuery.refetch();
    toast.success('Đã làm mới danh sách nhạc');
  };

  const openCreate = () => {
    setEditingMusicId(null);
    setEditingSnapshot(null);
    setFormOpen(true);
  };

  const openEdit = (music: MusicFeatureResponseDTO) => {
    setPreviewOpen(false);
    setPreviewMusicId(null);
    setPreviewSnapshot(null);
    setEditingMusicId(music.id);
    setEditingSnapshot(music);
    setFormOpen(true);
  };

  const openPreview = (music: MusicFeatureResponseDTO) => {
    setPreviewMusicId(music.id);
    setPreviewSnapshot(music);
    setPreviewOpen(true);
  };

  const handleSubmitMusic = async (payload: MusicFormSubmitPayload) => {
    if (editingMusic) {
      await updateMutation.mutateAsync({
        id: editingMusic.id,
        payload: payload as unknown as Parameters<
          typeof updateMutation.mutateAsync
        >[0]['payload'],
      });
    } else {
      await createMutation.mutateAsync(payload as never);
    }

    setFormOpen(false);
    setEditingMusicId(null);
    setEditingSnapshot(null);
  };

  const handleAnalyze = async (url: string) => {
    try {
      const response = await analyzeMutation.mutateAsync({ url });
      return response.result;
    } catch {
      return null;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const toolbarValue = React.useMemo(
    () => ({
      search: searchInput,
      genre,
    }),
    [genre, searchInput],
  );

  return (
    <div className="space-y-5">
      <audio ref={audioRef} preload="metadata" className="hidden" />

      <div className="rounded-[28px] border border-slate-200/80 bg-linear-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm dark:border-slate-800 dark:from-sky-950/30 dark:via-slate-950 dark:to-cyan-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Quản lý nhạc
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Quản lý thư viện nhạc nền cho các bài đăng của người dùng. Bạn có
              thể thêm, sửa, xóa và phân tích cảm xúc của các bản nhạc để cải
              thiện trải nghiệm người dùng trên nền tảng.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreate}
            className="h-11 rounded-xl bg-sky-600 px-5 shadow-sm hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Thêm nhạc
          </Button>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/50">
        <MusicToolbar
          search={toolbarValue.search}
          genre={toolbarValue.genre}
          total={total}
          refreshing={listQuery.isFetching}
          onSearchChange={(value) => {
            setSearchInput(value);
            debouncedSearch(value);
          }}
          onGenreChange={(value) => {
            setGenre(value);
            setPage(1);
          }}
          onRefresh={() => void handleRefresh()}
        />

        <div className="mt-4">
          <MusicTable
            rows={rows}
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            loading={listQuery.isLoading}
            playback={playback}
            onPageChange={setPage}
            onCreate={openCreate}
            onPreview={openPreview}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      <MusicFormDialog
        open={formOpen}
        mode={editingMusic ? 'edit' : 'create'}
        music={editingMusic}
        saving={createMutation.isPending || updateMutation.isPending}
        analyzing={analyzeMutation.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingMusicId(null);
            setEditingSnapshot(null);
          }
        }}
        onSubmit={handleSubmitMusic}
        onAnalyze={handleAnalyze}
      />

      <MusicPreviewDialog
        music={previewMusic}
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewMusicId(null);
            setPreviewSnapshot(null);
          }
        }}
        playback={playback}
        onEdit={openEdit}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bản nhạc này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa nhạc khỏi thư viện admin và không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Xóa nhạc
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
