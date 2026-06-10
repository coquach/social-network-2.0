'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

/**
 * useFocusRestoration - Stores and restores focus after modals close
 * Improves keyboard navigation UX by returning focus to trigger element
 */
function useFocusRestoration() {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Store the currently focused element when component mounts
    const storeFocus = () => {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }
    };

    // Restore focus when modal closes
    const restoreFocus = () => {
      // Check if any modal/dialog is currently open
      const hasOpenDialog = document.querySelector('[role="dialog"][data-state="open"]');
      
      if (!hasOpenDialog && previousActiveElementRef.current) {
        // Small delay to ensure modal fade-out completes
        setTimeout(() => {
          previousActiveElementRef.current?.focus();
          previousActiveElementRef.current = null;
        }, 100);
      }
    };

    // Listen for focus changes to capture modal triggers
    document.addEventListener('focusin', storeFocus);
    
    // Listen for dialog state changes (Radix UI)
    const observer = new MutationObserver(() => {
      restoreFocus();
    });

    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state'],
    });

    return () => {
      document.removeEventListener('focusin', storeFocus);
      observer.disconnect();
    };
  }, []);
}

// Dynamic imports for heavy modals to reduce initial bundle size
// Loading state prevents flash of unstyled content
const ProfileModal = dynamic(
  () => import('../modals/profile-modal').then((mod) => ({ default: mod.ProfileModal })),
  { loading: () => null, ssr: false }
);

const ImageViewerModal = dynamic(
  () => import('../modals/image-viewer-modal').then((mod) => ({ default: mod.ImageViewerModal })),
  { loading: () => null, ssr: false }
);

const PostReactionsModal = dynamic(
  () => import('../modals/reaction-modal').then((mod) => ({ default: mod.PostReactionsModal })),
  { loading: () => null, ssr: false }
);

const DeleteCommentModal = dynamic(
  () => import('../modals/delete-comment-modal').then((mod) => ({ default: mod.DeleteCommentModal })),
  { loading: () => null, ssr: false }
);

const CreateShareModal = dynamic(
  () => import('../modals/create-share-modal').then((mod) => ({ default: mod.CreateShareModal })),
  { loading: () => null, ssr: false }
);

const ShareListModal = dynamic(
  () => import('../modals/shares-list-modal').then((mod) => ({ default: mod.ShareListModal })),
  { loading: () => null, ssr: false }
);

const DeletePostModal = dynamic(
  () => import('../modals/delete-post-modal').then((mod) => ({ default: mod.DeletePostModal })),
  { loading: () => null, ssr: false }
);

const UpdatePostModal = dynamic(
  () => import('../modals/update-post-modal').then((mod) => ({ default: mod.UpdatePostModal })),
  { loading: () => null, ssr: false }
);

const UpdateSharePostModal = dynamic(
  () => import('../modals/update-share-modal').then((mod) => ({ default: mod.UpdateShareModal })),
  { loading: () => null, ssr: false }
);

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Enable focus restoration for all modals
  useFocusRestoration();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) return null;

  return (
    <>
      <ProfileModal />
      <ImageViewerModal />
      <PostReactionsModal />
      <DeleteCommentModal />
      <CreateShareModal />
      <ShareListModal />
      <DeletePostModal />
      <UpdatePostModal />
      <UpdateSharePostModal />
    </>
  );
};
