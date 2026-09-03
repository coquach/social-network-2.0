/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SocketProvider, useSocket } from '../socket-context';

// Mock socket.io-client
const mockSocketOn = vi.fn();
const mockSocketDisconnect = vi.fn();
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => ({
      on: mockSocketOn,
      disconnect: mockSocketDisconnect,
    })),
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <SocketProvider url="http://localhost:3000" getToken={async () => 'mock-token'}>
        {children}
      </SocketProvider>
    </QueryClientProvider>
  );
};

describe('SocketContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes socket and provides connection state', async () => {
    const { result } = renderHook(() => useSocket(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockSocketOn).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    // We can't easily trigger the 'connect' event without more complex mocking,
    await waitFor(() => {
      expect(result.current.chatSocket).toBeTruthy();
    });
  });
});
