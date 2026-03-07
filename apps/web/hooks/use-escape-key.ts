import { useEffect } from 'react';

/**
 * Hook to handle Escape key press
 * Adds/removes keydown listener based on enabled state
 * 
 * @param onEscape - Callback to execute when Escape is pressed
 * @param enabled - Whether the listener is active
 * 
 * @example
 * ```tsx
 * useEscapeKey(() => setOpen(false), isOpen);
 * ```
 */
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, enabled]);
}
