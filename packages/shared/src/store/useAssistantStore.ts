/**
 * Assistant Store
 * Coordinates cross-screen assistant overlay opening and 0-LLM proactive check-in seeding.
 */

import { create } from 'zustand';
import type { ProactiveCheckinContext } from '../types/chatbot.types';

interface AssistantStoreState {
  pendingProactiveContext: ProactiveCheckinContext | null;
  openRequestSeq: number;
  openWithProactiveContext: (context: ProactiveCheckinContext) => void;
  consumeProactiveContext: () => void;
}

export const useAssistantStore = create<AssistantStoreState>((set) => ({
  pendingProactiveContext: null,
  openRequestSeq: 0,
  openWithProactiveContext: (context) =>
    set((state) => ({
      pendingProactiveContext: context,
      openRequestSeq: state.openRequestSeq + 1,
    })),
  consumeProactiveContext: () =>
    set({
      pendingProactiveContext: null,
    }),
}));

/**
 * Extracts a 0-LLM proactive check-in context from a notification item or payload.
 * Returns null when the notification does not carry proactive check-in content.
 */
export const extractProactiveCheckinContext = (
  notification: {
    _id?: string;
    type?: string;
    message?: string;
    payload?: unknown;
  } | null | undefined,
): ProactiveCheckinContext | null => {
  if (!notification || notification.type !== 'proactive_intervention') {
    return null;
  }

  const payload =
    notification.payload && typeof notification.payload === 'object'
      ? (notification.payload as Record<string, unknown>)
      : null;

  const promptContext =
    (typeof payload?.chatbotPromptContext === 'string' && payload.chatbotPromptContext.trim()) ||
    (typeof notification.message === 'string' && notification.message.trim()) ||
    (typeof payload?.content === 'string' && payload.content.trim()) ||
    '';

  if (!promptContext) {
    return null;
  }

  return {
    interventionId: typeof notification._id === 'string' ? notification._id : undefined,
    promptContext,
  };
};
