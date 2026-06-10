'use client';

import { useAuth } from '@clerk/nextjs';
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-sdk';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentUser, useIssueUserMediaToken } from '@repo/shared';

// Import CSS for Stream Video SDK
import '@stream-io/video-react-sdk/dist/css/styles.css';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

type CallProviderProps = {
  children: React.ReactNode;
};

export const CallClientContext = React.createContext<StreamVideoClient | null>(null);

export function useCallClient() {
  return React.useContext(CallClientContext);
}

export function CallProvider({ children }: CallProviderProps) {
  const { userId, isLoaded } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: issueToken } = useIssueUserMediaToken();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  // Track previous userId so we can force-disconnect on identity change
  const prevUserIdRef = useRef<string | null>(null);

  const user = useMemo<User | null>(() => {
    if (!userId || !currentUser) return null;
    return {
      id: userId,
      type: 'authenticated',
      name: `${currentUser.firstName} ${currentUser.lastName}`.trim() || userId,
      image: currentUser.avatarUrl ?? undefined,
    };
  }, [userId, currentUser]);

  useEffect(() => {
    let active = true;

    async function initClient() {
      if (!isLoaded || !user) {
        if (client) {
          await client.disconnectUser();
          if (active) setClient(null);
        }
        prevUserIdRef.current = null;
        return;
      }

      // Force-disconnect if the identity changed (logout → different login)
      if (prevUserIdRef.current && prevUserIdRef.current !== user.id && client) {
        await client.disconnectUser();
        if (active) setClient(null);
      }

      try {
        // Use tokenProvider callback instead of a static token so the SDK
        // can automatically re-fetch when the token expires (fixes >1h sessions).
        const tokenProvider = async () => {
          const { token } = await issueToken();
          return token;
        };

        if (!active) return;

        // In web we use new StreamVideoClient
        const streamClient = new StreamVideoClient({
          apiKey,
          user: user as any,
          tokenProvider,
        });

        prevUserIdRef.current = user.id ?? null;
        setClient(streamClient);
      } catch (error) {
        console.error('[CallProvider] Failed to initialize Stream client:', error);
      }
    }

    initClient();

    return () => {
      active = false;
    };
  }, [isLoaded, user, issueToken, client]);

  if (!client) {
    return (
      <CallClientContext.Provider value={null}>
        {children}
      </CallClientContext.Provider>
    );
  }

  return (
    <CallClientContext.Provider value={client}>
      <StreamVideo client={client}>{children}</StreamVideo>
    </CallClientContext.Provider>
  );
}
