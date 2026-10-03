import { create } from 'zustand';
import type { CrisisInfoDTO } from '../types';

interface CrisisStore {
  activeCrisis: CrisisInfoDTO | null;
  triggerCrisis: (data: CrisisInfoDTO) => void;
  dismissCrisis: () => void;
}

export const useCrisisStore = create<CrisisStore>((set) => ({
  activeCrisis: null,
  triggerCrisis: (data) => set({ activeCrisis: data }),
  dismissCrisis: () => set({ activeCrisis: null }),
}));
