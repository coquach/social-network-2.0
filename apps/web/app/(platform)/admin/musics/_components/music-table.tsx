'use client';

import * as React from 'react';
import {
  ChevronDown,
  Eye,
  MoreVertical,
  PencilLine,
  Pause,
  Play,
  Volume2,
  Trash2,
} from 'lucide-react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AdminPagination } from '../../_components/pagination';
import { MusicFeatureResponseDTO } from '@/models/music/musicDTO';

import {
  formatMusicDate,
  formatMusicDuration,
  getEmotionLabel,
  musicGenreLabels,
} from './music-utils';

export type MusicPlaybackState = {
  activeMusicId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onToggle: (music: MusicFeatureResponseDTO) => void;
  onSeek: (time: number) => void;
};

type MusicTableProps = {
  rows: MusicFeatureResponseDTO[];
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  playback: MusicPlaybackState;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onPreview: (music: MusicFeatureResponseDTO) => void;
  onEdit: (music: MusicFeatureResponseDTO) => void;
  onDelete: (music: MusicFeatureResponseDTO) => void;
};

const getProgressValue = (
  playback: MusicPlaybackState,
  music: MusicFeatureResponseDTO,
) => {
  const isActive = playback.activeMusicId === music.id;

  return isActive && playback.duration > 0
    ? Math.min(
        100,
        Math.round((playback.currentTime / playback.duration) * 100),
      )
    : 0;
};

const getMusicColumnWidthClassName = (columnId: string) => {
  switch (columnId) {
    case 'music':
      return 'w-[52%]';
    case 'valence':
      return 'w-[16%]';
    case 'arousal':
      return 'w-[16%]';
    case 'duration':
      return 'w-[7%]';
    case 'createdAt':
      return 'w-[9%]';
    default:
      return 'w-12';
  }
};

function MusicMetricColumn({
  label,
  value,
  hint,
  barClassName,
  className,
}: {
  label: string;
  value: number;
  hint: string;
  barClassName: string;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className ?? 'w-36')}>
      <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.16em] text-slate-400">
        <span>{label}</span>
        <span className="tabular-nums font-medium text-slate-600 dark:text-slate-300">
          {value}%
        </span>
      </div>

      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn('h-full rounded-full', barClassName)}
          style={{ width: `${value}%` }}
        />
      </div>

      <div className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
        {hint}
      </div>
    </div>
  );
}

function MusicItemContent({
  music,
  playback,
}: {
  music: MusicFeatureResponseDTO;
  playback: MusicPlaybackState;
}) {
  const isActive = playback.activeMusicId === music.id;
  const progress = getProgressValue(playback, music);
  const seekable = isActive && playback.duration > 0;
  const currentTime = isActive ? playback.currentTime : 0;
  const currentProgress = seekable ? Math.min(100, Math.max(0, progress)) : 0;
  const valence = Math.round(music.valence * 100);
  const arousal = Math.round(music.arousal * 100);

  const handleSeek = (time: number) => {
    if (!seekable) return;

    playback.onSeek(time);
  };

  return (
    <div className="flex min-w-0 items-center gap-4">
      <button
        type="button"
        onClick={() => playback.onToggle(music)}
        className="relative h-25 w-25 shrink-0 overflow-hidden rounded-2xl ring-1 ring-slate-200/70 transition-shadow duration-200 hover:shadow-sm dark:ring-slate-800"
        aria-label={isActive && playback.isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={music.coverImage.url}
          alt={music.title}
          className="h-full w-full object-cover"
        />

        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/15 transition-opacity duration-200',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        />

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
            isActive
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-950/90 dark:ring-slate-800">
            {isActive && playback.isPlaying ? (
              <Pause className="h-4 w-4 text-sky-600" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 text-sky-600" />
            )}
          </div>
        </div>
      </button>

      <div className="min-w-0 flex-1">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {music.title}
          </h3>

          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {music.artist || 'Vô danh'}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {music.genre ? (
            <Badge className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {musicGenreLabels[music.genre]}
            </Badge>
          ) : null}

          <Badge className="rounded-full border-0 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700/90 dark:bg-emerald-950/40 dark:text-emerald-300">
            {valence}% valence
          </Badge>

          <Badge className="rounded-full border-0 bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-violet-700/90 dark:bg-violet-950/40 dark:text-violet-300">
            {arousal}% arousal
          </Badge>
        </div>

        <div className="mt-2 space-y-1">
          <div className="rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex h-4 w-4 items-end justify-center gap-0.5 text-sky-500/80">
                <span className="h-2 w-0.5 rounded-full bg-current" />
                <span className="h-3 w-0.5 rounded-full bg-current" />
                <span className="h-1.5 w-0.5 rounded-full bg-current" />
              </div>

              <span className="w-10 tabular-nums text-slate-500 dark:text-slate-400">
                {formatMusicDuration(currentTime)}
              </span>

              <div className="relative min-w-0 flex-1 py-2">
                <Progress
                  value={progress}
                  className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800"
                />

                <div
                  className={cn(
                    'pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/30 bg-white shadow-sm shadow-sky-500/15 ring-2 ring-sky-500/20 transition-opacity dark:bg-slate-950',
                    seekable ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{ left: `${currentProgress}%` }}
                />

                {seekable ? (
                  <input
                    aria-label={`Seek ${music.title}`}
                    type="range"
                    min={0}
                    max={playback.duration}
                    step="0.1"
                    value={currentTime}
                    onChange={(event) => handleSeek(Number(event.target.value))}
                    className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
                  />
                ) : null}
              </div>

              <span className="w-10 text-right tabular-nums text-slate-500 dark:text-slate-400">
                {formatMusicDuration(music.audio.duration)}
              </span>

              <Volume2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const musicColumns = (playback: MusicPlaybackState) => [
  {
    id: 'music',
    header: 'Nhạc',
    cell: ({ row }: { row: { original: MusicFeatureResponseDTO } }) => (
      <MusicItemContent music={row.original} playback={playback} />
    ),
  },
  {
    id: 'valence',
    header: 'Valence',
    cell: ({ row }: { row: { original: MusicFeatureResponseDTO } }) => {
      const value = Math.round(row.original.valence * 100);
      return (
        <MusicMetricColumn
          className="w-36"
          label="Valence"
          value={value}
          hint={getEmotionLabel(row.original.valence, row.original.arousal)}
          barClassName="bg-linear-to-r from-sky-400 to-cyan-500"
        />
      );
    },
  },
  {
    id: 'arousal',
    header: 'Arousal',
    cell: ({ row }: { row: { original: MusicFeatureResponseDTO } }) => {
      const value = Math.round(row.original.arousal * 100);
      return (
        <MusicMetricColumn
          className="w-36"
          label="Arousal"
          value={value}
          hint="Mood"
          barClassName="bg-linear-to-r from-violet-400 to-indigo-500"
        />
      );
    },
  },
  {
    id: 'duration',
    header: 'Thời lượng',
    cell: ({ row }: { row: { original: MusicFeatureResponseDTO } }) => (
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {formatMusicDuration(row.original.audio.duration)}
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Ngày tạo',
    cell: ({ row }: { row: { original: MusicFeatureResponseDTO } }) => (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {formatMusicDate(row.original.createdAt)}
      </div>
    ),
  },
];

function MusicRowActions({
  music,
  onPreview,
  onEdit,
  onDelete,
  alwaysVisible = false,
}: {
  music: MusicFeatureResponseDTO;
  onPreview: (music: MusicFeatureResponseDTO) => void;
  onEdit: (music: MusicFeatureResponseDTO) => void;
  onDelete: (music: MusicFeatureResponseDTO) => void;
  alwaysVisible?: boolean;
}) {
  return (
    <div
      className={cn(
        'shrink-0 transition-opacity duration-150',
        alwaysVisible
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border-0 bg-transparent shadow-none hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
            aria-label="Thao tác"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-40 rounded-2xl border-slate-200/70 bg-white/95 p-1 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
        >
          <DropdownMenuItem
            onSelect={() => onPreview(music)}
            className="rounded-xl px-3 py-2.5 text-sm"
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem trước
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onEdit(music)}
            className="rounded-xl px-3 py-2.5 text-sm"
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onDelete(music)}
            className="rounded-xl px-3 py-2.5 text-sm text-rose-600 focus:text-rose-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MusicMobileRow({
  music,
  playback,
  onPreview,
  onEdit,
  onDelete,
}: {
  music: MusicFeatureResponseDTO;
  playback: MusicPlaybackState;
  onPreview: (music: MusicFeatureResponseDTO) => void;
  onEdit: (music: MusicFeatureResponseDTO) => void;
  onDelete: (music: MusicFeatureResponseDTO) => void;
}) {
  const isActive = playback.activeMusicId === music.id;

  return (
    <div
      className={cn(
        'group rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition-colors duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:bg-slate-900/40',
        isActive &&
          'bg-sky-50/60 ring-1 ring-inset ring-sky-200/80 shadow-[0_1px_0_rgba(56,189,248,0.08)] dark:bg-sky-950/20 dark:ring-sky-900/50',
      )}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <MusicItemContent music={music} playback={playback} />
        </div>
        <MusicRowActions
          music={music}
          onPreview={onPreview}
          onEdit={onEdit}
          onDelete={onDelete}
          alwaysVisible
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MusicMetricColumn
          className="w-full"
          label="Valence"
          value={Math.round(music.valence * 100)}
          hint={getEmotionLabel(music.valence, music.arousal)}
          barClassName="bg-linear-to-r from-sky-400 to-cyan-500"
        />
        <MusicMetricColumn
          className="w-full"
          label="Arousal"
          value={Math.round(music.arousal * 100)}
          hint="Mood"
          barClassName="bg-linear-to-r from-violet-400 to-indigo-500"
        />
      </div>
    </div>
  );
}

export function MusicTable({
  rows,
  page,
  pageSize,
  total,
  loading,
  playback,
  onPageChange,
  onCreate,
  onPreview,
  onEdit,
  onDelete,
}: MusicTableProps) {
  const columns = React.useMemo(() => musicColumns(playback), [playback]);

  const table = useReactTable({
    data: rows,
    columns: columns as ColumnDef<MusicFeatureResponseDTO>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <Table className="min-w-[1100px] table-fixed">
          <TableHeader className="bg-sky-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-[15px] font-medium text-slate-700',
                      getMusicColumnWidthClassName(header.id),
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
                <TableHead className="w-12" />
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={6} className="py-4 align-middle">
                    <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,0.9fr)_56px] items-center gap-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-2xl" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-4 w-52 rounded-full" />
                          <Skeleton className="h-3 w-28 rounded-full" />
                          <div className="flex gap-2 pt-1">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                        <Skeleton className="h-3 w-20 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                        <Skeleton className="h-3 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-12 rounded-full" />
                      <Skeleton className="h-4 w-28 rounded-full" />
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    'group h-24 border-slate-200/70 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40',
                    playback.activeMusicId === row.original.id &&
                      'bg-sky-50/60 ring-1 ring-inset ring-sky-200/80 shadow-[inset_0_1px_0_rgba(56,189,248,0.08)] dark:bg-sky-950/20 dark:ring-sky-900/50',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-4 align-middle',
                        getMusicColumnWidthClassName(cell.column.id),
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="w-20 py-4 align-middle pr-4">
                    <MusicRowActions
                      music={row.original}
                      onPreview={onPreview}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-16">
                  <MusicEmptyState onCreate={onCreate} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Skeleton className="h-14 rounded-2xl" />
                <Skeleton className="h-14 rounded-2xl" />
              </div>
            </div>
          ))
        ) : rows.length > 0 ? (
          rows.map((music) => (
            <MusicMobileRow
              key={music.id}
              music={music}
              playback={playback}
              onPreview={onPreview}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <MusicEmptyState onCreate={onCreate} />
        )}
      </div>

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        entityLabel="bản nhạc"
      />
    </div>
  );
}

export function MusicEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
        <ChevronDown className="h-6 w-6 rotate-180" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Chưa có bản nhạc nào
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Tạo bản nhạc đầu tiên để quản lý audio, cover, cảm xúc và danh mục tại
        một nơi.
      </p>
      <Button
        type="button"
        onClick={onCreate}
        className="mt-5 rounded-xl bg-sky-600 px-5 shadow-sm hover:bg-sky-700"
      >
        <PencilLine className="h-4 w-4" />
        Thêm nhạc đầu tiên
      </Button>
    </div>
  );
}

export function MusicTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60 lg:block">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,0.9fr)_56px] items-center gap-4 py-3"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-52 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-14 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
