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
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport, type UIMessage } from 'ai';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { TbMessageChatbotFilled } from 'react-icons/tb';
import { useClickOutside } from '@/hooks/use-click-outside';

const welcomeMessage: UIMessage = {
  id: 'welcome',
  role: 'assistant' as const,
  parts: [
    {
      type: 'text' as const,
      text: "Chào bạn! Tôi là trợ lý AI của Sentimeta. Tôi có thể giúp gì cho bạn hôm nay?",
    },
  ],
};

export const ChatBox = () => {
  const featureLocked = true;
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible] = useState(true);
  const [input, setInput] = useState('');

  const dragConstraintsRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dragControls = useDragControls();

  const { messages, sendMessage, status } = useChat({
    transport: new TextStreamChatTransport({ api: '/api/chat' }),
    messages: [welcomeMessage],
  });

  const isLoading = status === 'submitted' || status === 'streaming';

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
    if (featureLocked) return;
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput('');
  };

  return (
    <div
      ref={dragConstraintsRef}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <motion.div
        drag
        dragConstraints={dragConstraintsRef}
        dragControls={dragControls}
        dragElastic={0.1}
        dragListener={false}
        dragMomentum={false}
       
        className="pointer-events-auto absolute bottom-5 right-5 flex flex-col items-end gap-3"
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
                <CardTitle className="text-xl font-bold text-sky-500">
                  Trợ lý Sentimeta AI
                </CardTitle>
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
                    {featureLocked ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        Tính năng chat AI hiện chưa hoàn thiện.
                      </div>
                    ) : (
                      messages.map((message) => {
                        const text = message.parts
                          .filter((part) => part.type === 'text')
                          .map((part) => part.text)
                          .join('');
                        const isUser = message.role === 'user';
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
                              }`}
                            >
                              {text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {isLoading ? (
                      <div className="text-xs text-slate-500">
                        Đang suy nghĩ...
                      </div>
                    ) : null}
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
                    disabled={featureLocked}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={
                      featureLocked || isLoading || input.trim().length === 0
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
