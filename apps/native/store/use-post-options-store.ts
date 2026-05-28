import { create } from 'zustand';

export interface PostOptionsState {
  isOpen: boolean;
  postId: string | null;
  shareId: string | null;
  isShared: boolean;
  isOwner: boolean;
  targetType: 'post' | 'share' | null;
}

interface PostOptionsStore extends PostOptionsState {
  openPostOptions: (options: {
    postId?: string;
    shareId?: string;
    isShared: boolean;
    isOwner: boolean;
  }) => void;
  closePostOptions: () => void;
  resetPostOptions: () => void;
}

const initialState: PostOptionsState = {
  isOpen: false,
  postId: null,
  shareId: null,
  isShared: false,
  isOwner: false,
  targetType: null,
};

export const usePostOptionsStore = create<PostOptionsStore>((set, get) => {
  // Log store creation
  console.log('[PostOptionsStore] Created with initial state:', initialState);

  return {
    ...initialState,

    openPostOptions: (options) => {
      const { postId, shareId, isShared, isOwner } = options;

      const newState = {
        isOpen: true,
        postId: postId ?? null,
        shareId: shareId ?? null,
        isShared,
        isOwner,
        targetType: isShared ? ('share' as const) : ('post' as const),
      };

      console.log('[PostOptionsStore] Opening with state:', newState);
      set(newState);
    },

    closePostOptions: () => {
      const current = get();
      if (current.isOpen) {
        console.log('[PostOptionsStore] Closing');
        set({ isOpen: false });
      }
    },

    resetPostOptions: () => {
      console.log('[PostOptionsStore] Resetting to initial state');
      set(initialState);
    },
  };
});
