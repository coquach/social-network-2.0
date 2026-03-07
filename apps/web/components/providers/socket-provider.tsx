'use client';
import { useAuth } from '@clerk/nextjs';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketsContextType = {
  chatSocket: Socket | null;
  chatConnected: boolean;
  notificationSocket: Socket | null;
  notificationConnected: boolean;
};

const SocketContext = createContext<SocketsContextType>({
  chatSocket: null,
  chatConnected: false,
  notificationSocket: null,
  notificationConnected: false,
});
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  const [chatConnected, setChatConnected] = useState(false);
  const [notificationConnected, setNotificationConnected] = useState(false);
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [notificationSocket, setNotificationSocket] = useState<Socket | null>(
    null
  );
  useEffect(() => {
    const notificationSocketInstance = io(
      `${process.env.NEXT_PUBLIC_WS_URL}/notifications`,
      {
        auth: async (cb) => {
          const token = await getToken();
          cb({ token });
        },
        transports: ['websocket'],
      }
    );
    let chatHeartbeat: NodeJS.Timeout;
    const chatSocketInstance = io(`${process.env.NEXT_PUBLIC_WS_URL}/chat`, {
      auth: async (cb) => {
        const token = await getToken();
        cb({ token });
      },
      transports: ['websocket'],
    });
    chatSocketInstance.on('connect', () => {
      console.log('✅ Chat WS connected', chatSocketInstance.id);
      setChatConnected(true);
      chatSocketInstance.emit('heartbeat');
      chatHeartbeat = setInterval(() => {
        if (chatSocketInstance.connected) {
          chatSocketInstance.emit('heartbeat');
          console.log('💓 Chat heartbeat sent');
        }
      }, 20000);
    });
    chatSocketInstance.on('disconnect', () => {
      console.log('❌ Chat WS disconnected');
      setChatConnected(false);
      clearInterval(chatHeartbeat);
    });
    notificationSocketInstance.on('connect', () => {
      console.log(
        '✅ Notification WS connected',
        notificationSocketInstance.id
      );
      setNotificationConnected(true);
    });
    notificationSocketInstance.on('disconnect', () => {
      console.log('❌ Notification WS disconnected');
      setNotificationConnected(false);
    });
    setChatSocket(chatSocketInstance);
    setNotificationSocket(notificationSocketInstance);
    return () => {
      chatSocketInstance.disconnect();
      clearInterval(chatHeartbeat);
      notificationSocketInstance.disconnect();
    };
  }, [getToken]);
  return (
    <SocketContext.Provider
      value={{
        chatSocket,
        chatConnected,
        notificationSocket,
        notificationConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
