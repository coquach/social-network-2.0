import { EmotionKey, EmotionScoresDTO } from '@/models/emotion/emotionDTO';
import { EMOTION_KEYS, emotionMeta } from './emotion-meta';

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
  const meta = emotionMeta[emotion];
  const percent = Math.min(value > 1 ? value : value * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.emoji}</span>
          <span>{meta.label}</span>
        </div>
        <span className="font-semibold text-slate-900">{formatPercent(value)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: meta.color,
          }}
        />
      </div>
    </div>
  );
};

export const EmotionScoreBlock = ({ scores }: { scores: EmotionScoresDTO }) => (
  <div className="grid gap-3">
    {EMOTION_KEYS.map((emotion) => (
      <ScoreRow key={emotion} emotion={emotion} value={(scores as any)[emotion] ?? 0} />
    ))}
  </div>
);
