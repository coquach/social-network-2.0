'use client';

import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { CreatePostProvider } from './provider';
import { CreatePostFrame } from './frame';
import { CreatePostHeader } from './header';
import { CreatePostInput } from './input';
import { CreatePostMediaUpload } from './media-upload';
import { CreatePostMediaPreview } from './media-preview';
import { CreatePostActions } from './actions';
import { CreatePostFeelingButton } from './feeling-button';

// Re-export all compound components
export { CreatePostProvider } from './provider';
export { CreatePostFrame } from './frame';
export { CreatePostHeader } from './header';
export { CreatePostInput } from './input';
export { CreatePostMediaUpload } from './media-upload';
export { CreatePostMediaPreview } from './media-preview';
export { CreatePostActions } from './actions';
export { CreatePostFeelingButton } from './feeling-button';

// Re-export convenience wrappers
export { ChannelComposer } from './channel-composer';
export { GroupComposer } from './group-composer';

// Re-export types
export type { CreatePostProps, CreatePostComponentProps, CreatePostContextValue } from './types';

/**
 * CreatePost - Compound component with flexible composition
 * 
 * Usage examples:
 * 
 * 1. Simple channel composer (default):
 *    <ChannelComposer />
 * 
 * 2. Group composer:
 *    <GroupComposer groupId="123" />
 * 
 * 3. Custom composition:
 *    <CreatePost.Provider placeholder="Custom...">
 *      <CreatePost.Frame>
 *        <CreatePost.Header />
 *        <CreatePost.Input />
 *        <CreatePost.MediaPreview />
 *        <div className="flex justify-between">
 *          <CreatePost.MediaUpload />
 *          <CreatePost.Actions />
 *        </div>
 *      </CreatePost.Frame>
 *    </CreatePost.Provider>
 */
export const CreatePost = Object.assign(CreatePostProvider, {
  Provider: CreatePostProvider,
  Frame: CreatePostFrame,
  Header: CreatePostHeader,
  Input: CreatePostInput,
  MediaUpload: CreatePostMediaUpload,
  MediaPreview: CreatePostMediaPreview,
  Actions: CreatePostActions,
  FeelingButton: CreatePostFeelingButton,
  
  // Loading skeleton
  Skeleton: function CreatePostSkeleton() {
    return (
      <Card className="w-full bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </Card>
    );
  },
});
