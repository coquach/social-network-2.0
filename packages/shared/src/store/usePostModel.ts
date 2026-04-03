import {
  PostSnapshotDTO,
  RootType,
  SharePostSnapshotDTO,
  TargetType,
} from '@repo/shared';
import { create } from 'zustand';

/* =========================
   Reaction Modal
========================= */
interface ReactionModalState {
  isOpen: boolean;
  targetId?: string;
  targetType?: TargetType;

  openModal: (payload: { targetId: string; targetType: TargetType }) => void;
  closeModal: () => void;
}

export const useReactionModal = create<ReactionModalState>((set) => ({
  isOpen: false,
  targetId: undefined,
  targetType: undefined,

  openModal: ({ targetId, targetType }) =>
    set({ isOpen: true, targetId, targetType }),

  closeModal: () =>
    set({ isOpen: false, targetId: undefined, targetType: undefined }),
}));

/* =========================
   Comment Modal
========================= */
interface CommentModalState {
  isOpen: boolean;
  rootId?: string;
  rootType?: RootType;
  userId?: string;
  data?: PostSnapshotDTO | SharePostSnapshotDTO;

  openModal: (payload: {
    rootId: string;
    rootType: RootType;
    userId: string;
    data: PostSnapshotDTO | SharePostSnapshotDTO;
  }) => void;

  closeModal: () => void;
}

export const useCommentModal = create<CommentModalState>((set) => ({
  isOpen: false,
  rootId: undefined,
  rootType: undefined,

  openModal: ({ rootId, rootType }) => set({ isOpen: true, rootId, rootType }),

  closeModal: () =>
    set({ isOpen: false, rootId: undefined, rootType: undefined }),
}));

/* =========================
   Delete Comment Modal
========================= */
interface DeleteCommentModalState {
  isOpen: boolean;
  commentId?: string;
  rootId?: string;

  openModal: (payload: { rootId: string; commentId: string }) => void;
  closeModal: () => void;
}

export const useDeleteCommentModal = create<DeleteCommentModalState>((set) => ({
  isOpen: false,
  commentId: undefined,
  rootId: undefined,

  openModal: ({ rootId, commentId }) =>
    set({ isOpen: true, rootId, commentId }),

  closeModal: () =>
    set({ isOpen: false, rootId: undefined, commentId: undefined }),
}));

/* =========================
   Share Modal
========================= */
interface CreateShareModalState {
  isOpen: boolean;
  postId?: string;

  openModal: (postId: string) => void;
  closeModal: () => void;
}

export const useCreateShareModal = create<CreateShareModalState>((set) => ({
  isOpen: false,
  postId: undefined,

  openModal: (postId) => set({ isOpen: true, postId }),

  closeModal: () => set({ isOpen: false, postId: undefined }),
}));

/* =========================
   Share List Modal
========================= */
interface ShareListModalState {
  isOpen: boolean;
  postId?: string;

  openModal: (postId: string) => void;
  closeModal: () => void;
}

export const useShareListModal = create<ShareListModalState>((set) => ({
  isOpen: false,
  postId: undefined,

  openModal: (postId) => set({ isOpen: true, postId }),

  closeModal: () => set({ isOpen: false, postId: undefined }),
}));

/* =========================
   Update Post Modal
========================= */
interface UpdatePostModalState {
  isOpen: boolean;
  postId?: string;

  openModal: (postId: string) => void;
  closeModal: () => void;
}

export const useUpdatePostModal = create<UpdatePostModalState>((set) => ({
  isOpen: false,
  postId: undefined,

  openModal: (postId) => set({ isOpen: true, postId }),

  closeModal: () => set({ isOpen: false, postId: undefined }),
}));

/* =========================
   Update Share Modal
========================= */
interface UpdateSharePostModalState {
  isOpen: boolean;
  shareId?: string;

  openModal: (shareId: string) => void;
  closeModal: () => void;
}

export const useUpdateSharePostModal = create<UpdateSharePostModalState>(
  (set) => ({
    isOpen: false,
    shareId: undefined,

    openModal: (shareId) => set({ isOpen: true, shareId }),

    closeModal: () => set({ isOpen: false, shareId: undefined }),
  }),
);

/* =========================
   Delete Post Modal
========================= */
interface DeletePostModalState {
  isOpen: boolean;
  postId?: string;
  shareId?: string;
  isShare?: boolean;

  openModal: (payload: {
    postId: string;
    isShare?: boolean;
    shareId?: string;
  }) => void;

  closeModal: () => void;
}

export const useDeletePostModal = create<DeletePostModalState>((set) => ({
  isOpen: false,
  postId: undefined,
  shareId: undefined,
  isShare: undefined,

  openModal: ({ postId, isShare, shareId }) =>
    set({ isOpen: true, postId, isShare, shareId }),

  closeModal: () =>
    set({
      isOpen: false,
      postId: undefined,
      shareId: undefined,
      isShare: undefined,
    }),
}));
