'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

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
  () => import('../modals/update-share-modal').then((mod) => ({ default: mod.UpdateSharePostModal })),
  { loading: () => null, ssr: false }
);

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

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
