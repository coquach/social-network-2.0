import { createContext, useContext } from 'react';

export type AvatarSize = 'small' | 'medium' | 'large';

export interface AvatarContextValue {
  userId: string;
  size: AvatarSize;
  hasBorder: boolean;
  isOnline?: boolean;
  statusText?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
}

const AvatarContext = createContext<AvatarContextValue | null>(null);

export const AvatarProvider = AvatarContext.Provider;

export const useAvatarContext = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error(
      'Avatar compound components must be used within Avatar.Root',
    );
  }

  return context;
};
