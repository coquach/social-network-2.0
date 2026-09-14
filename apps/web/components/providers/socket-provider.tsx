'use client';

import { useAuth } from '@clerk/nextjs';
import React from 'react';
import { SocketProvider as SharedSocketProvider, useSocket } from '@repo/shared/contexts';

export { useSocket };

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return <>{children}</>;
  }

  return (
    <SharedSocketProvider 
      url={process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001'} 
      getToken={getToken}
    >
      {children}
    </SharedSocketProvider>
  );
};
