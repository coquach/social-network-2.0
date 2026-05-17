import { useAuth } from '@clerk/expo';
import {
  StreamVideo,
  StreamVideoClient,
  User,
} from '@stream-io/video-react-native-sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { useCurrentUser, useIssueUserMediaToken } from '@repo/shared';
import { AppLoadingOverlay } from '~/components/ui/app-loading';

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

type CallProviderProps = {
  children: React.ReactNode;
};

export function CallProvider({ children }: CallProviderProps) {
  const { userId, isLoaded } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { mutateAsync: issueToken } = useIssueUserMediaToken();
  const [client, setClient] = useState<StreamVideoClient | null>(null);

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
        return;
      }

      try {
        const { token } = await issueToken();
        if (!active) return;

        const streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user: user as any,
          token,
        });

        setClient(streamClient);
      } catch (error) {
        console.error('[CallProvider] Failed to initialize Stream client:', error);
      }
    }

    initClient();

    return () => {
      active = false;
    };
  }, [isLoaded, user, issueToken]);

  if (!isLoaded) {
    return <AppLoadingOverlay visible label="Đang tải..." />;
  }

  if (!client) {
    return <>{children}</>;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}
