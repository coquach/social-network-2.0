import { create } from 'zustand';

type CreatePostModalState = {
  isOpen: boolean;
  groupId?: string;
  open: (groupId?: string) => void;
  close: () => void;
};

export const useCreatePostModal = create<CreatePostModalState>((set) => ({
  isOpen: false,
  groupId: undefined,
  open: (groupId) => set({ isOpen: true, groupId }),
  close: () => set({ isOpen: false, groupId: undefined }),
}));
