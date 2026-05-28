import { createContext, useContext } from 'react';

import type { CreatePostContextValue } from './types';

const CreatePostContext = createContext<CreatePostContextValue | null>(null);

export function CreatePostContextProvider({
  value,
  children,
}: {
  value: CreatePostContextValue;
  children: React.ReactNode;
}) {
  return (
    <CreatePostContext.Provider value={value}>
      {children}
    </CreatePostContext.Provider>
  );
}

export function useCreatePostContext(): CreatePostContextValue {
  const context = useContext(CreatePostContext);

  if (!context) {
    throw new Error(
      'Create post components must be used within CreatePostProvider.',
    );
  }

  return context;
}
