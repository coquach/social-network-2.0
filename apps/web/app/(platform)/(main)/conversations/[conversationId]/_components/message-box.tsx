'use client';

import { MediumAvatar, SmallAvatar } from '@/components/avatar';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatStore, CallType, type MessageDTO } from '@repo/shared';
import { useAuth } from '@clerk/nextjs';
import clsx from 'clsx';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Copy, Download, FileIcon, Info, MoreHorizontal, Music, Pin, Reply, Trash2 } from 'lucide-react';
import { MdCall } from 'react-icons/md';
import { IoMdVideocam } from 'react-icons/io';
import Image from 'next/image';
import { memo, useCallback, useMemo, useState } from 'react';
import { HiForward } from 'react-icons/hi2';
import { toast } from 'sonner';
import { MessageReply } from './message-reply';
import { useImageViewerModal } from '@/store/use-image-viewer-modal';
import { useCallActions } from '@/hooks/use-call-actions';

const formatDuration = (seconds?: number) => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

function CallMessageCard({
  message,
  isOwn,
  onStartCall,
}: {
  message: MessageDTO;
  isOwn: boolean;
  onStartCall: (type: CallType) => void;
}) {
  const meta = (message as any).systemMeta;
  const isVideo = meta?.callType === "video" || meta?.callType === "VIDEO";
  const duration = meta?.durationSec;
  const endedReason = meta?.endedReason;
  const callStatus = meta?.callStatus;

  let statusText = "Cuộc gọi thoại";
  if (isVideo) {
    statusText = "Cuộc gọi video";
  }

  const isMissed = 
    callStatus === "MISSED" || 
    endedReason === "MISSED" || 
    endedReason === "REJECTED";
    
  const isCancelled = callStatus === "CANCELLED" || endedReason === "CANCELLED";

  if (isMissed) {
    statusText = isVideo ? "Cuộc gọi video nhỡ" : "Cuộc gọi nhỡ";
  } else if (isCancelled) {
    statusText = isVideo ? "Cuộc gọi video đã hủy" : "Cuộc gọi thoại đã hủy";
  } else {
    statusText = isVideo ? "Cuộc gọi video đã kết thúc" : "Cuộc gọi thoại đã kết thúc";
  }

  const durationStr = duration && duration > 0 ? formatDuration(duration) : null;

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[200px]">
      <div className="flex-1 justify-center">
        <div className={clsx("text-[14px] font-medium", isOwn ? "text-white" : "text-slate-800")}>
          {statusText}
        </div>
        {durationStr ? (
          <div className={clsx("text-[11px] mt-0.5", isOwn ? "text-white/80" : "text-slate-500")}>
            Thời lượng: {durationStr}
          </div>
        ) : (
          <div className={clsx("text-[11px] mt-0.5 opacity-80", isOwn ? "text-white/70" : "text-slate-500")}>
            {isMissed ? "Nhấn để gọi lại" : "Nhấn để gọi"}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onStartCall(isVideo ? CallType.VIDEO : CallType.AUDIO)}
        className={clsx(
          "h-11 w-11 flex items-center justify-center rounded-2xl transition-colors",
          isOwn ? "bg-white/20 hover:bg-white/30" : "bg-white hover:bg-slate-50"
        )}
      >
        {isVideo ? (
          <IoMdVideocam className={clsx("h-5 w-5", isOwn ? "text-white" : "text-sky-500")} />
        ) : (
          <MdCall className={clsx("h-5 w-5", isOwn ? "text-white" : "text-sky-500")} />
        )}
      </button>
    </div>
  );
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MAX_SEEN_AVATARS = 3;

export const MessageBox = memo(function MessageBox({
  data,
  lastSeenMap,
  isLastMessage,
  onDelete,
}: {
  data: MessageDTO;
  lastSeenMap: Map<string, string>;
  isLastMessage: boolean;
  onDelete: (messageId: string) => void;
}) {
  const { userId } = useAuth();
  const isOwn = data.senderId === userId;

  const container = clsx(
    'flex w-full px-3 py-2 gap-2 items-end',
    isOwn && 'flex-row-reverse'
  );

  const [openAlert, setOpenAlert] = useState(false);
  const { setReplyTo } = useChatStore();
  const { startCall } = useCallActions();

  const handleReply = useCallback(() => setReplyTo(data), [data, setReplyTo]);
  const handleDeleteClick = useCallback(() => setOpenAlert(true), []);

  const handleCopy = useCallback(async () => {
    const text = data.content || '';
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Đã sao chép nội dung tin nhắn');
    } catch (error) {
      toast.error('Không thể sao chép nội dung tin nhắn');
      console.error(error);
    }
  }, [data.content]);

  const seenAvatars = useMemo(() => {
    return Array.from(lastSeenMap.entries())
      .filter(
        ([uid, lastMsgId]) => uid !== data.senderId && lastMsgId === data._id
      )
      .map(([uid]) => uid);
  }, [lastSeenMap, data._id, data.senderId]);

  const seenPreview = useMemo(
    () => seenAvatars.slice(0, MAX_SEEN_AVATARS),
    [seenAvatars]
  );
  const seenOverflow = Math.max(0, seenAvatars.length - MAX_SEEN_AVATARS);

  const sentAgoText = useMemo(() => {
    const created = new Date(data.createdAt);
    return formatDistanceToNowStrict(created, {
      locale: vi,
      addSuffix: true,
    });
  }, [data.createdAt]);

  const sentStatusText = useMemo(() => {
    if (data.clientStatus === 'sending') return 'Đang gửi...';
    const created = new Date(data.createdAt);
    const diffMs = Date.now() - created.getTime();
    if (diffMs >= 60_000) {
      return 'Đã gửi ' + sentAgoText;
    }
    return 'Đã gửi';
  }, [data.clientStatus, data.createdAt, sentAgoText]);

  const showSentStatus =
    isOwn &&
    !data.isDeleted &&
    isLastMessage &&
    (data.clientStatus === 'sending' || seenAvatars.length === 0);

  const sentStatusClass = 'text-xs text-gray-400';

  const timeText = useMemo(() => {
    return format(new Date(data.createdAt), 'p', { locale: vi });
  }, [data.createdAt]);


  const { onOpen: openImageViewer } = useImageViewerModal();
  const attachments = data.attachments ?? [];
  return (
    <div className={clsx(container, 'group')}>
      <MediumAvatar userId={data.senderId} hasBorder />

      <div id={data._id} className="relative flex-1 flex flex-col items-start">
        {!data.isDeleted && (
          <div
            className={clsx(
              'absolute -top-4 flex items-center gap-1 opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto',
              isOwn ? 'right-0' : 'left-0'
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleReply();
              }}
              className="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 shadow-sm border border-gray-200 hover:bg-sky-50"
            >
              <Reply className="h-3.5 w-3.5 text-sky-500" />
            </button>

            {isOwn && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick();
                }}
                className="h-7 w-7 flex items-center justify-center rounded-full bg-white/90 shadow-sm border border-gray-200 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className={clsx(
                    'h-7 w-7 flex items-center justify-center rounded-full border border-gray-200/70',
                    'bg-white/80 backdrop-blur hover:bg-gray-50 hover:border-gray-300',
                    'shadow-sm transition-all'
                  )}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                side="top"
                className="w-44 rounded-xl border border-slate-200/70 bg-white/95 backdrop-blur shadow-lg shadow-slate-900/5 p-1 text-xs"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer"
                  onClick={handleCopy}
                  disabled={!data.content}
                >
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sao chép nội dung</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-2 py-1.5 opacity-60"
                >
                  <HiForward className="h-3.5 w-3.5 text-slate-400" />
                  <span>Chuyển tiếp (soon)</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-2 py-1.5 opacity-60"
                >
                  <Pin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Ghim tin (soon)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  disabled
                  className="flex items-center gap-2 px-2 py-1.5 opacity-70"
                >
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                  <span>Thông tin tin nhắn</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div
          className={clsx(
            'flex flex-col gap-1',
            isOwn ? 'items-end self-end' : 'items-start self-start',
            'max-w-[80%]'
          )}
        >
          <div className="text-[11px] text-gray-400 mt-0.5">{timeText}</div>

          {data.replyTo && <MessageReply replyTo={data.replyTo} />}

          {data.isDeleted ? (
            <div className="italic text-sm text-gray-400">
              Tin nhắn đã bị xoá.
            </div>
          ) : (
            <>
              {attachments.length > 0 && (
                <div
                  className={clsx(
                    'grid gap-1.5',
                    attachments.length === 1
                      ? 'grid-cols-1'
                      : 'grid-cols-2'
                  )}
                >
                  {attachments.map((att, i) => {
                    const isImage = att.mimeType?.startsWith('image');
                    const isVideo = att.mimeType?.startsWith('video');
                    const isAudio = att.mimeType?.startsWith('audio');

                    if (isImage) {
                      return (
                        <div
                          key={`${att.url}-${i}`}
                          className={clsx(
                            'overflow-hidden rounded-lg border bg-black/5',
                            attachments.length === 1
                              ? 'max-w-[360px]'
                              : 'max-w-[220px]'
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => openImageViewer(att.url, att.fileName)}
                            className="block w-full cursor-zoom-in"
                            aria-label="Xem ảnh"
                          >
                            <Image
                              src={att.url}
                              alt={att.fileName || ''}
                              width={360}
                              height={360}
                              loading="lazy"
                              className={clsx(
                                'w-full object-cover',
                                attachments.length === 1 ? 'h-64' : 'h-36'
                              )}
                            />
                          </button>
                        </div>
                      );
                    }

                    if (isVideo) {
                      return (
                        <video
                          key={`${att.url}-${i}`}
                          src={att.url}
                          controls
                          className={clsx(
                            'rounded-lg border bg-black/5 object-cover',
                            attachments.length === 1
                              ? 'h-64 max-w-[360px]'
                              : 'h-36 max-w-[220px]'
                          )}
                        />
                      );
                    }

                    if (isAudio) {
                      return (
                        <div
                          key={`${att.url}-${i}`}
                          className={clsx(
                            'flex items-center gap-2 p-3 rounded-2xl min-w-[240px]',
                            isOwn ? 'bg-sky-500' : 'bg-gray-100'
                          )}
                        >
                          <div className={clsx("h-10 w-10 flex items-center justify-center rounded-full", isOwn ? "bg-white/20 text-white" : "bg-white text-sky-600")}>
                            <Music className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <audio
                              src={att.url}
                              controls
                              className="h-8 w-full accent-sky-500"
                            />
                          </div>
                        </div>
                      );
                    }

                    // Default to file
                    return (
                      <div
                        key={`${att.url}-${i}`}
                        className={clsx(
                          'flex items-center gap-3 p-3 rounded-2xl min-w-[200px] group/file transition-all',
                          isOwn ? 'bg-sky-500' : 'bg-gray-100'
                        )}
                      >
                        <div className={clsx("h-10 w-10 flex items-center justify-center rounded-full transition-colors", isOwn ? "bg-white/20 text-white" : "bg-white text-gray-500 group-hover/file:bg-sky-100 group-hover/file:text-sky-600")}>
                          <FileIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={clsx("text-sm font-medium truncate", isOwn ? "text-white" : "text-gray-900")}>
                            {att.fileName}
                          </div>
                          <div className={clsx("text-[10px]", isOwn ? "text-white/70" : "text-gray-500")}>
                            {formatFileSize(att.size)}
                          </div>
                        </div>
                        <a
                          href={att.url}
                          download={att.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={clsx("h-8 w-8 flex items-center justify-center rounded-full transition-all", isOwn ? "text-white/70 hover:text-white hover:bg-white/20" : "text-gray-400 hover:text-sky-600 hover:bg-white")}
                          title="Tải về"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {(data as any).messageType === 'system_call' && (
                <div
                  className={clsx(
                    'max-w-full rounded-2xl px-3 py-2',
                    isOwn
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <CallMessageCard
                    message={data}
                    isOwn={isOwn}
                    onStartCall={(type) => {
                      startCall(data.conversationId, type);
                    }}
                  />
                </div>
              )}

              {data.content && (data as any).messageType !== 'system_call' && (
                <div
                  className={clsx(
                    'text-sm inline-block overflow-hidden py-2 px-3 whitespace-pre-line break-all',
                    'max-w-full rounded-2xl',
                    isOwn
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  {data.content}
                </div>
              )}
            </>
          )}
        </div>

        {isOwn && !data.isDeleted && (
          <div className="mt-1 self-end flex items-center gap-2">
            {seenAvatars.length > 0 ? (
              <div className="flex items-center gap-1">
                {seenPreview.map((uid) => (
                  <SmallAvatar key={uid} userId={uid} hasBorder />
                ))}
                {seenOverflow > 0 && (
                  <span className="text-[10px] text-gray-500">
                    +{seenOverflow}
                  </span>
                )}
              </div>
            ) : showSentStatus ? (
              <div className={sentStatusClass}>{sentStatusText}</div>
            ) : null}
          </div>
        )}
      </div>

      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600">
              Xác nhận xóa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tin nhắn này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => onDelete(data._id)}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

MessageBox.displayName = 'MessageBox';
