import { MusicGenre } from '@/models/music/musicDTO';

export const musicGenreLabels: Record<MusicGenre, string> = {
  [MusicGenre.LOFI]: 'Lo-fi',
  [MusicGenre.EDM]: 'EDM',
  [MusicGenre.POP]: 'Pop',
  [MusicGenre.ACOUSTIC]: 'Acoustic',
  [MusicGenre.ROCK]: 'Rock',
  [MusicGenre.OTHER]: 'Khác',
};

export const musicGenreOptions = [
  { value: MusicGenre.LOFI, label: musicGenreLabels[MusicGenre.LOFI] },
  { value: MusicGenre.EDM, label: musicGenreLabels[MusicGenre.EDM] },
  { value: MusicGenre.POP, label: musicGenreLabels[MusicGenre.POP] },
  { value: MusicGenre.ACOUSTIC, label: musicGenreLabels[MusicGenre.ACOUSTIC] },
  { value: MusicGenre.ROCK, label: musicGenreLabels[MusicGenre.ROCK] },
  { value: MusicGenre.OTHER, label: musicGenreLabels[MusicGenre.OTHER] },
];

export const formatMusicDuration = (seconds?: number) => {
  if (!Number.isFinite(seconds ?? Number.NaN) || !seconds || seconds <= 0) {
    return '—';
  }

  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;

  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

export const formatMusicDate = (value?: string | Date) => {
  if (!value) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const getEmotionLabel = (valence: number, arousal: number) => {
  const v = clamp01(valence);
  const a = clamp01(arousal);

  if (v < 0.33 && a < 0.33) return 'Calm & Sad';
  if (v < 0.33 && a >= 0.33) return 'Tense & Dark';
  if (v >= 0.66 && a < 0.33) return 'Warm & Soft';
  if (v >= 0.66 && a >= 0.66) return 'Happy & Energetic';
  if (a >= 0.55) return 'Bright & Driven';

  return 'Balanced';
};

export const getEmotionHint = (valence: number, arousal: number) => {
  const label = getEmotionLabel(valence, arousal);

  switch (label) {
    case 'Calm & Sad':
      return 'Màu cảm xúc dịu, chậm và trầm';
    case 'Tense & Dark':
      return 'Cảm giác căng và tối';
    case 'Warm & Soft':
      return 'Ấm, mượt và thư giãn';
    case 'Happy & Energetic':
      return 'Rất sáng và giàu năng lượng';
    case 'Bright & Driven':
      return 'Tươi sáng, nhịp tốt, dễ tạo động lực';
    default:
      return 'Cân bằng giữa năng lượng và sắc thái';
  }
};
