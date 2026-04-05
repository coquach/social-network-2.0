import { Emotion } from '../../types';

export interface FeelingUI {
  type: Emotion;
  name: string;
  emoji: string;
  color: string; // tailwind text color class
}

export const feelingsUI: FeelingUI[] = [
  { type: Emotion.JOY, name: 'Vui vẻ', emoji: '😄', color: 'text-amber-500' },
  { type: Emotion.SADNESS, name: 'Buồn', emoji: '😢', color: 'text-sky-500' },
  {
    type: Emotion.ANGER,
    name: 'Giận dữ',
    emoji: '😡',
    color: 'text-orange-500',
  },
  {
    type: Emotion.FEAR,
    name: 'Lo lắng',
    emoji: '😨',
    color: 'text-violet-500',
  },
  {
    type: Emotion.DISGUST,
    name: 'Khó chịu',
    emoji: '🤢',
    color: 'text-emerald-500',
  },
  {
    type: Emotion.SURPRISE,
    name: 'Bất ngờ',
    emoji: '😲',
    color: 'text-rose-500',
  },
  {
    type: Emotion.NEUTRAL,
    name: 'Bình thường',
    emoji: '😐',
    color: 'text-slate-500',
  },
];

// Map lookup for O(1) access instead of Array.find() O(n)
export const feelingMap = new Map<Emotion, FeelingUI>(
  feelingsUI.map((f) => [f.type, f]),
);
