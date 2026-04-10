import { QueryClientProvider } from '@tanstack/react-query';
import { createSharedQueryClient } from '@repo/shared/utils';
import React from 'react';

type QueryProviderProps = {
  children: React.ReactNode;
};

export function NativeQueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = React.useState(() => createSharedQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
