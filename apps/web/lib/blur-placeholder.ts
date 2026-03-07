/**
 * Simple blur placeholder utility for Next.js Image components
 * Generates a tiny base64-encoded SVG shimmer effect
 */

/**
 * Creates a shimmer SVG for use as a blur placeholder
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @returns Base64-encoded data URL
 */
export function getBlurPlaceholder(width: number = 40, height: number = 40): string {
  const shimmer = `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#f6f7f8" />
  <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
</svg>`.trim();

  const base64 = Buffer.from(shimmer).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Pre-generated blur placeholders for common sizes
 */
export const BLUR_PLACEHOLDERS = {
  avatar: getBlurPlaceholder(40, 40),
  avatarLarge: getBlurPlaceholder(96, 96),
  cover: getBlurPlaceholder(800, 200),
  thumbnail: getBlurPlaceholder(96, 96),
  post: getBlurPlaceholder(600, 400),
} as const;
