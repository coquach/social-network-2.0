import { create } from 'zustand';

interface TrackPlayerState {
  isReady: boolean;
  setReady: (ready: boolean) => void;
}

export const useTrackPlayerStore = create<TrackPlayerState>((set) => ({
  isReady: false,
  setReady: (ready) => set({ isReady: ready }),
}));
