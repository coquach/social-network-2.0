'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { feelingsUI, FeelingUI } from '@/lib/types/feeling';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PopupSide = 'top' | 'bottom';

export function FeelingPopover({
  open,
  onOpenChange,
  selectedFeeling,
  onSelect,
  side = 'top',
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedFeeling: FeelingUI | null;
  onSelect: (f: FeelingUI | null) => void;
  side?: PopupSide;
  children: React.ReactNode; // trigger button
}) {
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset focus index when popup opens/closes
  useEffect(() => {
    if (open) {
      setFocusIndex(-1);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusIndex((prev) => {
          const next = prev < feelingsUI.length - 1 ? prev + 1 : 0;
          buttonRefs.current[next]?.focus();
          return next;
        });
        break;

      case 'ArrowLeft':
        e.preventDefault();
        setFocusIndex((prev) => {
          const next = prev > 0 ? prev - 1 : feelingsUI.length - 1;
          buttonRefs.current[next]?.focus();
          return next;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < feelingsUI.length) {
          const feeling = feelingsUI[focusIndex];
          const isSelected = selectedFeeling?.type === feeling.type;
          onSelect(isSelected ? null : feeling);
          onOpenChange(false);
        }
        break;

      case 'Escape':
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent
        side={side}
        align="center" // ✅ luôn ở giữa nút
        sideOffset={10}
        onKeyDown={handleKeyDown}
        className="w-auto p-0 border-0 bg-transparent shadow-none"
      >
        <div
          data-feeling-popup="true"
          className="rounded-full border border-sky-100 bg-white/95 shadow-lg px-3 py-3 flex gap-1 backdrop-blur"
        >
          {feelingsUI.map((f, index) => {
            const isSelected = selectedFeeling?.type === f.type;
            const isFocused = focusIndex === index;

            return (
              <motion.button
                key={f.type}
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                tabIndex={open ? 0 : -1}
                whileHover={{ scale: 1.2 }}
                onFocus={() => setFocusIndex(index)}
                onClick={() => {
                  onSelect(isSelected ? null : f);
                  onOpenChange(false);
                }}
                className={[
                  'text-xl cursor-pointer rounded-full px-2.5 py-1.5 transition-all',
                  f.color,
                  isSelected ? 'bg-sky-100 ring-1 ring-sky-200' : '',
                  isFocused ? 'ring-2 ring-sky-500' : '',
                ].join(' ')}
                title={f.name}
                aria-label={f.name}
              >
                {f.emoji}
              </motion.button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
