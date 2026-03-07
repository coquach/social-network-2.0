import { create } from 'zustand';

interface ImageViewerModalStore {
  isOpen: boolean;
  src?: string;
  alt?: string;
  onOpen: (src: string, alt?: string) => void;
  onClose: () => void;
}

export const useImageViewerModal = create<ImageViewerModalStore>((set) => ({
  isOpen: false,
  src: undefined,
  alt: undefined,
  onOpen: (src: string, alt?: string) => set({ isOpen: true, src, alt }),
  onClose: () => set({ isOpen: false, src: undefined, alt: undefined }),
}));
