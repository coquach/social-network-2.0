import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useToast } from 'heroui-native/toast';

import {
  Audience,
  ReactionType,
  RootType,
  TargetType,
  useReact,
  useDisReact,
  useSharePost,
} from '@repo/shared';

import { ReactionPicker, ReactionOption } from '../modals/reaction-picker';
import { ShareBottomSheet } from '../modals/share-bottom-sheet';
import { AppToast } from '~/components/ui/app-toast';
import { appThemeColors } from '~/constants/theme';
import { useAppTheme } from '~/providers/theme-provider';

interface PostActionProps {
  reactType?: ReactionType;
  rootType: RootType;
  rootId: string;
  data: any;
  isShare?: boolean;
  disableCommentModal?: boolean;

  onPressComments?: (id: string, type: RootType) => void;
}

export const PostAction = React.memo(function PostAction({
  reactType,
  rootType,
  rootId,
  data,
  isShare = false,
  disableCommentModal = false,
  onPressComments,
}: PostActionProps) {
  /** ===================== THEME ===================== */
  const { resolvedTheme } = useAppTheme();
  const { toast } = useToast();
  const colors = appThemeColors[resolvedTheme];

  /** ===================== TARGET ===================== */
  const targetType: TargetType = useMemo(() => {
    return rootType === RootType.POST ? TargetType.POST : TargetType.SHARE;
  }, [rootType]);

  /** ===================== MUTATIONS ===================== */
  const { mutateAsync: react } = useReact();
  const { mutateAsync: disReact } = useDisReact();
  const sharePostMutation = useSharePost();

  /** ===================== STATE ===================== */
  const [selectedReaction, setSelectedReaction] = useState<
    ReactionType | undefined
  >(reactType);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const actionRowRef = useRef<View>(null);
  const [pickerAnchorY, setPickerAnchorY] = useState<number>();

  /** ===================== SYNC PROP ===================== */
  useEffect(() => {
    setSelectedReaction(reactType);
  }, [reactType, rootId]);

  /** ===================== REACTION OPTIONS ===================== */
  const reactionOptions: ReactionOption[] = useMemo(
    () => [
      { type: ReactionType.LIKE, emoji: '👍', label: 'Like' },
      { type: ReactionType.LOVE, emoji: '❤️', label: 'Love' },
      { type: ReactionType.HAHA, emoji: '😆', label: 'Haha' },
      { type: ReactionType.WOW, emoji: '😮', label: 'Wow' },
      { type: ReactionType.SAD, emoji: '😢', label: 'Sad' },
      { type: ReactionType.ANGRY, emoji: '😡', label: 'Angry' },
    ],
    [],
  );

  /** ===================== CORE LOGIC ===================== */
  const commitReaction = useCallback(
    async (next?: ReactionType) => {
      const prev = selectedReaction;

      // optimistic UI
      setSelectedReaction(next);

      try {
        if (!next) {
          await disReact({
            targetId: rootId,
            targetType,
          });
        } else {
          await react({
            targetId: rootId,
            targetType,
            reactionType: next,
          });
        }
      } catch (e) {
        console.error('Reaction failed:', e);
        setSelectedReaction(prev); // rollback nếu fail
      }
    },
    [selectedReaction, disReact, react, rootId, targetType],
  );

  /** ===================== QUICK LIKE ===================== */
  const handleQuickReact = useCallback(() => {
    const next = selectedReaction ? undefined : ReactionType.LIKE;
    commitReaction(next);
  }, [commitReaction, selectedReaction]);

  /** ===================== PICK FROM PICKER ===================== */
  const handleSelectReaction = useCallback(
    (reaction: ReactionType) => {
      setPickerOpen(false);

      const isSame = selectedReaction === reaction;
      const next = isSame ? undefined : reaction;

      commitReaction(next);
    },
    [commitReaction, selectedReaction],
  );

  /** ===================== OPEN PICKER ===================== */
  const openReactionPicker = useCallback(() => {
    if (!actionRowRef.current) {
      setPickerOpen(true);
      return;
    }

    actionRowRef.current.measureInWindow((_x, y, _w, h) => {
      setPickerAnchorY(y + h / 2);
      setPickerOpen(true);
    });
  }, []);

  /** ===================== SHARE ===================== */
  const resolvedPostId = useMemo(() => {
    if (rootType === RootType.POST) return data?.postId;
    return data?.post?.postId;
  }, [data, rootType]);

  const handleShareSubmit = useCallback(
    async (payload: { content: string; audience: Audience }) => {
      if (!resolvedPostId) {
        throw new Error('Missing postId');
      }

      await sharePostMutation.mutateAsync({
        postId: resolvedPostId,
        content: payload.content,
        audience: payload.audience,
      });
    },
    [resolvedPostId, sharePostMutation],
  );

  const handleShareSuccess = useCallback(() => {
    toast.show({
      duration: 2500,
      component: (toastProps) => (
        <AppToast
          toast={{
            title: 'Chia sẻ thành công',
            message: 'Bài viết đã được chia sẻ.',
            variant: 'success',
          }}
          toastProps={toastProps}
        />
      ),
    });
  }, [toast]);

  /** ===================== UI ===================== */
  const selected = reactionOptions.find((r) => r.type === selectedReaction);

  const handleCommentPress = useCallback(() => {
    if (!disableCommentModal) {
      onPressComments?.(rootId, rootType);
    }
  }, [disableCommentModal, onPressComments, rootId, rootType]);

  return (
    <View className="relative border-t border-app-border/50 pt-2">
      {/* Lazy mount overlays to keep feed row render light */}
      {(pickerOpen || shareSheetOpen) && (
        <>
          {pickerOpen && (
            <ReactionPicker
              open={pickerOpen}
              anchorY={pickerAnchorY}
              options={reactionOptions}
              onSelectReaction={handleSelectReaction}
              onClose={() => setPickerOpen(false)}
            />
          )}

          {shareSheetOpen && (
            <ShareBottomSheet
              isOpen={shareSheetOpen}
              onOpenChange={setShareSheetOpen}
              onSubmit={handleShareSubmit}
              onSubmitSuccess={handleShareSuccess}
            />
          )}
        </>
      )}

      <View ref={actionRowRef} className="flex-row items-stretch gap-1.5">
        {/* LIKE */}
        <Pressable
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-transparent px-2.5 py-2.5 active:opacity-70 active:scale-[0.98]"
          onPress={handleQuickReact}
          onLongPress={openReactionPicker}
        >
          {selected ? (
            <Text className="text-[18px]">{selected.emoji}</Text>
          ) : (
            <Ionicons
              name="thumbs-up-outline"
              size={22}
              color={colors.mutedForeground}
            />
          )}
          <Text
            className={
              selected
                ? 'text-[13px] font-semibold text-app-primary'
                : 'text-[13px] font-semibold text-app-fg'
            }
          >
            {selected?.label ?? 'Like'}
          </Text>
        </Pressable>

        {/* COMMENT */}
        <Pressable
          className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-transparent px-2.5 py-2.5 active:opacity-70 active:scale-[0.98]"
          onPress={handleCommentPress}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={colors.mutedForeground}
          />
          <Text className="text-[13px] font-semibold text-app-fg">Comment</Text>
        </Pressable>

        {/* SHARE */}
        {isShare && rootType === RootType.POST && (
          <Pressable
            className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-transparent px-2.5 py-2.5 active:opacity-70 active:scale-[0.98]"
            onPress={() => setShareSheetOpen(true)}
          >
            <Ionicons
              name="paper-plane-outline"
              size={22}
              color={colors.mutedForeground}
            />
            <Text className="text-[13px] font-semibold text-app-fg">Share</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});
