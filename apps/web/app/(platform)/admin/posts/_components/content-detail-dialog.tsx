'use client';

import { FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { MediaType, TargetType } from '@/models/social/enums/social.enum';
import { ContentEntryDTO, ContentStatus } from '@/models/social/post/contentEntryDTO';
import { formatDateVN } from '@/utils/user.utils';
import Image from 'next/image';
import { TextCollapse } from '@/components/text-collapse';

const targetLabels: Record<TargetType, { label: string; className: string }> = {
  [TargetType.POST]: {
    label: 'Bài viết',
    className: 'bg-sky-100 text-sky-700',
  },
  [TargetType.SHARE]: {
    label: 'Chia sẻ',
    className: 'bg-indigo-100 text-indigo-700',
  },
  [TargetType.COMMENT]: {
    label: 'Bình luận',
    className: 'bg-emerald-100 text-emerald-700',
  },
};

const statusLabels: Record<ContentStatus, { label: string; className: string }> = {
  [ContentStatus.ACTIVE]: {
    label: 'Đang hiển thị',
    className: 'bg-emerald-100 text-emerald-700',
  },
  [ContentStatus.VIOLATED]: {
    label: 'Vi phạm',
    className: 'bg-rose-100 text-rose-700',
  },
};

type ContentDetailDialogProps = {
  entry: ContentEntryDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContentDetailDialog({
  entry,
  open,
  onOpenChange,
}: ContentDetailDialogProps) {
  if (!entry) return null;

  const typeMeta = targetLabels[entry.type];
  const statusMeta = statusLabels[entry.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*  overflow-hidden + max-h + scroll dọc */}
      <DialogContent className="max-w-[860px] border-sky-100 overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-sky-600">
              Chi tiết nội dung
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Thông tin nhanh về nội dung
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body scroll */}
        <div className="max-h-[75vh] overflow-y-auto px-6 pb-6 pt-4">
          <div className="flex flex-col gap-4">
            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={typeMeta.className}>{typeMeta.label}</Badge>
              <Badge className={statusMeta.className}>{statusMeta.label}</Badge>

              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-700 hover:bg-slate-100"
              >
                #{entry.id}
              </Badge>
            </div>

            {/* Content + medias */}
            <div className="rounded-2xl border border-sky-100 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FileText className="h-4 w-4" />
                Nội dung gốc
              </div>

              <TextCollapse
                text={entry.content}
                maxLength={100}
                className="min-w-0 text-[15px] leading-6 text-neutral-800"
                buttonClassName="mt-1 text-sm"
              />

              {/* Media carousel */}
              {entry.medias?.length ? (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Media đính kèm
                  </div>

                  <Carousel className="w-full">
                    <CarouselContent>
                      {entry.medias.map((media, idx) => {
                        const isVideo = media.type === MediaType.VIDEO;

                        return (
                          <CarouselItem
                            key={media.publicId || `${media.url}-${idx}`}
                            className="basis-full overflow-hidden"
                          >
                            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                              {/* top bar */}
                              <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="font-semibold text-slate-700">
                                  {isVideo ? 'Video' : 'Hình ảnh'}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-50"
                                >
                                  {idx + 1}/{entry.medias?.length}
                                </Badge>
                              </div>

                              {/* preview */}
                              <div className="mt-2 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                                <div className="relative aspect-video w-full bg-slate-50">
                                  {isVideo ? (
                                    <video
                                      src={media.url}
                                      controls
                                      className="h-full w-full bg-black object-contain"
                                    >
                                      <track kind="captions" />
                                    </video>
                                  ) : (
                                    <Image
                                      src={media.url}
                                      alt={`Media ${idx + 1}`}
                                      fill
                                      sizes="(max-width: 860px) 100vw, 860px"
                                      loading="lazy"
                                      className="object-contain"
                                      priority={idx === 0}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        );
                      })}
                    </CarouselContent>

                    <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                  </Carousel>
                </div>
              ) : null}
            </div>

            <Separator />

            {/* Info cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="text-xs font-medium text-slate-500">
                  Loại nội dung
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {typeMeta.label}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="text-xs font-medium text-slate-500">
                  Trạng thái
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {statusMeta.label}
                </div>
              </div>


              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="text-xs font-medium text-slate-500">
                  Ngày tạo
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDateVN(entry.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
