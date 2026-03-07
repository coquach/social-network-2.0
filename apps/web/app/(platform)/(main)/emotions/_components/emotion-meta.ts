import { feelingsUI } from '@/lib/types/feeling';
import { EmotionKey } from '@/models/emotion/emotionDTO';
import { Emotion } from '@/models/social/enums/social.enum';

const fallbackMeta: Record<
  EmotionKey,
  { label: string; emoji: string; color: string; bg: string }
> = {
  joy: {
    label: 'Vui vẻ',
    emoji: '😊',
    color: '#f59e0b',
    bg: 'bg-amber-50',
  },
  sadness: {
    label: 'Buồn',
    emoji: '😢',
    color: '#38bdf8',
    bg: 'bg-sky-50',
  },
  anger: {
    label: 'Tức giận',
    emoji: '😠',
    color: '#f97316',
    bg: 'bg-orange-50',
  },
  fear: {
    label: 'Lo lắng',
    emoji: '😨',
    color: '#a855f7',
    bg: 'bg-violet-50',
  },
  disgust: {
    label: 'Khó chịu',
    emoji: '🤢',
    color: '#22c55e',
    bg: 'bg-emerald-50',
  },
  surprise: {
    label: 'Bất ngờ',
    emoji: '😲',
    color: '#ec4899',
    bg: 'bg-pink-50',
  },
  neutral: {
    label: 'Bình thường',
    emoji: '😐',
    color: '#9ca3af',
    bg: 'bg-slate-50',
  },
};

const toKey = (value: Emotion | string) =>
  value.toString().toLowerCase() as EmotionKey;

export const EMOTION_KEYS: EmotionKey[] = Object.keys(
  fallbackMeta
) as EmotionKey[];

export const emotionMeta: Record<
  EmotionKey,
  { label: string; emoji: string; color: string; bg: string }
> = EMOTION_KEYS.reduce((acc, key) => {
  const feeling = feelingsUI.find((f) => toKey(f.type) === key);
  acc[key] = {
    label: feeling?.name ?? fallbackMeta[key].label,
    emoji: feeling?.emoji ?? fallbackMeta[key].emoji,
    color: fallbackMeta[key].color,
    bg: fallbackMeta[key].bg,
  };
  return acc;
}, {} as Record<EmotionKey, { label: string; emoji: string; color: string; bg: string }>);

export const getEmotionMeta = (value?: string | null) => {
  const key = (value ?? '').toLowerCase() as EmotionKey;
  if (key in emotionMeta) {
    return emotionMeta[key as EmotionKey];
  }
  return emotionMeta.neutral;
};

export const pickValue = (
  data: Record<string, number> | undefined,
  key: EmotionKey
) => {
  if (!data) return 0;
  return data[key] ?? data[key.toUpperCase()] ?? 0;
};
