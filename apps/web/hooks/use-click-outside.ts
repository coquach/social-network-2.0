import { RefObject, useEffect } from 'react';

/**
 * useClickOutside - Centralized hook for handling click-outside behavior
 * 
 * @param ref - React ref to the element that should detect outside clicks
 * @param handler - Callback function to execute when click outside is detected
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 * 
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setOpen(false));
 * 
 * return <div ref={ref}>...</div>
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if ref exists and if click is outside the element
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    // Use mousedown for better UX (fires before click)
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
}
