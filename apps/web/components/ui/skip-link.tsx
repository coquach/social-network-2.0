'use client';

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkipLink - Accessible skip navigation link
 * Allows keyboard users to bypass repetitive navigation
 * Visible only when focused via keyboard (sr-only with focus override)
 * 
 * @example
 * ```tsx
 * <SkipLink href="#main-content">
 *   Skip to main content
 * </SkipLink>
 * ```
 */
export function SkipLink({ 
  href = '#main-content', 
  children = 'Chuyển đến nội dung chính',
  className 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Screen reader only by default
        'sr-only',
        // Visible when focused
        'focus:not-sr-only',
        // Positioning
        'focus:fixed focus:top-4 focus:left-4 focus:z-100',
        // Styling
        'focus:inline-block focus:px-4 focus:py-2',
        'focus:bg-sky-600 focus:text-white',
        'focus:rounded-lg focus:shadow-lg',
        // Focus ring
        'focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
        // Transition
        'focus:transition-all',
        // Typography
        'focus:text-sm focus:font-medium',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Multiple skip links for complex layouts
 * 
 * @example
 * ```tsx
 * <SkipLinks
 *   links={[
 *     { href: '#main-content', label: 'Skip to content' },
 *     { href: '#navigation', label: 'Skip to navigation' },
 *     { href: '#footer', label: 'Skip to footer' },
 *   ]}
 * />
 * ```
 */
export function SkipLinks({ 
  links 
}: { 
  links: { href: string; label: string }[] 
}) {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-100">
      <nav aria-label="Skip links" className="flex flex-col gap-2">
        {links.map((link) => (
          <SkipLink
            key={link.href}
            href={link.href}
            className="focus:mb-0"
          >
            {link.label}
          </SkipLink>
        ))}
      </nav>
    </div>
  );
}
