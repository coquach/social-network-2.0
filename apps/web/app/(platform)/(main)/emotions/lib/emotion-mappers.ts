import { EmotionLabel, EmotionRiskLevel } from '@repo/shared';

export const EMOTION_ORDER: EmotionLabel[] = [
  'JOY',
  'SADNESS',
  'ANGER',
  'FEAR',
  'DISGUST',
  'SURPRISE',
  'NEUTRAL',
];

const EMOTION_LABEL_MAP: Record<EmotionLabel, string> = {
  JOY: 'Vui vẻ',
  SADNESS: 'Buồn',
  ANGER: 'Tức giận',
  FEAR: 'Lo lắng',
  DISGUST: 'Khó chịu',
  SURPRISE: 'Bất ngờ',
  NEUTRAL: 'Trung tính',
};

const EMOTION_EMOJI_MAP: Record<EmotionLabel, string> = {
  JOY: '😊',
  SADNESS: '😢',
  ANGER: '😡',
  FEAR: '😨',
  DISGUST: '🤢',
  SURPRISE: '😲',
  NEUTRAL: '😐',
};

const EMOTION_COLOR_MAP: Record<EmotionLabel, string> = {
  JOY: '#f59e0b',
  SADNESS: '#38bdf8',
  ANGER: '#f97316',
  FEAR: '#a855f7',
  DISGUST: '#22c55e',
  SURPRISE: '#ec4899',
  NEUTRAL: '#94a3b8',
};

const POSITIVE_EMOTIONS = new Set<EmotionLabel>(['JOY', 'SURPRISE']);
const NEGATIVE_EMOTIONS = new Set<EmotionLabel>([
  'SADNESS',
  'ANGER',
  'FEAR',
  'DISGUST',
]);

export const normalizeEmotionLabel = (value?: string | null): EmotionLabel => {
  if (!value) return 'NEUTRAL';

  const normalized = value.toUpperCase() as EmotionLabel;

  if (EMOTION_ORDER.includes(normalized)) {
    return normalized;
  }

  return 'NEUTRAL';
};

export const getEmotionLabel = (value?: string | null) => {
  const emotion = normalizeEmotionLabel(value);
  return EMOTION_LABEL_MAP[emotion];
};

export const getEmotionEmoji = (value?: string | null) => {
  const emotion = normalizeEmotionLabel(value);
  return EMOTION_EMOJI_MAP[emotion];
};

export const getEmotionColor = (value?: string | null) => {
  const emotion = normalizeEmotionLabel(value);
  return EMOTION_COLOR_MAP[emotion];
};

export const isNegativeEmotion = (value?: string | null) => {
  return NEGATIVE_EMOTIONS.has(normalizeEmotionLabel(value));
};

export const isPositiveEmotion = (value?: string | null) => {
  return POSITIVE_EMOTIONS.has(normalizeEmotionLabel(value));
};

export const getRiskStatus = (
  riskLevel?: string | null,
): 'normal' | 'warning' | 'critical' => {
  const normalized = (riskLevel ?? '').toLowerCase() as EmotionRiskLevel;

  if (normalized === 'high') {
    return 'critical';
  }

  if (normalized === 'medium') {
    return 'warning';
  }

  return 'normal';
};

export const getDistributionCount = (
  distribution: Record<string, number> | undefined,
  emotion: EmotionLabel,
) => {
  if (!distribution) return 0;

  return (
    distribution[emotion] ??
    distribution[emotion.toLowerCase()] ??
    distribution[emotion.charAt(0) + emotion.slice(1).toLowerCase()] ??
    0
  );
};
