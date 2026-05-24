'use client';

import { useAuth } from '@clerk/nextjs';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

type SocketsContextType = {
  chatSocket: Socket | null;
  chatConnected: boolean;
};

const SocketContext = createContext<SocketsContextType>({
  chatSocket: null,
  chatConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  const [chatConnected, setChatConnected] = useState(false);
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setChatSocket(null);
      setChatConnected(false);
      return;
    }

    let chatHeartbeat: NodeJS.Timeout | null = null;

    const chatSocketInstance = io(`${process.env.NEXT_PUBLIC_WS_URL}/chat`, {
      auth: async (cb) => {
        const token = await getTokenRef.current();
        cb({ token });
      },
      transports: ['websocket'],
    });

    chatSocketInstance.on('connect', () => {
      setChatConnected(true);
      chatSocketInstance.emit('heartbeat');

      chatHeartbeat = setInterval(() => {
        if (chatSocketInstance.connected) {
          chatSocketInstance.emit('heartbeat');
        }
      }, 20_000);
    });

    chatSocketInstance.on('disconnect', () => {
      setChatConnected(false);
      if (chatHeartbeat) {
        clearInterval(chatHeartbeat);
        chatHeartbeat = null;
      }
    });

    setChatSocket(chatSocketInstance);

    return () => {
      if (chatHeartbeat) {
        clearInterval(chatHeartbeat);
      }

      chatSocketInstance.disconnect();
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      return;
    }

    setChatSocket(null);
    setChatConnected(false);
  }, [isLoaded, isSignedIn]);

  const value = useMemo(
    () => ({
      chatSocket,
      chatConnected,
    }),
    [chatConnected, chatSocket],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
