import { useEffect, RefObject } from 'react';

/**
 * useFocusTrap - Traps focus within a container element
 * Prevents Tab/Shift+Tab from moving focus outside the container
 * 
 * @param containerRef - Ref to the container element
 * @param isActive - Whether the focus trap is active
 * 
 * @example
 * ```tsx
 * const dialogRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(dialogRef, isOpen);
 * 
 * return <div ref={dialogRef}>...</div>
 * ```
 */
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  isActive: boolean
) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => {
        // Filter out hidden elements
        return el.offsetParent !== null;
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Auto-focus first focusable element when trap activates
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        container.removeEventListener('keydown', handleKeyDown);
      };
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, isActive]);
}
