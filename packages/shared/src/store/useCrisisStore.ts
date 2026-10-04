import { create } from 'zustand';
import type { CrisisInfoDTO } from '../types';

/** After the user dismisses a crisis UI, don't show it again for this long. */
export const CRISIS_COOLDOWN_MS = 30 * 60 * 1000;

const SEVERITY_RANK: Record<CrisisInfoDTO['severity'], number> = {
  medium: 1,
  high: 2,
};

interface CrisisStore {
  activeCrisis: CrisisInfoDTO | null;
  /** Severity and time of the last dismissal, used for the cooldown. */
  lastDismissed: { severity: CrisisInfoDTO['severity']; at: number } | null;
  triggerCrisis: (data: CrisisInfoDTO) => void;
  dismissCrisis: () => void;
}

export const useCrisisStore = create<CrisisStore>((set) => ({
  activeCrisis: null,
  lastDismissed: null,
  triggerCrisis: (data) =>
    set((state) => {
      const { activeCrisis: current, lastDismissed } = state;

      // Already showing: only a high alert may upgrade an active medium toast.
      if (current && !(current.severity === 'medium' && data.severity === 'high')) {
        return state;
      }

      // Recently dismissed: stay quiet unless severity escalates.
      if (
        !current &&
        lastDismissed &&
        Date.now() - lastDismissed.at < CRISIS_COOLDOWN_MS &&
        SEVERITY_RANK[data.severity] <= SEVERITY_RANK[lastDismissed.severity]
      ) {
        return state;
      }

      return { activeCrisis: data };
    }),
  dismissCrisis: () =>
    set((state) =>
      state.activeCrisis
        ? {
            activeCrisis: null,
            lastDismissed: { severity: state.activeCrisis.severity, at: Date.now() },
          }
        : state,
    ),
}));
