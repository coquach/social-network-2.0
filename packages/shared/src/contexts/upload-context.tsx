'use client';

/**
 * Upload Context
 * Provides platform-agnostic file upload functionality via dependency injection
 * 
 * Usage:
 * - Web: Provide Cloudinary/S3 implementation
 * - Mobile: Provide native upload implementation
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import type { IUploadService } from '../types/upload.types';

interface UploadContextValue {
  uploadService: IUploadService | null;
}

const UploadContext = createContext<UploadContextValue>({
  uploadService: null,
});

interface UploadProviderProps {
  children: ReactNode;
  uploadService: IUploadService;
}

/**
 * Provider component for upload service
 * Platform must wrap app with this provider and inject implementation
 */
export const UploadProvider: React.FC<UploadProviderProps> = ({
  children,
  uploadService,
}) => {
  return (
    <UploadContext.Provider value={{ uploadService }}>
      {children}
    </UploadContext.Provider>
  );
};

/**
 * Hook to access upload service
 * Throws error if used outside provider or service not configured
 */
export const useUpload = (): IUploadService => {
  const context = useContext(UploadContext);
  
  if (!context.uploadService) {
    throw new Error(
      'useUpload must be used within UploadProvider and uploadService must be configured'
    );
  }
  
  return context.uploadService;
};

/**
 * Hook to check if upload is available (optional usage)
 */
export const useUploadOptional = (): IUploadService | null => {
  const context = useContext(UploadContext);
  return context.uploadService;
};
