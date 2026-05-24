import { EmotionKey, EmotionScoresDTO } from '@/models/emotion/emotionDTO';
import {
  getEmotionColor,
  getEmotionEmoji,
  getEmotionLabel,
} from '../lib/emotion-mappers';

const EMOTION_KEYS: EmotionKey[] = [
  'joy',
  'sadness',
  'anger',
  'fear',
  'disgust',
  'surprise',
  'neutral',
];

const formatPercent = (value: number) => {
  const pct = value > 1 ? value : value * 100;
  return `${pct.toFixed(1)}%`;
};

const ScoreRow = ({
  emotion,
  value,
}: {
  emotion: EmotionKey;
  value: number;
}) => {
  const emotionLabel = getEmotionLabel(emotion);
  const emotionEmoji = getEmotionEmoji(emotion);
  const emotionColor = getEmotionColor(emotion);
  const percent = Math.min(value > 1 ? value : value * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base leading-none">{emotionEmoji}</span>
          <span className="truncate font-medium text-slate-800">
            {emotionLabel}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200/80">
          {formatPercent(value)}
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-200/70">
        <div
          className="h-2.5 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset]"
          style={{
            width: `${percent}%`,
            backgroundColor: emotionColor,
          }}
        />
      </div>
    </div>
  );
};

export const EmotionScoreBlock = ({
  scores,
}: {
  scores: EmotionScoresDTO | Record<string, number>;
}) => (
  <div className="grid gap-4">
    {EMOTION_KEYS.map((emotion) => (
      <ScoreRow key={emotion} emotion={emotion} value={scores[emotion] ?? 0} />
    ))}
  </div>
);
