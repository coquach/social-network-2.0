/**
 * Extend Tailwind config with shared brand colors
 * Usage: Add this to your tailwind.config.js
 */

import { brandColors } from '@repo/shared';

export const extendedColors = {
  brand: {
    primary: brandColors.primary,
    'primary-dark': brandColors.primaryDark,
    'primary-light': brandColors.primaryLight,
  },
  // Alias sky-400 to brand primary for backward compatibility
  sky: {
    400: brandColors.primary,
  },
};

/**
 * Complete Tailwind theme extension
 */
export const tailwindThemeExtension = {
  colors: extendedColors,
};
