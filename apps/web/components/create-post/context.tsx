'use client';

import { createContext, useContext } from 'react';
import { CreatePostContextValue } from './types';

/**
 * Context for sharing CreatePost state across compound components
 */
export const CreatePostContext = createContext<CreatePostContextValue | null>(null);

/**
 * Hook to access CreatePost context
 * @throws Error if used outside CreatePost provider
 */
export const useCreatePostContext = (): CreatePostContextValue => {
  const context = useContext(CreatePostContext);
  
  if (!context) {
    throw new Error(
      'CreatePost compound components must be used within CreatePost.Provider or CreatePost root component'
    );
  }
  
  return context;
};
