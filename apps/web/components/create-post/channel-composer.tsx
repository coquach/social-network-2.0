'use client';

import { CreatePostProvider } from './provider';
import { CreatePostFrame } from './frame';
import { CreatePostHeader } from './header';
import { CreatePostInput } from './input';
import { CreatePostMediaUpload } from './media-upload';
import { CreatePostMediaPreview } from './media-preview';
import { CreatePostActions } from './actions';
import { CreatePostFeelingButton } from './feeling-button';
import { CreatePostProps } from './types';

/**
 * ChannelComposer - Default composition for personal feed/channel
 * Includes full feature set with privacy controls
 */
export const ChannelComposer = ({
  placeholder = 'Bạn đang nghĩ gì?',
  isPrivacyChangeable = true,
}: Omit<CreatePostProps, 'children' | 'groupId'>) => {
  return (
    <CreatePostProvider
      placeholder={placeholder}
      isPrivacyChangeable={isPrivacyChangeable}
    >
      <CreatePostFrame>
        <CreatePostHeader />
        <CreatePostInput />
        <CreatePostMediaPreview />
        <div className="flex items-center justify-between border-t border-gray-200 pt-3 gap-2">
          <div className="flex items-center gap-3">
            <CreatePostMediaUpload />
          </div>
          <div className="flex items-center gap-2">
            <CreatePostFeelingButton />
            <CreatePostActions />
          </div>
        </div>
      </CreatePostFrame>
    </CreatePostProvider>
  );
};
