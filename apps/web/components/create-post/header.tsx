'use client';

import { CreatePostAvatar } from '@/components/avatar';
import { AudienceSelect } from '@/components/audience-select';
import { Audience } from '@repo/shared';
import { useCreatePostContext } from './context';
import { CreatePostComponentProps } from './types';
import { cn } from '@/lib/utils';

/**
 * Header - Top section with avatar, audience selector, and feeling display
 */
export const CreatePostHeader = ({ className }: Omit<CreatePostComponentProps, 'children'>) => {
  const { form, userId, groupId, isPrivacyChangeable, selectedFeeling } = useCreatePostContext();

  return (
    <div className={cn('flex items-center gap-3 flex-wrap', className)}>
      <CreatePostAvatar userId={userId} showName={!!groupId} />

      {isPrivacyChangeable && (
        <form.Field name="audience">
          {(field: any) => (
            <AudienceSelect
              value={field.state.value as Audience}
              onChange={(value) => field.handleChange(value as Audience)}
            />
          )}
        </form.Field>
      )}

      {selectedFeeling && (
        <div className="text-sm text-neutral-400 flex items-center gap-1">
          <span>đang cảm thấy</span>
          <span className="text-base">{selectedFeeling.emoji}</span>
          <span className="font-medium text-neutral-500">
            {selectedFeeling.name}
          </span>
        </div>
      )}
    </div>
  );
};
