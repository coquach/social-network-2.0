'use client';

/**
 * Presence Store
 * Platform-agnostic Zustand store for user online presence tracking
 * 
 * Features:
 * - Track online/offline/away status per user
 * - Last seen timestamps
 * - Bulk presence updates
 */

import { create } from 'zustand';

export type PresenceStatus = 'online' | 'offline' | 'away';

export interface PresenceInfo {
  status: PresenceStatus;
  lastSeen: string | null;
}

interface PresenceState {
  // Map of userId -> PresenceInfo
  members: Record<string, PresenceInfo>;

  // Actions
  upsert: (userId: string, info: PresenceInfo) => void;
  remove: (userId: string) => void;
  setAll: (members: Record<string, PresenceInfo>) => void;
  getById: (userId: string) => PresenceInfo | undefined;
  isOnline: (userId: string) => boolean;
  toArray: () => Array<{
    userId: string;
    status: PresenceStatus;
    lastSeen: string | null;
  }>;
  clear: () => void;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  members: {},

  upsert: (userId, info) =>
    set((state) => ({
      members: {
        ...state.members,
        [userId]: info,
      },
    })),

  remove: (userId) =>
    set((state) => {
      const next = { ...state.members };
      delete next[userId];
      return { members: next };
    }),

  setAll: (members) => set({ members }),

  getById: (userId) => {
    return get().members[userId];
  },

  isOnline: (userId) => {
    const info = get().members[userId];
    return info?.status === 'online';
  },

  toArray: () => {
    const members = get().members;
    return Object.entries(members).map(([userId, info]) => ({
      userId,
      status: info.status,
      lastSeen: info.lastSeen,
    }));
  },

  clear: () => set({ members: {} }),
}));
