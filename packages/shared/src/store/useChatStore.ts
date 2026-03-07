'use client';

/**
 * Chat Store
 * Platform-agnostic Zustand store for chat/message state management
 * 
 * Features:
 * - Reply-to message tracking
 * - Message composition state
 */

import { create } from 'zustand';
import type { MessageDTO } from '../types';

interface ChatState {
  // Reply functionality
  replyTo: MessageDTO | null;
  setReplyTo: (message: MessageDTO | null) => void;
  clearReply: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  replyTo: null,

  setReplyTo: (message) => set({ replyTo: message }),

  clearReply: () => set({ replyTo: null }),
}));
