import { RefObject, useEffect } from 'react';

/**
 * useScrollListener - Hook for optimized scroll event listening
 * Uses passive listeners for better scroll performance
 * 
 * @param ref - React ref to the scrollable element
 * @param handler - Callback function to execute on scroll
 * @param enabled - Optional flag to enable/disable the listener (default: true)
 * 
 * @example
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null);
 * useScrollListener(scrollRef, () => {
 *   console.log('Scrolled!');
 * });
 * 
 * return <div ref={scrollRef}>...</div>
 * ```
 */
export function useScrollListener<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: Event) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const element = ref.current;
    if (!element) return;

    // Use passive listener for better scroll performance
    // Passive listeners don't block scrolling while JS executes
    const options: AddEventListenerOptions = { passive: true };

    element.addEventListener('scroll', handler, options);

    return () => {
      element.removeEventListener('scroll', handler);
    };
  }, [ref, handler, enabled]);
}
