'use client';

import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import {
  AiAssistantPolicy,
  type ProactiveCheckinContext,
  getAssistantMessageActions,
  getAssistantMessageCards,
  getAssistantProposeActions,
  getPolicyBlockBannerState,
  queryKeys,
  resolveSurfaceFromPathname,
  useAssistantChatSession,
  useAssistantConversations,
  useAssistantStore,
  useUpdateProfile,
  useUser,
} from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  History,
  Loader2,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useClickOutside } from '@/hooks/use-click-outside';
import { ActionConfirmationCard } from './action-confirmation-card';
import { AssistantActionButtons } from './assistant-action-buttons';
import { AssistantCards } from './assistant-cards';
import {
  BUTTON_SIZE,
  AssistantFloatingButton,
  type FloatingPosition,
} from './assistant-floating-button';
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

const PROACTIVE_QUICK_PROMPTS = [
  { emoji: '🌿', text: 'Chia sẻ thêm với mình' },
  { emoji: '🧘', text: 'Gợi ý cho mình các bài tập thư giãn nhẹ nhàng' },
  { emoji: '💬', text: 'Mình đang cảm thấy hơi quá tải, cần lời khuyên' },
];

const POPUP_WIDTH = 460;
const POPUP_HEIGHT = 660;
const POPUP_GAP = 12;

function getPopupCoords(buttonPos: FloatingPosition) {
  if (typeof window === 'undefined') {
    return {
      right: '24px',
      bottom: '96px',
      width: `${POPUP_WIDTH}px`,
      height: `${POPUP_HEIGHT}px`,
      transformOrigin: 'bottom right',
    };
  }

  const windowW = window.innerWidth;
  const windowH = window.innerHeight;

  // Mobile layout (< 640px): Full-width docked card
  if (windowW < 640) {
    return {
      left: '12px',
      right: '12px',
      top: '72px',
      bottom: '12px',
      width: 'auto',
      height: 'auto',
      transformOrigin: 'bottom center',
    };
  }

  const effectiveWidth = Math.min(POPUP_WIDTH, windowW - 32);
  const effectiveHeight = Math.min(POPUP_HEIGHT, windowH - 96);

  const isRightSide = buttonPos.x + BUTTON_SIZE / 2 > windowW / 2;

  // Horizontal position
  let left = isRightSide
    ? buttonPos.x + BUTTON_SIZE - effectiveWidth
    : buttonPos.x;

  // Clamp within viewport margins
  left = Math.max(16, Math.min(left, windowW - effectiveWidth - 16));

  // Vertical position: prefer opening ABOVE button
  let top = buttonPos.y - effectiveHeight - POPUP_GAP;
  let originY = 'bottom';

  if (top < 76) {
    // If not enough room above (button is dragged near the top), open BELOW
    top = buttonPos.y + BUTTON_SIZE + POPUP_GAP;
    originY = 'top';

    // Clamp if also overflowing bottom
    if (top + effectiveHeight > windowH - 16) {
      top = Math.max(76, windowH - effectiveHeight - 16);
    }
  }

  const originX = isRightSide ? 'right' : 'left';

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${effectiveWidth}px`,
    height: `${effectiveHeight}px`,
    transformOrigin: `${originY} ${originX}`,
  };
}

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
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const surface = useMemo(
    () => resolveSurfaceFromPathname(pathname || '/', 'web'),
    [pathname]
  );
  const { data: user } = useUser(userId ?? '');
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [buttonPos, setButtonPos] = useState<FloatingPosition>({ x: 0, y: 0 });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showSessionsDrawer, setShowSessionsDrawer] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [activeProactiveContext, setActiveProactiveContext] =
    useState<ProactiveCheckinContext | null>(null);
  const [pendingCrisisContext, setPendingCrisisContext] =
    useState<ProactiveCheckinContext | null>(null);
  const [showCrisisConfirm, setShowCrisisConfirm] = useState(false);

  const handleStartNewChat = useCallback(() => {
    if (userId) {
      queryClient.removeQueries({
        queryKey: queryKeys.chatbot.history(userId, 30, 'new'),
      });
    }
    setActiveProactiveContext(null);
    setActiveConversationId('new');
    setShowSessionsDrawer(false);
    setInput('');
  }, [queryClient, userId]);

  const pendingProactiveContext = useAssistantStore((s) => s.pendingProactiveContext);
  const openRequestSeq = useAssistantStore((s) => s.openRequestSeq);
  const consumeProactiveContext = useAssistantStore((s) => s.consumeProactiveContext);

  const effectiveSurface = useMemo(() => {
    if (!activeProactiveContext) return surface;
    return {
      ...surface,
      metadata: {
        chatbotPromptContext: activeProactiveContext.promptContext,
        interventionId: activeProactiveContext.interventionId,
      },
    };
  }, [surface, activeProactiveContext]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const floatingButtonContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    conversations,
    deleteConversation,
    isDeleting,
  } = useAssistantConversations(userId ?? '', 20, isOpen);

  // Auto-select latest active conversation on initial open (unless a 0-LLM proactive entry is active)
  useEffect(() => {
    if (
      isOpen &&
      activeConversationId === null &&
      !activeProactiveContext &&
      !pendingProactiveContext &&
      conversations.length > 0
    ) {
      setActiveConversationId(conversations[0].id);
    }
  }, [isOpen, activeConversationId, activeProactiveContext, pendingProactiveContext, conversations]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  );

  const {
    messages: historyMessages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    sendMessage,
    clearHistory,
    isResponding,
    isSyncingHistory,
    isClearing,
    error,
    retryHistory,
    resetError,
    updateProposalStatus,
  } = useAssistantChatSession(userId ?? '', {
    limit: 30,
    enabled: isOpen,
    surface: effectiveSurface,
    conversationId: activeConversationId ?? undefined,
    onConversationCreated: (newId) => setActiveConversationId(newId),
  });

  // Open sheet with 0-LLM local proactive check-in context when requested
  useEffect(() => {
    if (openRequestSeq > 0 && pendingProactiveContext) {
      const isChatting = historyMessages.length > 0 || input.trim().length > 0 || isResponding;
      if (isOpen && isChatting) {
        setPendingCrisisContext(pendingProactiveContext);
        setShowCrisisConfirm(true);
        consumeProactiveContext();
      } else {
        setActiveProactiveContext(pendingProactiveContext);
        setActiveConversationId('new');
        setShowSessionsDrawer(false);
        setIsOpen(true);
        consumeProactiveContext();
      }
    }
  }, [openRequestSeq, pendingProactiveContext, consumeProactiveContext, isOpen, historyMessages.length, input, isResponding]);

  // Close popup on outside click (excluding floating button)
  useClickOutside(
    popupRef,
    (event: MouseEvent) => {
      if (floatingButtonContainerRef.current?.contains(event.target as Node)) {
        return;
      }
      setIsOpen(false);
    },
    isOpen
  );

  // Close popup on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [historyMessages, isResponding, isOpen]);

  // Focus input when popup opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const isChatBusy = isResponding || isSyncingHistory;

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isChatBusy) return;
    const sent = await sendMessage(text);
    if (sent) {
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setActiveProactiveContext(null);
    }
  }, [input, isChatBusy, sendMessage]);

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

  const handleDeleteCurrentConversation = async () => {
    if (activeConversationId && activeConversationId !== 'new') {
      try {
        await deleteConversation(activeConversationId);
        setActiveConversationId(null);
        setShowClearConfirm(false);
        toast.success('Đã xóa cuộc trò chuyện');
      } catch {
        toast.error('Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
      }
    } else {
      try {
        await clearHistory();
        setShowClearConfirm(false);
        toast.success('Đã làm mới cuộc trò chuyện');
      } catch {
        toast.error('Không thể xóa lịch sử. Vui lòng thử lại.');
      }
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await clearHistory();
      setActiveConversationId(null);
      setShowClearAllConfirm(false);
      setShowSessionsDrawer(false);
      toast.success('Đã xóa toàn bộ lịch sử và hồ sơ cá nhân');
    } catch {
      toast.error('Không thể xóa lịch sử. Vui lòng thử lại.');
    }
  };

  const popupCoords = useMemo(() => getPopupCoords(buttonPos), [buttonPos]);

  return (
    <>
      {/* ── Floating Action Button (Circular & Draggable) ── */}
      <AssistantFloatingButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onPositionChange={setButtonPos}
        containerRef={floatingButtonContainerRef}
      />

      {/* ── Anchored Popup Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            role="dialog"
            aria-modal="true"
            aria-label="Trợ lý Sentimeta AI"
            initial={{ opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'fixed',
              zIndex: 50,
              ...popupCoords,
            }}
            className="flex flex-col bg-background/95 backdrop-blur-xl border border-border/80 rounded-3xl shadow-2xl shadow-primary/15 overflow-hidden"
          >
            {/* ── Popup Header ── */}
            <div className="px-4 py-3.5 border-b border-border bg-card/60 backdrop-blur-md flex flex-row items-center justify-between space-y-0 shrink-0 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-sm shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-foreground truncate">
                      Sentimeta AI
                    </h2>
                    {user?.privacySettings?.aiPolicy === AiAssistantPolicy.RESTRICTED && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                        Riêng tư
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[190px]">
                    {activeConversation?.title || 'Cuộc trò chuyện mới'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer rounded-full"
                      onClick={() => setShowSessionsDrawer((prev) => !prev)}
                      aria-label="Lịch sử phiên"
                    >
                      <History size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Lịch sử phiên</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer rounded-full"
                      onClick={handleStartNewChat}
                      aria-label="Cuộc trò chuyện mới"
                    >
                      <Plus size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Cuộc trò chuyện mới</TooltipContent>
                </Tooltip>
                {historyMessages.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-full"
                        onClick={() => setShowClearConfirm(true)}
                        aria-label="Xóa cuộc trò chuyện hiện tại"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Xóa cuộc trò chuyện hiện tại</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-full"
                      onClick={() => setIsOpen(false)}
                      aria-label="Đóng cửa sổ"
                    >
                      <X size={17} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Đóng cửa sổ</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* ── Sessions Drawer ── */}
            <AnimatePresence>
              {showSessionsDrawer && (
                <motion.div
                  key="sessions-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px]"
                  onClick={() => setShowSessionsDrawer(false)}
                />
              )}
              {showSessionsDrawer && (
                <motion.div
                  key="sessions-sheet"
                  role="dialog"
                  aria-label="Lịch sử phiên"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                  className="absolute inset-y-0 left-0 z-30 w-[82%] max-w-[320px] border-r border-border bg-card shadow-2xl px-4 py-3 overflow-y-auto app-scroll"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <History size={13} className="text-primary" />
                      Lịch sử phiên ({conversations.length}/20)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSessionsDrawer(false)}
                      className="p-1 rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
                      aria-label="Đóng lịch sử"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleStartNewChat}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                    >
                      <Plus size={12} />
                      Tạo phiên mới
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {conversations.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-3">
                        Chưa có phiên trò chuyện nào được lưu.
                      </p>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`group flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition text-xs ${
                            activeConversationId === conv.id
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border/60 hover:bg-muted/60 text-foreground'
                          }`}
                          onClick={() => {
                            setActiveProactiveContext(null);
                            setActiveConversationId(conv.id);
                            setShowSessionsDrawer(false);
                          }}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="truncate font-medium">{conv.title || 'Cuộc trò chuyện'}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                              })}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteConversation(conv.id);
                              if (activeConversationId === conv.id) {
                                setActiveConversationId(null);
                              }
                            }}
                            className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition opacity-60 group-hover:opacity-100"
                            title="Xóa phiên"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {conversations.length > 0 && (
                    <div className="pt-2.5 mt-2 border-t border-border/50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowClearAllConfirm(true)}
                        className="text-[11px] text-destructive hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Trash2 size={11} />
                        Xóa toàn bộ lịch sử & hồ sơ AI
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Error Banner ── */}
            {error && (
              <div className="px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 flex items-center justify-between text-xs text-destructive shrink-0">
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
              className="flex-1 overflow-y-auto px-5 py-4 space-y-4 app-scroll"
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

              {/* Empty state: Unified (Normal or Proactive Safe Space) */}
              {!isLoading && historyMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  {activeProactiveContext ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
                        <Sparkles size={28} />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">
                        Góc nhỏ lắng nghe
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 max-w-[300px] leading-relaxed">
                        {activeProactiveContext.promptContext}
                      </p>

                      <div className="mt-5 w-full space-y-2">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-left pl-1">
                          Gợi ý trò chuyện:
                        </p>
                        {PROACTIVE_QUICK_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInput(prompt.text);
                              textareaRef.current?.focus();
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-card hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-xs text-foreground transition flex items-center gap-2 cursor-pointer group"
                          >
                            <span className="text-base group-hover:scale-110 transition-transform">
                              {prompt.emoji}
                            </span>
                            <span className="flex-1 line-clamp-1">{prompt.text}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center text-primary mb-3 shadow-inner">
                        <Bot size={28} />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">
                        Xin chào! Tôi có thể giúp gì cho bạn?
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                        Hãy chia sẻ cảm xúc, tìm kiếm bài viết, bạn bè hoặc nhờ tôi hướng dẫn các tính năng của Sentimeta.
                      </p>

                      <div className="mt-5 w-full space-y-2">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-left pl-1">
                          Gợi ý câu hỏi:
                        </p>
                        {QUICK_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInput(prompt.text);
                              textareaRef.current?.focus();
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-border/60 bg-card hover:bg-accent/40 text-xs text-foreground transition flex items-center gap-2 cursor-pointer group"
                          >
                            <span className="text-base group-hover:scale-110 transition-transform">
                              {prompt.emoji}
                            </span>
                            <span className="flex-1 line-clamp-1">{prompt.text}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Message items */}
              {historyMessages.map((msg) => {
                // Gap Marker phân tách ngữ cảnh
                if (msg.role === 'system') {
                  return (
                    <div key={msg.id} className="flex items-center justify-center my-3 px-4">
                      <div className="h-[1px] flex-1 bg-border/60" />
                      <span className="mx-3 text-[11px] text-muted-foreground/80 italic bg-muted/30 px-2.5 py-1 rounded-full text-center">
                        {msg.content}
                      </span>
                      <div className="h-[1px] flex-1 bg-border/60" />
                    </div>
                  );
                }

                const isUser = msg.role === 'user';
                const isPendingAssistant =
                  !isUser && msg.metadata?.isPending === true;

                if (isPendingAssistant && !msg.content) {
                  return null;
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mb-0.5">
                        <Bot size={15} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                        isUser
                          ? 'bg-primary text-primary-foreground rounded-br-xs'
                          : 'bg-card border border-border rounded-bl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed select-text">
                          {msg.content}
                        </p>
                      ) : (
                        <>
                          <FormattedAssistantText content={msg.content} />
                          <AssistantCards
                            cards={getAssistantMessageCards(msg.metadata)}
                            onNavigate={(href) => {
                              setIsOpen(false);
                              router.push(href);
                            }}
                          />
                          <ActionConfirmationCard
                            proposals={getAssistantProposeActions(msg.metadata)}
                            conversationId={msg.conversationId || activeConversationId || undefined}
                            onStatusChange={updateProposalStatus}
                          />
                          <AssistantActionButtons
                            actions={getAssistantMessageActions(msg.metadata)}
                            onNavigate={(href) => {
                              setIsOpen(false);
                              router.push(href);
                            }}
                          />
                          {/* Just-In-Time AI Privacy Policy Consent / Server Fail-Closed Banner */}
                          {(() => {
                            const bannerState = !isUser
                              ? getPolicyBlockBannerState(
                                  msg.content,
                                  msg.metadata,
                                  user?.privacySettings?.aiPolicy,
                                )
                              : null;
                            if (!bannerState) return null;
                            return (
                              <div className="mt-3 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40 text-xs">
                                <div className="flex items-start gap-2.5">
                                  <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                  <div className="flex-1 space-y-1">
                                    {bannerState === 'user_restricted' ? (
                                      <>
                                        <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                                          Chế độ Riêng tư tối đa đang bật
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400 leading-normal">
                                          AI cần quyền Đầy đủ tính năng để tìm kiếm dữ liệu cá nhân hoặc hỗ trợ bạn thực hiện các thao tác.
                                        </p>
                                        <div className="pt-1.5 flex items-center justify-between gap-2">
                                          <span className="text-[11px] font-medium text-indigo-900 dark:text-indigo-200">
                                            Cho phép trợ lý truy cập dữ liệu
                                          </span>
                                          <Switch
                                            checked={user?.privacySettings?.aiPolicy === AiAssistantPolicy.FULL}
                                            disabled={isUpdatingProfile}
                                            aria-label="Cho phép Trợ lý AI truy cập dữ liệu"
                                            onCheckedChange={async (enabled) => {
                                              try {
                                                await updateProfile({
                                                  privacySettings: {
                                                    ...user?.privacySettings,
                                                    aiPolicy: enabled
                                                      ? AiAssistantPolicy.FULL
                                                      : AiAssistantPolicy.RESTRICTED,
                                                  },
                                                });
                                                toast.success(
                                                  enabled
                                                    ? 'Đã cấp quyền Đầy đủ tính năng cho Trợ lý AI!'
                                                    : 'Đã giới hạn quyền truy cập của Trợ lý AI.',
                                                );
                                              } catch {
                                                toast.error('Không thể cập nhật quyền riêng tư');
                                              }
                                            }}
                                          />
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                                          Quyền truy cập dữ liệu cá nhân tạm thời bị hạn chế
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400 leading-normal">
                                          Hệ thống đang tạm giới hạn truy cập thông tin cá nhân để bảo vệ an toàn. Bạn có thể thử lại sau ít phút.
                                        </p>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          {msg.sources.length > 0 && (
                            <div className="mt-3 border-t border-border/50 pt-2.5">
                              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                                Nguồn tham khảo
                              </p>
                              <ol className="space-y-1">
                                {msg.sources.map((source, index) => (
                                  <li
                                    key={`${source.type}:${source.id}:${index}`}
                                    className="text-[11px] text-muted-foreground"
                                  >
                                    <span className="mr-1 font-medium text-foreground/70">
                                      [{index + 1}]
                                    </span>
                                    {source.title || source.source || `${source.type}: ${source.id}`}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {msg.metadata?.isPending !== true && (
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
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Responding indicator */}
              {isResponding && (
                <div className="flex items-end gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mb-0.5">
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

            {/* ── Popup Footer: Input ── */}
            <div className="p-3.5 border-t border-border bg-card/60 backdrop-blur-md shrink-0">
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
                  disabled={isChatBusy}
                  className="flex-1 max-h-[120px] resize-none border-0 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isChatBusy}
                  className="h-8 w-8 rounded-xl shrink-0 cursor-pointer"
                >
                  {isChatBusy ? (
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

            {/* ── Switch to Crisis Proactive In-Chat Confirmation Dialog ── */}
            <AnimatePresence>
              {showCrisisConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-40 flex items-center justify-center p-5 bg-black/50 backdrop-blur-xs"
                >
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                    className="w-full max-w-[340px] rounded-2xl border border-border bg-card p-5 shadow-2xl text-center space-y-3"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-500">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Mở phiên hỗ trợ tâm lý mới?
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bạn vừa chọn một gợi ý hỗ trợ cảm xúc mới. Cuộc trò chuyện hiện tại sẽ được lưu an toàn trong lịch sử phiên.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-xl text-xs h-9 cursor-pointer"
                        onClick={() => {
                          setShowCrisisConfirm(false);
                          setPendingCrisisContext(null);
                        }}
                      >
                        Ở lại phiên này
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1 rounded-xl text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                        onClick={() => {
                          setShowCrisisConfirm(false);
                          setActiveProactiveContext(pendingCrisisContext);
                          setActiveConversationId('new');
                          setPendingCrisisContext(null);
                          setInput('');
                        }}
                      >
                        Mở phiên mới
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Conversation Confirmation Dialog ── */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa cuộc trò chuyện này?</AlertDialogTitle>
            <AlertDialogDescription>
              Đoạn chat này sẽ bị xóa khỏi lịch sử. Hồ sơ thông tin dài hạn mà AI đã ghi nhớ về bạn vẫn được giữ nguyên.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting || isClearing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteCurrentConversation()}
              disabled={isDeleting || isClearing}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {isDeleting || isClearing ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Đang xóa...
                </>
              ) : (
                'Xóa cuộc trò chuyện'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Clear All History & Memory Profile Confirmation Dialog ── */}
      <AlertDialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa toàn bộ lịch sử & hồ sơ AI?</AlertDialogTitle>
            <AlertDialogDescription>
              Toàn bộ các cuộc trò chuyện và hồ sơ ghi nhớ cá nhân dài hạn (User Memory Profile) sẽ bị xóa sạch hoàn toàn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleClearAllHistory()}
              disabled={isClearing}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer"
            >
              {isClearing ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Đang xóa...
                </>
              ) : (
                'Xóa toàn bộ dữ liệu'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
