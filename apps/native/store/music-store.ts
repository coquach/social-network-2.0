import { create } from 'zustand';
import type { MusicFeatureDTO } from '@repo/shared';

type MusicStore = {
  tracks: MusicFeatureDTO[];
  activeIndex: number;
  activeTrack: MusicFeatureDTO | null;
  isPlaying: boolean;
  
  // Actions
  setPlaylist: (tracks: MusicFeatureDTO[]) => void;
  playTrackAt: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  clearPlaylist: () => void;
};

export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks: [],
  activeIndex: 0,
  activeTrack: null,
  isPlaying: false,

  setPlaylist: (tracks) => set({ tracks }),
  
  playTrackAt: (index) => {
    const tracks = get().tracks;
    if (index >= 0 && index < tracks.length) {
      set({ activeIndex: index, activeTrack: tracks[index], isPlaying: true });
    }
  },
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  nextTrack: () => {
    const { tracks, activeIndex } = get();
    if (tracks.length === 0) return;
    const nextIndex = activeIndex >= tracks.length - 1 ? 0 : activeIndex + 1;
    set({ activeIndex: nextIndex, activeTrack: tracks[nextIndex], isPlaying: true });
  },
  
  prevTrack: () => {
    const { tracks, activeIndex } = get();
    if (tracks.length === 0) return;
    const prevIndex = activeIndex <= 0 ? tracks.length - 1 : activeIndex - 1;
    set({ activeIndex: prevIndex, activeTrack: tracks[prevIndex], isPlaying: true });
  },
  
  clearPlaylist: () => set({ tracks: [], activeIndex: 0, activeTrack: null, isPlaying: false })
}));
