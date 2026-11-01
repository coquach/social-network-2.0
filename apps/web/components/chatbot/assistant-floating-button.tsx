'use client';

import { Bot, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sentimeta-assistant-button-pos:v1';
export const BUTTON_SIZE = 56; // 56px (w-14 h-14)
export const EDGE_MARGIN = 24; // 24px margin from viewport edges
export const TOP_MARGIN = 80; // Below top navigation bar (h-16 = 64px + 16px buffer)
const DRAG_THRESHOLD = 5; // px moved to differentiate drag from click

export type FloatingPosition = {
  x: number;
  y: number;
};

interface AssistantFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  onPositionChange?: (pos: FloatingPosition) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function AssistantFloatingButton({
  isOpen,
  onClick,
  onPositionChange,
  containerRef,
}: AssistantFloatingButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<FloatingPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Drag interaction tracking refs
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    hasMoved: boolean;
    pointerId: number | null;
  }>({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    hasMoved: false,
    pointerId: null,
  });

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Clamp coordinates within the viewport
  const clampPosition = useCallback((x: number, y: number): FloatingPosition => {
    if (typeof window === 'undefined') return { x, y };
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - BUTTON_SIZE - EDGE_MARGIN);
    const maxY = Math.max(TOP_MARGIN, window.innerHeight - BUTTON_SIZE - EDGE_MARGIN);

    return {
      x: Math.min(Math.max(EDGE_MARGIN, x), maxX),
      y: Math.min(Math.max(TOP_MARGIN, y), maxY),
    };
  }, []);

  // Snap to nearest horizontal edge (left or right)
  const snapToEdge = useCallback(
    (currentX: number, currentY: number): FloatingPosition => {
      if (typeof window === 'undefined') return { x: currentX, y: currentY };
      const windowWidth = window.innerWidth;
      const midPoint = windowWidth / 2;
      const isLeft = currentX + BUTTON_SIZE / 2 < midPoint;

      const targetX = isLeft ? EDGE_MARGIN : windowWidth - BUTTON_SIZE - EDGE_MARGIN;
      const clamped = clampPosition(targetX, currentY);

      return clamped;
    },
    [clampPosition]
  );

  // Notify parent whenever position changes
  useEffect(() => {
    if (mounted) {
      onPositionChange?.(position);
    }
  }, [position, mounted, onPositionChange]);

  // Initialize position on mount
  useEffect(() => {
    setMounted(true);
    const defaultX = window.innerWidth - BUTTON_SIZE - EDGE_MARGIN;
    const defaultY = window.innerHeight - BUTTON_SIZE - EDGE_MARGIN;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FloatingPosition;
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          const snapped = snapToEdge(parsed.x, parsed.y);
          setPosition(snapped);
          return;
        }
      }
    } catch {
      // Fallback to default position if storage parse fails
    }

    const initial = { x: defaultX, y: defaultY };
    setPosition(initial);
  }, [snapToEdge]);

  // Adjust position when viewport is resized
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      setPosition((prev) => snapToEdge(prev.x, prev.y));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted, snapToEdge]);

  // Pointer Down: Start tracking drag
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Primary button only

    const button = buttonRef.current;
    if (button) {
      button.setPointerCapture(e.pointerId);
    }

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
      hasMoved: false,
      pointerId: e.pointerId,
    };
  };

  // Pointer Move: Update position if dragging
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;
    const distance = Math.hypot(deltaX, deltaY);

    if (!drag.hasMoved && distance > DRAG_THRESHOLD) {
      drag.hasMoved = true;
      setIsDragging(true);
    }

    if (drag.hasMoved) {
      // Immediate 60fps tracking clamped to viewport
      const newX = drag.originX + deltaX;
      const newY = drag.originY + deltaY;
      setPosition(clampPosition(newX, newY));
    }
  };

  // Pointer Up: End drag and snap to edge
  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const button = buttonRef.current;
    if (button && button.hasPointerCapture(e.pointerId)) {
      button.releasePointerCapture(e.pointerId);
    }

    const wasDragging = drag.hasMoved;
    drag.pointerId = null;
    drag.hasMoved = false;

    if (wasDragging) {
      setIsDragging(false);
      // Snap to nearest edge
      const finalPos = snapToEdge(position.x, position.y);
      setPosition(finalPos);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalPos));
      } catch {
        // Ignore storage errors
      }
    } else {
      // Clean click (no drag)
      onClick();
    }
  };

  // Pointer Cancel: Reset state cleanly
  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId !== e.pointerId) return;

    const button = buttonRef.current;
    if (button && button.hasPointerCapture(e.pointerId)) {
      button.releasePointerCapture(e.pointerId);
    }

    drag.pointerId = null;
    drag.hasMoved = false;
    setIsDragging(false);
    setPosition((prev) => snapToEdge(prev.x, prev.y));
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Before mount, render at default bottom-right without layout shift
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          aria-label="Mở Trợ lý Sentimeta AI"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 cursor-pointer"
        >
          <Bot size={24} />
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 51,
        touchAction: 'none',
        userSelect: 'none',
        transition: isDragging
          ? 'none'
          : 'left 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28), top 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
      }}
      className="select-none"
    >
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        aria-label={isOpen ? 'Đóng Trợ lý Sentimeta AI' : 'Mở Trợ lý Sentimeta AI'}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary via-primary/95 to-primary/85 text-primary-foreground shadow-xl shadow-primary/30 border border-white/20 select-none ${
          isDragging
            ? 'cursor-grabbing scale-105 shadow-2xl shadow-primary/45'
            : 'cursor-grab hover:scale-108 hover:shadow-2xl hover:shadow-primary/40 active:scale-95'
        } ${isOpen ? 'ring-4 ring-primary/25 shadow-2xl' : ''} transition-all duration-150 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-offset-2`}
      >
        <div className="relative pointer-events-none flex items-center justify-center">
          {isOpen ? (
            <X size={24} className="transition-transform duration-200" />
          ) : (
            <>
              <Bot
                size={25}
                className={`transition-transform duration-300 ${
                  isDragging ? 'rotate-12 scale-110' : 'group-hover:rotate-6 group-hover:scale-110'
                }`}
              />
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}
