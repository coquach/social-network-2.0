import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatRelativeTime } from '~/utils/format-relative-time';
import { useUser } from '@repo/shared';
import type {
  Audience,
  PostSnapshotDTO,
  SharePostSnapshotDTO,
} from '@repo/shared';

import { usePostOptionsStore } from '~/store/use-post-options-store';

// ─── Props ─────────────────────────────────────────────

export interface PostHeaderProps {
  postId?: string;
  shareId?: string;
  data: PostSnapshotDTO | SharePostSnapshotDTO;
  createdAt: Date;
  audience: Audience;
  isShared?: boolean;
  showSettings?: boolean;
  compact?: boolean;
}

// ─── Component ─────────────────────────────────────────

function PostHeaderComponent({
  postId,
  shareId,
  data,
  createdAt,
  audience,
  isShared = false,
  showSettings = true,
  compact = false,
}: PostHeaderProps) {
  const { userId: currentUserId } = useAuth();
  const router = useRouter();
  const openPostOptions = usePostOptionsStore((s) => s.openPostOptions);

  // User
  const { data: author } = useUser(data.userId);

  const isOwner = currentUserId === data.userId;

  const createdText = React.useMemo(() => {
    const rel = formatRelativeTime(createdAt);
    return rel.replace(' ago', '');
  }, [createdAt]);

  const audienceInfo = React.useMemo(() => {
    if (audience === 'PUBLIC') return { icon: 'globe-outline' as const };
    if (audience === 'FRIENDS') return { icon: 'people-outline' as const };
    return { icon: 'lock-closed-outline' as const };
  }, [audience]);

  const mainEmotion = React.useMemo(() => {
    if (isShared || !('mainEmotion' in data) || !data.mainEmotion) return null;

    const emotionMap: Record<string, string> = {
      JOY: '😊',
      SADNESS: '😢',
      ANGER: '😡',
      FEAR: '😨',
      DISGUST: '🤢',
      SURPRISE: '😮',
      NEUTRAL: '😐',
    };

    return emotionMap[data.mainEmotion] ?? null;
  }, [data, isShared]);

  const group = React.useMemo(() => {
    if (isShared) return undefined;
    if ('group' in data) return data.group;
    return undefined;
  }, [data, isShared]);

  const displayName = React.useMemo(() => {
    const first = author?.firstName?.trim();
    const last = author?.lastName?.trim();
    return [first, last].filter(Boolean).join(' ') || 'Người dùng';
  }, [author?.firstName, author?.lastName]);

  const initials = React.useMemo(() => {
    const parts = displayName.split(' ').filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }, [displayName]);

  const goToUser = React.useCallback(() => {
    if (isOwner) {
      router.push(`/(main)/profile` as never);
    } else {
      router.push(`/(stack)/user/${data.userId}` as never);
    }
  }, [data.userId, isOwner, router]);

  const goToGroup = React.useCallback(() => {
    if (!group?.id) return;
    router.push(`/groups/${group.id}` as never);
  }, [group?.id, router]);

  const handleMenuPress = React.useCallback(() => {
    console.log('[PostHeader] Menu button pressed for post:', {
      postId,
      shareId,
      isShared,
    });
    openPostOptions({
      postId,
      shareId,
      isShared,
      isOwner,
    });
  }, [openPostOptions, postId, shareId, isShared, isOwner]);

  // ─── UI ──────────────────────────────────────────────

  return (
    <>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1 flex-row items-start gap-2">
          {/* Avatar */}
          <Pressable onPress={group ? goToGroup : goToUser}>
            <View className={compact ? 'h-9 w-9' : 'h-11 w-11'}>
              {/* CASE 1: Có group */}
              {group ? (
                <>
                  {/* Group avatar */}
                  {group.avatarUrl ? (
                    <Image
                      source={{ uri: group.avatarUrl, cache: 'force-cache' }}
                      className="h-full w-full rounded-full border border-app-border"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center rounded-full border border-app-border bg-app-surface">
                      <Text className="text-xs font-bold text-app-primary">
                        {group.name?.[0] ?? 'G'}
                      </Text>
                    </View>
                  )}

                  {/* User avatar overlay */}
                  <View className="absolute -bottom-1 -right-1 h-7 w-7 overflow-hidden rounded-full border border-white">
                    {author?.avatarUrl ? (
                      <Image
                        source={{ uri: author.avatarUrl, cache: 'force-cache' }}
                        className="h-full w-full"
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center bg-app-primary/20">
                        <Text className="text-[9px] font-bold text-app-primary">
                          {initials}
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              ) : /* CASE 2: Không có group → show author full */
              author?.avatarUrl ? (
                <Image
                  source={{ uri: author.avatarUrl, cache: 'force-cache' }}
                  className="h-full w-full rounded-full border border-app-border"
                />
              ) : (
                <View className="h-full w-full items-center justify-center rounded-full border border-app-border bg-app-surface">
                  <Text className="text-xs font-bold text-app-primary">
                    {initials}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* Info */}
          <View className="flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-x-1 gap-y-0.5">
              <Pressable onPress={goToUser}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className={
                    compact
                      ? 'max-w-45 text-[14px] font-semibold text-app-fg'
                      : 'max-w-50 text-[15px] font-semibold text-app-fg'
                  }
                >
                  {displayName}
                </Text>
              </Pressable>

              {isShared && (
                <Text className="text-[12px] text-app-muted-fg">
                  đã chia sẻ
                </Text>
              )}

              {group?.name && (
                <View className="flex-row min-w-0 items-center gap-1">
                  <Text className="text-[12px] text-app-muted-fg">trong</Text>

                  <Pressable onPress={goToGroup} className="max-w-40 shrink">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-[14px] font-semibold text-app-fg"
                    >
                      {group.name}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <Text className="text-[12px] text-app-muted-fg">
                {createdText}
              </Text>

              <Text className="text-[12px] text-app-muted-fg">•</Text>

              <Ionicons name={audienceInfo.icon} size={11} color="#64748b" />

              <Text className="text-[12px] text-app-muted-fg">•</Text>

              {mainEmotion && (
                <Text className="text-[12px] text-app-muted-fg">
                  {mainEmotion}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Menu Button */}
        {showSettings && (
          <Pressable
            onPress={handleMenuPress}
            className="h-9 w-9 items-center justify-center rounded-full bg-app-surface/70 active:opacity-70"
          >
            <Ionicons name="ellipsis-horizontal" size={19} color="#64748b" />
          </Pressable>
        )}
      </View>
    </>
  );
}

export const PostHeader = React.memo(PostHeaderComponent);
