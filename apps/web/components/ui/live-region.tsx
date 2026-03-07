'use client';

import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  /**
   * politeness level for screen readers
   * - 'polite': waits for current speech to finish
   * - 'assertive': interrupts current speech
   */
  politeness?: 'polite' | 'assertive';
  /**
   * Clear message after delay (ms). 0 = no clear
   */
  clearAfter?: number;
}

/**
 * LiveRegion - Announces dynamic content changes to screen readers
 * Uses aria-live to notify users of loading states, errors, success messages
 * 
 * @example
 * ```tsx
 * <LiveRegion message={isLoading ? "Đang tải..." : ""} />
 * ```
 */
export function LiveRegion({ 
  message, 
  politeness = 'polite',
  clearAfter = 0
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (!message) {
      setCurrentMessage('');
      return;
    }

    setCurrentMessage(message);

    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      {...{ 'aria-live': politeness }}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}

/**
 * Hook to manage live region announcements
 * 
 * @example
 * ```tsx
 * const { announce, LiveRegionComponent } = useLiveAnnouncer();
 * 
 * const handleSubmit = async () => {
 *   announce("Đang gửi...");
 *   await submit();
 *   announce("Đã gửi thành công!");
 * };
 * 
 * return (
 *   <>
 *     {LiveRegionComponent}
 *     <button onClick={handleSubmit}>Submit</button>
 *   </>
 * );
 * ```
 */
export function useLiveAnnouncer(politeness: 'polite' | 'assertive' = 'polite') {
  const [message, setMessage] = useState('');

  const announce = (msg: string) => {
    setMessage(msg);
  };

  const clear = () => {
    setMessage('');
  };

  const LiveRegionComponent = (
    <LiveRegion message={message} politeness={politeness} />
  );

  return { announce, clear, LiveRegionComponent };
}
