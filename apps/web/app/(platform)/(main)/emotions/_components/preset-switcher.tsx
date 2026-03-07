import { Button } from '@/components/ui/button';
import { EmotionPreset } from '@/models/emotion/emotionDTO';
import { cn } from '@/lib/utils';

const presets: { value: EmotionPreset; label: string; hint?: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'thisWeek', label: 'Tuần này' },
  { value: 'thisMonth', label: 'Tháng này' },
];

interface PresetSwitcherProps {
  value: EmotionPreset;
  onChange: (value: EmotionPreset) => void;
}

export const PresetSwitcher = ({ value, onChange }: PresetSwitcherProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          variant={value === preset.value ? 'default' : 'outline'}
          className={cn(
            'rounded-full border-slate-200 text-sm',
            value === preset.value
              ? 'bg-sky-500 text-white shadow-s'
              : 'bg-white text-slate-700 hover:border-slate-300'
          )}
          onClick={() => onChange(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
};

export const presetOptions = presets;
