import { useAuth } from '@clerk/expo';
import React from 'react';
import { io, type Socket } from 'socket.io-client';
import { getFreshClerkToken } from '~/utils/clerk-auth';

type SocketContextValue = {
  chatSocket: Socket | null;
  chatConnected: boolean;
};

const SocketContext = React.createContext<SocketContextValue>({
  chatSocket: null,
  chatConnected: false,
});

type SocketProviderProps = {
  children: React.ReactNode;
};

export function NativeSocketProvider({ children }: SocketProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getTokenRef = React.useRef(getToken);
  const [chatConnected, setChatConnected] = React.useState(false);
  const [chatSocket, setChatSocket] = React.useState<Socket | null>(null);

  React.useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setChatSocket(null);
      setChatConnected(false);
      return;
    }

    const wsURL = process.env.EXPO_PUBLIC_WS_URL;
    if (!wsURL) {
      throw new Error('Add EXPO_PUBLIC_WS_URL to the native env configuration.');
    }

    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const socket = io(`${wsURL}/chat`, {
      transports: ['websocket'],
      auth: async (cb) => {
        const token = await getFreshClerkToken(getTokenRef.current);
        cb({ token });
      },
    });

    socket.on('connect', () => {
      setChatConnected(true);
      socket.emit('heartbeat');

      heartbeat = setInterval(() => {
        if (socket.connected) {
          socket.emit('heartbeat');
        }
      }, 20_000);
    });

    socket.on('disconnect', () => {
      setChatConnected(false);
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
      }
    });

    setChatSocket(socket);

    return () => {
      if (heartbeat) {
        clearInterval(heartbeat);
      }

      socket.disconnect();
    };
  }, [isLoaded, isSignedIn]);

  React.useEffect(() => {
    if (isLoaded && isSignedIn) {
      return;
    }

    setChatSocket(null);
    setChatConnected(false);
  }, [isLoaded, isSignedIn]);

  const value = React.useMemo(
    () => ({
      chatSocket,
      chatConnected,
    }),
    [chatConnected, chatSocket],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return React.useContext(SocketContext);
}
