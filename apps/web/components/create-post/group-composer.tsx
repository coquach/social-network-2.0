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
 * GroupComposer - Composition for group posts
 * No privacy selector (uses group privacy)
 */
export const GroupComposer = ({
  placeholder = 'Viết gì đó cho nhóm...',
  groupId,
}: Required<Pick<CreatePostProps, 'groupId'>> & Omit<CreatePostProps, 'children' | 'isPrivacyChangeable'>) => {
  return (
    <CreatePostProvider
      placeholder={placeholder}
      groupId={groupId}
      isPrivacyChangeable={false}
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
