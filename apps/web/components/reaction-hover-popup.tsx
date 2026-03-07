'use client';

import { Reaction, reactionsUI } from '@/lib/types/reaction';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type PopupSide = 'top' | 'bottom';

interface ReactionHoverPopupProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (reaction: Reaction | null) => void;
  selectedReaction: Reaction | null;
  side?: PopupSide;
  children: ReactNode; // trigger
  onContentMouseEnter?: () => void;
  onContentMouseLeave?: () => void;
}

export const ReactionHoverPopup = ({
  open,
  onOpenChange,
  onSelect,
  selectedReaction,
  side = 'top',
  children,
  onContentMouseEnter,
  onContentMouseLeave,
}: ReactionHoverPopupProps) => {
  const [hovered, setHovered] = useState<Reaction | null>(null);
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
          const next = prev < reactionsUI.length - 1 ? prev + 1 : 0;
          buttonRefs.current[next]?.focus();
          return next;
        });
        break;

      case 'ArrowLeft':
        e.preventDefault();
        setFocusIndex((prev) => {
          const next = prev > 0 ? prev - 1 : reactionsUI.length - 1;
          buttonRefs.current[next]?.focus();
          return next;
        });
        break;

      case 'Enter':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < reactionsUI.length) {
          onSelect(reactionsUI[focusIndex]);
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
        align="center"
        sideOffset={10}
        onMouseEnter={onContentMouseEnter}
        onMouseLeave={onContentMouseLeave}
        onKeyDown={handleKeyDown}
        className="w-auto p-0 border-0 bg-transparent shadow-none"
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-full shadow-lg px-3 py-2 flex gap-2"
          >
            {reactionsUI.map((r, index) => {
              const isSelected = selectedReaction?.type === r.type;
              const isHovered = r.type === hovered?.type;
              const isFocused = focusIndex === index;
              return (
                <motion.button
                  key={r.type}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  tabIndex={open ? 0 : -1}
                  whileHover={{ scale: 1.3 }}
                  onMouseEnter={() => setHovered(r)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setFocusIndex(index)}
                  onClick={() => {
                    onSelect(r);
                    onOpenChange(false);
                  }}
                  className={`
                    text-xl cursor-pointer transition-all
                    ${isSelected ? 'scale-125 bg-gray-200 rounded-full' : ''}
                    ${isHovered && !isSelected ? 'scale-110' : ''}
                    ${isFocused ? 'ring-2 ring-sky-500 rounded-full' : ''}
                  `}
                  title={r.name}
                  aria-label={r.name}
                >
                  {r.emoji}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};
