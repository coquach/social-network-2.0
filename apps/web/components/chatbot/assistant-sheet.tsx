'use client';

import { useAuth } from '@clerk/nextjs';
import { useAssistantChatSession } from '@repo/shared';
import {
  Bot,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { toast } from 'sonner';

const QUICK_PROMPTS = [
  { emoji: '🌿', text: 'Hôm nay tôi cảm thấy hơi áp lực công việc...' },
  { emoji: '💤', text: 'Gợi ý cho tôi các cách cải thiện giấc ngủ sâu' },
  { emoji: '🫁', text: 'Hướng dẫn bài tập hít thở thư giãn 4-7-8' },
  { emoji: '🎯', text: 'Làm thế nào để duy trì thói quen tích cực mỗi ngày?' },
];

function renderInlineStyles(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedAssistantText({ content }: { content: string }) {
  const paragraphs = content.split('\n\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed text-foreground select-text">
      {paragraphs.map((p, pIdx) => {
        const lines = p.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (
                trimmed.startsWith('- ') ||
                trimmed.startsWith('* ') ||
                trimmed.startsWith('• ')
              ) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{renderInlineStyles(trimmed.slice(2))}</span>
                  </div>
                );
              }
              const matchNumber = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (matchNumber) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="font-semibold text-primary">
                      {matchNumber[1]}.
                    </span>
                    <span>{renderInlineStyles(matchNumber[2])}</span>
                  </div>
                );
              }
              return (
                <p key={lIdx} className="min-h-[1.25rem]">
                  {renderInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function AssistantSheet() {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    messages: historyMessages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    sendMessage,
    clearHistory,
    isResponding,
    isClearing,
    error,
    retryHistory,
    resetError,
  } = useAssistantChatSession(userId ?? '', { limit: 30, enabled: isOpen });

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [historyMessages, isResponding, isOpen]);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isResponding) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(text);
  }, [input, isResponding, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Đã sao chép phản hồi');
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setShowClearConfirm(false);
      toast.success('Đã xóa toàn bộ lịch sử trò chuyện');
    } catch {
      toast.error('Không thể xóa lịch sử. Vui lòng thử lại.');
    }
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở Trợ lý Sentimeta AI"
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary px-4 py-3 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/35 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot size={22} className="transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide hidden sm:inline-block">
            Trợ lý AI
          </span>
        </button>
      </div>

      {/* ── Slide-over Sheet ── */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="flex flex-col w-full sm:max-w-md p-0 h-full bg-background border-l border-border shadow-2xl"
        >
          {/* ── Sheet Header ── */}
          <SheetHeader className="px-5 py-4 border-b border-border bg-card/60 backdrop-blur-md flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-sm">
                <Sparkles size={20} />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  Trợ lý Sentimeta AI
                </SheetTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Sẵn sàng hỗ trợ & lắng nghe</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {historyMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowClearConfirm(true)}
                  title="Xóa lịch sử"
                  aria-label="Xóa lịch sử"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* ── Error Banner ── */}
          {error && (
            <div className="px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between text-xs text-destructive">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} />
                <span>Không thể tải lịch sử trò chuyện.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => retryHistory()}
                  className="font-medium underline hover:no-underline cursor-pointer"
                >
                  Thử lại
                </button>
                <button
                  type="button"
                  onClick={() => resetError()}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Bỏ qua"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* ── Chat Messages Container ── */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 app-scroll"
          >
            {/* Load more previous messages button */}
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs h-7 rounded-full"
                >
                  {isFetchingNextPage ? (
                    <Loader2 size={12} className="animate-spin mr-1.5" />
                  ) : (
                    <RotateCcw size={12} className="mr-1.5" />
                  )}
                  Tải thêm tin nhắn cũ
                </Button>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && historyMessages.length === 0 && (
              <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
                <Loader2 size={20} className="animate-spin text-primary" />
                <span className="text-sm">Đang tải cuộc trò chuyện...</span>
              </div>
            )}

            {/* Empty state with Quick Prompts */}
            {!isLoading && historyMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bot size={32} />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="font-bold text-foreground text-base">
                    Tôi có thể giúp gì cho bạn?
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Chia sẻ cảm xúc, hỏi mẹo cân bằng cuộc sống hoặc lắng nghe lời khuyên tâm lý.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left px-1">
                    Gợi ý câu hỏi
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInput(p.text);
                          textareaRef.current?.focus();
                        }}
                        className="flex items-center gap-2.5 text-left p-3 rounded-xl border border-border/70 bg-card hover:bg-accent hover:border-primary/30 transition text-xs text-foreground cursor-pointer"
                      >
                        <span className="text-base">{p.emoji}</span>
                        <span className="line-clamp-1">{p.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message list */}
            {historyMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-br-xs'
                        : 'bg-card border border-border shadow-xs text-foreground rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed select-text">
                        {msg.content}
                      </p>
                    ) : (
                      <>
                        <FormattedAssistantText content={msg.content} />
                        <div className="mt-2 pt-2 border-t border-border/50 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Responding indicator */}
            {isResponding && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
                <div className="bg-card border border-border shadow-xs rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* ── Sheet Footer: Input ── */}
          <div className="p-3 border-t border-border bg-card/60 backdrop-blur-md">
            <div className="flex items-end gap-2 bg-background border border-border rounded-2xl p-2 shadow-xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi trợ lý Sentimeta AI..."
                rows={1}
                disabled={isResponding}
                className="flex-1 max-h-[120px] resize-none border-0 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => void handleSend()}
                disabled={!input.trim() || isResponding}
                className="h-8 w-8 rounded-xl shrink-0 cursor-pointer"
              >
                {isResponding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Sentimeta AI là trợ lý đồng hành cảm xúc, không thay thế chẩn đoán y tế.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Clear History Confirmation Dialog ── */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa lịch sử trò chuyện?</AlertDialogTitle>
            <AlertDialogDescription>
              Toàn bộ tin nhắn trước đây với Trợ lý AI sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleClearHistory()}
              disabled={isClearing}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isClearing ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Đang xóa...
                </>
              ) : (
                'Xác nhận xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
