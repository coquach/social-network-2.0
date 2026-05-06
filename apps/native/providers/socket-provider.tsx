import { useAuth } from "@clerk/expo";
import React from "react";
import { AppState, type AppStateStatus } from "react-native";
import { io, type Socket } from "socket.io-client";
import { getFreshClerkToken } from "~/utils/clerk-auth";

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
  const appStateRef = React.useRef<AppStateStatus>(AppState.currentState);
  const [chatConnected, setChatConnected] = React.useState(false);
  const [chatSocket, setChatSocket] = React.useState<Socket | null>(null);

  const debugLog = React.useCallback((event: string, details?: unknown) => {
    if (!__DEV__) {
      return;
    }

    if (details === undefined) {
      console.log(`[Native Chat Socket] ${event}`);
      return;
    }

    console.log(`[Native Chat Socket] ${event}`, details);
  }, []);

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
      throw new Error(
        "Add EXPO_PUBLIC_WS_URL to the native env configuration.",
      );
    }

    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const socket = io(`${wsURL}/chat`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000,
      auth: async (cb) => {
        const token = await getFreshClerkToken(getTokenRef.current);
        cb({ token });
      },
    });

    const emitHeartbeat = () => {
      if (socket.connected) {
        debugLog("emit heartbeat", { socketId: socket.id });
        socket.emit("heartbeat");
      }
    };

    const startHeartbeat = () => {
      if (heartbeat) {
        clearInterval(heartbeat);
      }

      heartbeat = setInterval(() => {
        emitHeartbeat();
      }, 20_000);

      debugLog("start heartbeat interval", { socketId: socket.id });
    };

    const stopHeartbeat = () => {
      if (heartbeat) {
        clearInterval(heartbeat);
        heartbeat = null;
        debugLog("stop heartbeat interval", { socketId: socket.id });
      }
    };

    socket.on("connect", () => {
      setChatConnected(true);
      debugLog("connected", {
        socketId: socket.id,
        transport: socket.io.engine.transport.name,
      });
      emitHeartbeat();
      startHeartbeat();
    });

    socket.on("disconnect", (reason) => {
      setChatConnected(false);
      debugLog("disconnected", { socketId: socket.id, reason });
      stopHeartbeat();
    });

    socket.on("connect_error", (error) => {
      setChatConnected(false);
      debugLog("connect error", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      stopHeartbeat();
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        const previousAppState = appStateRef.current;
        appStateRef.current = nextAppState;
        debugLog("app state changed", {
          previousAppState,
          nextAppState,
          connected: socket.connected,
          active: socket.active,
        });

        const becameActive =
          previousAppState.match(/inactive|background/) &&
          nextAppState === "active";

        if (becameActive) {
          if (socket.connected) {
            debugLog("app active with live socket, re-emitting heartbeat", {
              socketId: socket.id,
            });
            emitHeartbeat();
            startHeartbeat();
            return;
          }

          if (!socket.active) {
            debugLog("app active, reconnecting socket");
            socket.connect();
          }
          return;
        }

        if (nextAppState === "background") {
          debugLog("app background, disconnecting socket", {
            socketId: socket.id,
          });
          stopHeartbeat();

          if (socket.connected || socket.active) {
            socket.disconnect();
          }
        }
      },
    );

    setChatSocket(socket);
    debugLog("socket instance created", { wsURL: `${wsURL}/chat` });

    return () => {
      debugLog("cleanup socket provider", { socketId: socket.id });
      stopHeartbeat();

      appStateSubscription.remove();
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [debugLog, isLoaded, isSignedIn]);

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

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return React.useContext(SocketContext);
}
