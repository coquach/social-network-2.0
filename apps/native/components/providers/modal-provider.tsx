import React from 'react';
import { CreateReportModal } from '../modals/create-report-modal';
import { PostEditHistoryModal } from '../modals/post-edit-history-modal';
import { ReactionModal } from '../modals/reaction-modal';
import { ShareBottomSheet } from '../modals/share-bottom-sheet';
import { ShareListModal } from '../modals/share-list-modal';
import { CreatePostSheet } from '../create-post/create-post-sheet';
import { PostOptionsBottomSheet } from '../modals/post-options-bottom-sheet';
import { DeletePostModal } from '../modals/delete-post-modal';

/**
 * Global ModalProvider - mounts all post-related global modals once at root level.
 *
 * Modals are controlled via Zustand stores (useReactionModal, useShareListModal, etc.).
 * Components ONLY trigger openModal() - they DO NOT render these modals locally.
 *
 * Benefits:
 * - Single instance per modal (no duplicates per list item)
 * - FlatList virtualization compatible
 * - Matches web ModalProvider architecture
 */
export function ModalProvider() {
  return (
    <>
      <ReactionModal />
      <ShareListModal />
      <ShareBottomSheet />
      <CreateReportModal />
      <PostEditHistoryModal />
      <PostOptionsBottomSheet />
      <DeletePostModal />
      <CreatePostSheet />
    </>
  );
}
