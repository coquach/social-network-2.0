'use client';

import React from 'react';
import { ReactionModal } from '../modals/reaction-modal';
import { ShareListModal } from '../modals/share-list-modal';

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
    </>
  );
}
