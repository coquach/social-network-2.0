'use client';
import { EmojiButton } from '@/components/emoji-button';
import { Button } from '@/components/ui/button';
import { useConversationNav } from '@/hooks/use-conversation-nav';
import { MediaItem } from '@/lib/types/media';
import { useChatStore, MediaType, MessageDTO, useSendMessage } from '@repo/shared';
import clsx from 'clsx';
import { FileIcon, Mic, Music, SendHorizonal, Square, X } from 'lucide-react';
import Image from 'next/image';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { MdOutlineAttachFile } from 'react-icons/md';
import { toast } from 'sonner';
import { MessageReply } from './message-reply';

const MAX_MEDIA = 5;

export const FormInput = () => {
  const { conversationId } = useConversationNav();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previews, setPreviews] = useState<
    { file: File; type: MediaType; preview: string }[]
  >([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const previewMapRef = useRef<Map<File, string>>(new Map());

  const { replyTo, setReplyTo } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const allFilesInputRef = useRef<HTMLInputElement | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const file = new File(
          [audioBlob],
          `voice-note-${Date.now()}.webm`,
          { type: 'audio/webm' }
        );
        handleFiles({
          length: 1,
          item: () => file,
          0: file,
        } as unknown as FileList);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Không thể truy cập micro. Vui lòng kiểm tra lại quyền.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ---- hook gửi tin nhắn (REST) ----
  const { mutateAsync: sendMessageMutate, isPending } = useSendMessage(conversationId);

  // --- AUTO RESIZE TEXTAREA ---
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 160; // 10rem
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, []);

  useEffect(() => {
    setContent('');
    setMedia([]);
    setReplyTo(null);
    previewMapRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewMapRef.current.clear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [conversationId, setReplyTo]);

  // preview media
  useEffect(() => {
    const map = previewMapRef.current;
    const nextFiles = new Set(media.map((m) => m.file));

    map.forEach((url, file) => {
      if (!nextFiles.has(file)) {
        URL.revokeObjectURL(url);
        map.delete(file);
      }
    });

    const nextPreviews = media.map((item) => {
      const existing = map.get(item.file);
      if (existing) return { ...item, preview: existing };
      const preview = URL.createObjectURL(item.file);
      map.set(item.file, preview);
      return { ...item, preview };
    });

    setPreviews(nextPreviews);
  }, [media]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const mapped: MediaItem[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        mapped.push({ file, type: MediaType.IMAGE });
      } else if (file.type.startsWith('video/')) {
        mapped.push({ file, type: MediaType.VIDEO });
      } else if (file.type.startsWith('audio/')) {
        mapped.push({ file, type: MediaType.AUDIO });
      } else {
        mapped.push({ file, type: MediaType.FILE });
      }
    }

    setMedia((prev) => {
      const total = prev.length + mapped.length;
      if (total > MAX_MEDIA) {
        toast.error(`Bạn không thể tải nhiều hơn ${MAX_MEDIA} tệp.`);
        return prev;
      }
      return [...prev, ...mapped];
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (allFilesInputRef.current) {
      allFilesInputRef.current.value = '';
    }
  }, []);

  const handleSend = async () => {
    if (!conversationId) return;
    if (isPending) return;
    if (!content.trim() && media.length === 0) return;

    await sendMessageMutate({
      conversationId,
      content: content.trim(),
      replyTo: replyTo?._id,
      uploadFiles: media.map((m) => ({
        file: m.file,
        type: m.type,
      })),
    });

    setContent('');
    setMedia([]);
    setReplyTo(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (
        !isPending &&
        conversationId &&
        (content.trim() || media.length > 0)
      ) {
        void handleSend();
      }
    }
  };

  const handleRemoveMediaAt = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const isDisabled =
    !conversationId || (!content.trim() && media.length === 0) || isPending;

 


  return (
    <div className="p-4 bg-white/80 backdrop-blur border-t flex flex-col gap-3 w-full transition-all">
      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-2 bg-rose-50 border border-rose-200 rounded-2xl animate-pulse">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span className="text-sm font-medium text-rose-700 flex-1">
            Đang ghi âm: {formatTime(recordingTime)}
          </span>
          <Button
            variant="ghost"
            onClick={stopRecording}
            className="h-8 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100 rounded-full"
          >
            Dừng & Lưu
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2 w-full">
        {/* Emoji + Buttons bên trái */}
        <div className="flex items-end gap-2 relative pb-0.5">
          <EmojiButton
            disabled={!conversationId || isPending || isRecording}
            onPick={(emoji) => {
              setContent((prev) => {
                const next = prev + emoji;
                if (textareaRef.current) autoResize(textareaRef.current);
                return next;
              });
            }}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              disabled={isRecording}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-300 bg-white shadow-sm hover:bg-neutral-100 transition"
              title="Gửi ảnh hoặc video"
            >
              <MdOutlineAttachFile className="h-4 w-4 text-sky-300" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              hidden
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />

            <Button
              variant="ghost"
              disabled={isRecording}
              onClick={() => allFilesInputRef.current?.click()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-300 bg-white shadow-sm hover:bg-neutral-100 transition"
              title="Gửi tệp"
            >
              <FileIcon className="h-4 w-4 text-emerald-500" />
            </Button>
            <input
              ref={allFilesInputRef}
              type="file"
              hidden
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />

            <Button
              variant="ghost"
              onClick={isRecording ? stopRecording : startRecording}
              className={clsx(
                'inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all',
                isRecording
                  ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white border-rose-300 text-rose-500 hover:bg-neutral-100'
              )}
              title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
            >
              {isRecording ? (
                <Square className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Textarea + preview */}
        <div className="flex-1 flex flex-col gap-2">
          {replyTo && (
            <div className="flex items-center gap-2">
              <MessageReply replyTo={replyTo as MessageDTO} />
              <button
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-gray-200 hover:bg-neutral-400 rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            id="message"
            rows={1}
            autoComplete="message"
            placeholder={isRecording ? 'Đang ghi âm...' : 'Nhập tin nhắn...'}
            value={content}
            disabled={isRecording}
            onChange={(e) => {
              setContent(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={handleKeyDown}
            className="overflow-hidden max-h-40 text-black font-light px-4 py-2 border bg-neutral-100 w-full rounded-lg focus:outline-none resize-none disabled:opacity-50"
          />

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-xl bg-neutral-50 px-2 py-2 border border-dashed border-gray-200">
              {previews.map((item, i) => (
                <div
                  key={`${item.preview}-${i}`}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-200 bg-black/5"
                >
                  {item.type === MediaType.IMAGE ? (
                    <Image
                      src={item.preview}
                      alt=""
                      height={80}
                      width={80}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : item.type === MediaType.VIDEO ? (
                    <video
                      src={item.preview}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : item.type === MediaType.AUDIO ? (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-sky-50 gap-1 p-1">
                      <Music className="h-6 w-6 text-sky-500" />
                      <span className="text-[10px] text-sky-700 font-medium truncate w-full text-center">
                        Audio
                      </span>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-emerald-50 gap-1 p-1">
                      <FileIcon className="h-6 w-6 text-emerald-500" />
                      <span className="text-[10px] text-emerald-700 font-medium truncate w-full text-center px-1">
                        {item.file.name}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveMediaAt(i)}
                    className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 group-hover:flex"
                  >
                    <X className="h-3 w-3 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút send bên phải */}
        <div className="pb-0.5">
          <Button
            onClick={handleSend}
            disabled={isDisabled || isRecording}
            className="p-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-md transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none"
          >
            <SendHorizonal size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};
