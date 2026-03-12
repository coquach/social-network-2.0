/**
 * Theme utility functions
 * Giúp access theme values một cách type-safe
 */

import { theme } from '../constants/theme';
import type { Theme } from '../constants/theme';

/**
 * Get color from theme
 * @param mode - 'light' or 'dark'
 * @param colorKey - Key from color palette
 * @returns Color hex value
 */
export function getThemeColor<K extends keyof Theme['colors']['light']>(
  mode: 'light' | 'dark',
  colorKey: K
): string {
  return theme.colors[mode][colorKey];
}

/**
 * Get brand color
 * @param colorKey - 'primary', 'primaryDark', or 'primaryLight'
 * @returns Color hex value
 */
export function getBrandColor(
  colorKey: keyof typeof theme.colors.brand = 'primary'
): string {
  return theme.colors.brand[colorKey];
}

/**
 * Get spacing value
 * @param size - Spacing size key
 * @returns Spacing value in pixels
 */
export function getSpacing(size: keyof typeof theme.spacing): number {
  return theme.spacing[size];
}

/**
 * Get border radius value
 * @param size - Border radius size key
 * @returns Border radius value in pixels
 */
export function getBorderRadius(size: keyof typeof theme.borderRadius): number {
  return theme.borderRadius[size];
}

/**
 * Get font size value
 * @param size - Font size key
 * @returns Font size value in pixels
 */
export function getFontSize(size: keyof typeof theme.fonts.size): number {
  return theme.fonts.size[size];
}

/**
 * Create CSS variables object from theme
 * Dùng cho Web (Next.js)
 */
export function createCssVariables(mode: 'light' | 'dark') {
  const colors = theme.colors[mode];
  const vars: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    vars[`--${key}`] = value;
  });

  return vars;
}

/**
 * Create React Native StyleSheet colors object
 * Dùng cho React Native
 */
export function createStyleSheetColors(mode: 'light' | 'dark') {
  return theme.colors[mode];
}

export { theme };
