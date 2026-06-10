'use client';

import { useEffect, useMemo, useState } from 'react';
import { PencilLine, X, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  ConversationDTO,
  UpdateConversationInput,
} from '@repo/shared';
import { MediaItem } from '@/lib/types/media';
import { MediaType } from '@/models/social/enums/social.enum';
import { GroupAvatar } from '../../../_components/group-avatar';
import Image from 'next/image';

const EDIT_FALLBACK_AVATAR = '/images/placeholder-bg.png';

export const GroupHeader = ({
  conversation,
  isAdmin,
  isUpdating,
  onUpdateGroup,
}: {
  conversation: ConversationDTO;
  isAdmin: boolean;
  isUpdating: boolean;
  onUpdateGroup: (
    dto: UpdateConversationInput,
    media?: MediaItem,
    publicId?: string
  ) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const [groupName, setGroupName] = useState(conversation.groupName ?? '');
  const [avatarMedia, setAvatarMedia] = useState<MediaItem | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const originalName = useMemo(
    () => conversation.groupName ?? '',
    [conversation.groupName]
  );

  useEffect(() => {
    setIsEditing(false);
    setGroupName(conversation.groupName ?? '');
    setAvatarMedia(null);
    setAvatarPreview(null);
  }, [conversation._id, conversation.groupName, conversation.groupAvatar?.url]);

  useEffect(() => {
    if (!avatarMedia) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarMedia.file);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarMedia]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMedia({ file, type: MediaType.IMAGE });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setGroupName(originalName);
    setAvatarMedia(null);
    setAvatarPreview(null);
  };

  const handleSave = () => {
    const dto: UpdateConversationInput = {};
    const trimmed = groupName.trim();

    if (trimmed && trimmed !== (originalName || '')) dto.groupName = trimmed;

    onUpdateGroup(
      dto,
      avatarMedia ?? undefined,
      conversation.groupAvatar?.publicId
    );

    setIsEditing(false);
    setAvatarMedia(null);
    setAvatarPreview(null);
  };

  const displayName = conversation.groupName?.trim() || 'Nhóm không tên';

  // Avatar source logic for editing mode
  const editingAvatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    if (conversation.groupAvatar?.url) return conversation.groupAvatar.url;
    return EDIT_FALLBACK_AVATAR;
  }, [avatarPreview, conversation.groupAvatar?.url]);

  const hasGroupAvatar = !!conversation.groupAvatar?.url;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative shrink-0">
        {/* NOT editing */}
        {!isEditing ? (
          hasGroupAvatar ? (
            <div className="h-16 w-16">
              <Image
                src={conversation.groupAvatar!.url}
                alt="Group avatar"
                fill
                loading="lazy"
                className=" rounded-full object-cover border"
              />
            </div>
          ) : (
            <GroupAvatar conversation={conversation} size={80} />
          )
        ) : (
          // EDITING
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={editingAvatarSrc}
              alt="Group avatar (editing)"
              className="h-16 w-16 rounded-full object-cover border"
            />

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('group-avatar-input')?.click()
                  }
                  className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center gap-1 hover:bg-black/50 transition"
                  title="Đổi avatar"
                >
                  <PencilLine className="w-4 h-4 text-white" />
                  <span className="text-[11px] text-white">Đổi ảnh</span>
                </button>

                <input
                  id="group-avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Right content */}
      <div className="min-w-0 flex-1 flex">
        {!isEditing ? (
          <div className="flex flex-col items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-base font-semibold text-neutral-900 truncate">
                {displayName}
              </p>
            </div>

            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => setIsEditing(true)}
              >
                <PencilLine className="w-4 h-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              className="w-full text-base font-semibold text-neutral-900 bg-transparent border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhóm không tên"
              autoFocus
            />

            <div className="flex items-center gap-2 justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <X className="w-4 h-4" />
                Huỷ
              </Button>

              <Button
                type="button"
                size="sm"
                className="gap-2"
                onClick={handleSave}
                disabled={isUpdating}
              >
                <Check className="w-4 h-4" />
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
