'use client';

import { createContext, useContext } from 'react';

interface AvatarContextValue {
  userId: string;
  size: 'small' | 'medium' | 'large';
  hasBorder: boolean;
  isClickable: boolean;
  reactionEmoji?: string;
  onImageClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

export const AvatarProvider = AvatarContext.Provider;

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('Avatar compound components must be used within Avatar.Root');
  }
  return context;
};
