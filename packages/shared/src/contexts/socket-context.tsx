'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/query-keys';

export interface SocketProviderProps {
  children: React.ReactNode;
  url: string;
  getToken: () => Promise<string | null>;
}

type SocketsContextType = {
  chatSocket: Socket | null;
  chatConnected: boolean;
};

const SocketContext = createContext<SocketsContextType>({
  chatSocket: null,
  chatConnected: false,
});

export const SocketProvider = ({ children, url, getToken }: SocketProviderProps) => {
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [chatConnected, setChatConnected] = useState(false);
  const queryClient = useQueryClient();
  const getTokenRef = React.useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  useEffect(() => {
    let chatHeartbeat: NodeJS.Timeout | null = null;
    const socketUrl = url.endsWith('/chat') ? url : `${url}/chat`;

    const chatSocketInstance = io(socketUrl, {
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

    // Realtime event listeners to mutate cache
    const handleNewMessage = (payload: any) => {
      const convId = payload?.conversationId || payload?.message?.conversationId;
      if (convId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.list(convId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    };

    chatSocketInstance.on('message.new', handleNewMessage);
    chatSocketInstance.on('new_message', handleNewMessage);

    setChatSocket(chatSocketInstance);

    return () => {
      if (chatHeartbeat) clearInterval(chatHeartbeat);
      chatSocketInstance.off('message.new', handleNewMessage);
      chatSocketInstance.off('new_message', handleNewMessage);
      chatSocketInstance.disconnect();
    };
  }, [url, queryClient]);

  return (
    <SocketContext.Provider value={{ chatSocket, chatConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
