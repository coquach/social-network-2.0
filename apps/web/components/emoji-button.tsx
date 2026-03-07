'use client';

import { useMemo, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { MdOutlineEmojiEmotions } from 'react-icons/md';
import clsx from 'clsx';
import { useClickOutside } from '@/hooks/use-click-outside';

type PopupSide = 'top' | 'bottom';
type Align = 'left' | 'right' | 'center';

type Props = {
  size?: 6 | 7 | 8 | 9 | 10 | 11 | 12; // giới hạn để tailwind không purge
  onPick: (emoji: string) => void;
  disabled?: boolean;

  popupSide?: PopupSide; 
  align?: Align; 
  offset?: number; // px, khoảng cách icon <-> popup
};

export const EmojiButton = ({
  size = 9,
  onPick,
  disabled,
  popupSide = 'top',
  align = 'left',
  offset = 12,
}: Props) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (disabled) return;
    setOpen((p) => !p);
  };

  // Close picker when clicking outside (except on trigger button)
  useClickOutside(
    pickerRef,
    (event) => {
      // Don't close if clicking on the trigger button
      if (!(event.target as HTMLElement).closest('[data-emoji-open="true"]')) {
        setOpen(false);
      }
    },
    open // Only active when picker is open
  );

  const sizeClass = useMemo(() => {
    // tailwind-safe mapping
    const map: Record<number, string> = {
      6: 'h-6 w-6',
      7: 'h-7 w-7',
      8: 'h-8 w-8',
      9: 'h-9 w-9',
      10: 'h-10 w-10',
      11: 'h-11 w-11',
      12: 'h-12 w-12',
    };
    return map[size] ?? 'h-9 w-9';
  }, [size]);

  const alignClass = useMemo(() => {
    if (align === 'right') return 'right-0';
    if (align === 'center') return 'left-1/2 -translate-x-1/2';
    return 'left-0';
  }, [align]);

  const sideStyle = useMemo<React.CSSProperties>(() => {
    // dùng style để set offset px linh hoạt
    return popupSide === 'top'
      ? { bottom: `calc(100% + ${offset}px)` }
      : { top: `calc(100% + ${offset}px)` };
  }, [popupSide, offset]);

  return (
    <div className="relative">
      <MdOutlineEmojiEmotions
        data-emoji-open="true"
        className={clsx(
          sizeClass,
          'cursor-pointer',
          disabled
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-sky-500 hover:text-sky-300'
        )}
        onClick={toggle}
      />

      {open && (
        <div
          ref={pickerRef}
          className={clsx('absolute z-40', alignClass)}
          style={sideStyle}
        >
          <EmojiPicker
            onEmojiClick={(emoji) => {
              onPick(emoji.emoji);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
