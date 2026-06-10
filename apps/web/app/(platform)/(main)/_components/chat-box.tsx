'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@clerk/nextjs';
import { useAssistantChatSession } from '@repo/shared';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { TbMessageChatbotFilled } from 'react-icons/tb';
import { useClickOutside } from '@/hooks/use-click-outside';

export const ChatBox = () => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible] = useState(true);
  const [input, setInput] = useState('');

  const dragConstraintsRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dragControls = useDragControls();

  const { 
    messages, 
    sendMessage, 
    isResponding,
    clearHistory,
    isClearing,
    error 
  } = useAssistantChatSession(userId ?? '', { enabled: isOpen });

  const isLoading = isResponding;

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Close chat when clicking outside (except on trigger button)
  useClickOutside(
    popupRef,
    (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking on the trigger button
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    },
    isOpen // Only active when chat is open
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    
    // Clear input first for better UX
    setInput('');
    
    sendMessage(trimmed);
  };

  return (
    <div
      ref={dragConstraintsRef}
      className="fixed inset-0 z-50 pointer-events-none p-5 flex flex-col items-end justify-end"
    >
      <motion.div
        drag
        dragConstraints={dragConstraintsRef}
        dragControls={dragControls}
        dragElastic={0.1}
        dragListener={false}
        dragMomentum={false}
        className="pointer-events-auto flex flex-col items-end gap-3"
      >
          <AnimatePresence>
            {isVisible && isOpen ? (
              <motion.div
                ref={popupRef}
                key="chat-popup"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <Card className="w-[360px] max-w-[92vw] border-slate-200 shadow-xl">
                  <CardHeader
                    className="relative border-b border-slate-200 cursor-move"
                    onPointerDown={(event) => dragControls.start(event)}
                  >
                    <div className="flex flex-col">
                      <CardTitle className="text-xl font-bold text-sky-500">
                        Trợ lý Sentimeta AI
                      </CardTitle>
                      {messages.length > 0 && (
                        <button 
                          onClick={() => clearHistory()}
                          disabled={isClearing || isResponding}
                          className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors text-left"
                        >
                          {isClearing ? 'Đang xóa...' : 'Xóa lịch sử trò chuyện'}
                        </button>
                      )}
                    </div>
                    <div className="absolute right-3 top-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        onPointerDown={(event) => event.stopPropagation()}
                        aria-label="Đóng chat"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[340px] pr-3">
                      <div className="flex flex-col gap-3 text-sm">
                        {messages.length === 0 && !isLoading && (
                          <div className="text-center py-10 text-slate-400">
                            <TbMessageChatbotFilled className="h-10 w-10 mx-auto mb-2 opacity-20" />
                            <p>Chào bạn! Tôi là trợ lý AI của Sentimeta. Tôi có thể giúp gì cho bạn hôm nay?</p>
                          </div>
                        )}
                        {messages.map((message) => {
                          const isUser = message.role === 'user';
                          const isStreaming = message.metadata?.isPending === true && !isUser;
                          
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                                  isUser
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-slate-100 text-slate-900'
                                } ${message.metadata?.isPending === true && isUser ? 'opacity-70' : ''}`}
                              >
                                {message.content}
                                {isStreaming && (
                                  <span className="inline-block w-1.5 h-4 ml-1 bg-sky-500 animate-pulse align-middle" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {isLoading && (!messages.length || (messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content)) ? (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <div className="flex gap-0.5">
                              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            Trợ lý đang suy nghĩ...
                          </div>
                        ) : null}
                        {error && (
                          <div className="text-[10px] text-rose-500 text-center bg-rose-50 rounded-lg py-1">
                            Lỗi: {error.message}
                          </div>
                        )}
                        <div ref={endRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="border-t border-slate-200 pt-4">
                    <form
                      onSubmit={handleSubmit}
                      className="flex w-full items-center gap-2"
                    >
                      <Input
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="Nhập nội dung..."
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={
                          isLoading || input.trim().length === 0
                        }
                        aria-label="Gửi"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {isVisible ? (
              <motion.button
                key="chat-trigger"
                type="button"
                ref={triggerRef}
                onPointerDown={(event) => dragControls.start(event)}
                onClick={() => {
                  setIsOpen((prev) => !prev);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition hover:bg-sky-800 cursor-pointer"
                aria-label="Mở chat"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: isOpen ? 0 : [0, -6, 6, -4, 4, 0],
                  x: isOpen ? 0 : [0, -2, 2, -2, 2, 0],
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.5,
                  repeat: isOpen ? 0 : Infinity,
                  repeatDelay: 4,
                }}
              >
                <TbMessageChatbotFilled className="h-6 w-6" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </motion.div>
    </div>
  );
};
