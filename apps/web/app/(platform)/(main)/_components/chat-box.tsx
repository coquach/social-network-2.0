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
import { Send, X, Bot, User } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { TbMessageChatbotFilled } from 'react-icons/tb';
import { useClickOutside } from '@/hooks/use-click-outside';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TypingIndicator = () => (
  <div className="flex items-center space-x-1 p-2">
    <motion.div
      className="w-2 h-2 bg-sky-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="w-2 h-2 bg-sky-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-sky-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
    />
  </div>
);

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
    isSyncingHistory,
  } = useAssistantChatSession(userId ?? '', { limit: 50, enabled: isOpen });

  const isLoading = isResponding || isSyncingHistory;

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, isOpen, isResponding]);

  useClickOutside(
    popupRef,
    (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    },
    isOpen
  );

  const handleSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!userId) return;
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput('');
  };

  return (
    <div ref={dragConstraintsRef} className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="pointer-events-auto absolute bottom-5 right-5 flex flex-col items-end gap-3"
      >
        <AnimatePresence>
          {isVisible && isOpen ? (
            <motion.div
              ref={popupRef}
              key="chat-popup"
              drag
              dragConstraints={dragConstraintsRef}
              dragControls={dragControls}
              dragElastic={0.1}
              dragListener={false}
              dragMomentum={false}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Glassmorphism Card */}
              <Card className="w-[400px] max-w-[92vw] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardHeader
                  className="relative border-b border-white/40 cursor-move bg-gradient-to-r from-sky-400/80 to-blue-500/80 p-4"
                  onPointerDown={(event) => dragControls.start(event)}
                >
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <TbMessageChatbotFilled className="h-6 w-6" />
                    Trợ lý Tâm lý học
                  </CardTitle>
                  <div className="absolute right-3 top-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      onPointerDown={(event) => event.stopPropagation()}
                      className="text-white hover:bg-white/20"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[420px] px-4 py-4">
                    <div className="flex flex-col gap-4 text-sm pb-2">
                      {messages.length === 0 ? (
                        <div className="text-center text-slate-500 mt-10">
                          Hãy bắt đầu cuộc trò chuyện. Tôi luôn ở đây để lắng nghe.
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isUser = message.role === 'user';
                          return (
                            <div
                              key={message.id}
                              className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              {!isUser && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                  <Bot className="h-5 w-5 text-white" />
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm overflow-hidden ${
                                  isUser
                                    ? 'bg-sky-500 text-white rounded-tr-sm'
                                    : 'bg-white/80 border border-white/50 text-slate-800 rounded-tl-sm'
                                }`}
                              >
                                {isUser ? (
                                  <div className="whitespace-pre-wrap break-words [word-break:break-word]">{message.content}</div>
                                ) : (
                                  <div className="prose prose-sm prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-50 prose-a:text-sky-600 break-words">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      
                      {isResponding && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-2 justify-start">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div className="rounded-2xl px-3 py-2 bg-white/80 border border-white/50 rounded-tl-sm shadow-sm flex items-center">
                            <TypingIndicator />
                          </div>
                        </div>
                      )}
                      <div ref={endRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="border-t border-white/40 p-3 bg-white/40">
                  <form
                    onSubmit={handleSubmit}
                    className="flex w-full items-center gap-2 bg-white/70 rounded-full pl-4 pr-1 py-1 shadow-sm border border-white/60"
                  >
                    <Input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Gửi tin nhắn..."
                      disabled={isLoading}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-9"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || input.trim().length === 0}
                      className="rounded-full bg-sky-500 hover:bg-sky-600 shadow-sm h-9 w-9 shrink-0"
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
              onClick={() => setIsOpen((prev) => !prev)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition hover:shadow-[0_6px_25px_rgba(14,165,233,0.6)] cursor-pointer border-2 border-white/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: isOpen ? 0 : [0, -6, 6, -4, 4, 0],
                y: isOpen ? 0 : [0, -4, 0, -2, 0],
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.6,
                repeat: isOpen ? 0 : Infinity,
                repeatDelay: 5,
              }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <TbMessageChatbotFilled className="h-7 w-7" />}
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};
