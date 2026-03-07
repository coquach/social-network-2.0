import { RootType, TargetType } from '@/models/social/enums/social.enum';
import { PostSnapshotDTO } from '@/models/social/post/postDTO';
import { SharePostSnapshotDTO } from '@/models/social/post/sharePostDTO';
import { create } from 'zustand';

interface ReactionModalStore {
  targetId: string | null;
  targetType: TargetType | null;
  isOpen: boolean;
  openModal: (targetType: TargetType, targetId: string) => void;
  closeModal: () => void;
}
export const useReactionModal = create<ReactionModalStore>((set) => ({
  targetId: null,
  targetType: null,
  isOpen: false,
  openModal: (targetType: TargetType, targetId: string) =>
    set({ isOpen: true, targetType, targetId }),
  closeModal: () => set({ isOpen: false, targetId: null, targetType: null }),
}));

interface CommentModalStore {
  rootId: string | null;
  rootType: RootType | null;
  ownerPostId: string | null;
  data?: PostSnapshotDTO | SharePostSnapshotDTO;
  isOpen: boolean;
  openModal: (
    rootId: string,
    rootType: RootType,
    ownerPostId: string,
    data?: PostSnapshotDTO | SharePostSnapshotDTO
  ) => void;
  closeModal: () => void;
}

export const useCommentModal = create<CommentModalStore>((set) => ({
  rootId: null,
  rootType: null,
  ownerPostId: null,
  data: undefined,
  isOpen: false,
  openModal: (rootId, rootType, ownerPostId, data) =>
    set({ isOpen: true, rootId, rootType, ownerPostId, data }),
  closeModal: () =>
    set({ isOpen: false, rootId: null, rootType: null, data: undefined }),
}));

interface DeleteCommentModalStore {
  isOpen: boolean;
  commentId: string | null;
  rootId: string | null;
  openModal: (rootId: string, commentId: string) => void;
  closeModal: () => void;
}
export const useDeleteCommentModal = create<DeleteCommentModalStore>((set) => ({
  isOpen: false,
  commentId: null,
  rootId: null,
  openModal: (rootId: string, commentId: string) =>
    set({ isOpen: true, commentId, rootId }),
  closeModal: () => set({ isOpen: false, commentId: null, rootId: null }),
}));

interface CreateShareModalStore {
  data?: PostSnapshotDTO;
  isOpen: boolean;
  openModal: (data: PostSnapshotDTO) => void;
  closeModal: () => void;
}
export const useCreateShareModal = create<CreateShareModalStore>((set) => ({
  postRootId: undefined,
  data: undefined,
  isOpen: false,
  openModal: (data: PostSnapshotDTO) => set({ isOpen: true, data }),
  closeModal: () => set({ isOpen: false, data: undefined }),
}));

interface ShareListModalState {
  isOpen: boolean;
  postId: string | null;
  openModal: (postId: string) => void;
  closeModal: () => void;
}

export const useShareListModal = create<ShareListModalState>((set) => ({
  isOpen: false,
  postId: null,
  openModal: (postId) => set({ isOpen: true, postId }),
  closeModal: () => set({ isOpen: false, postId: null }),
}));

interface UpdatePostModalStore {
  data?: PostSnapshotDTO | null;
  isOpen: boolean;
  openModal: (data: PostSnapshotDTO) => void;
  closeModal: () => void;
}

export const useUpdatePostModal = create<UpdatePostModalStore>((set) => ({
  data: null,
  isOpen: false,
  openModal: (data: PostSnapshotDTO) => set({ isOpen: true, data }),
  closeModal: () => set({ isOpen: false, data: null }),
}));

interface UpdateSharePostModalStore {
  data?: SharePostSnapshotDTO | null;
  isOpen: boolean;
  openModal: (data: SharePostSnapshotDTO) => void;
  closeModal: () => void;
}
export const useUpdateSharePostModal = create<UpdateSharePostModalStore>(
  (set) => ({
    data: null,
    isOpen: false,
    openModal: (data: SharePostSnapshotDTO) => set({ isOpen: true, data }),
    closeModal: () => set({ isOpen: false, data: null }),
  })
);

interface DeletePostModalStore {
  isOpen: boolean;
  postId?: string | null;
  shareId?: string | null;
  isShare: boolean;

  openModal: (postId: string, isShare: boolean, shareId?: string) => void;
  closeModal: () => void;
}

export const useDeletePostModal = create<DeletePostModalStore>((set) => ({
  isOpen: false,
  postId: null,
  shareId: null,
  isShare: false,
  openModal: (postId: string, isShare: boolean, shareId?: string) =>
    set({ isOpen: true, postId, isShare, shareId }),
  closeModal: () => set({ isOpen: false, postId: null }),
}));
