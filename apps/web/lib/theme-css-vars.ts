/**
 * Generate CSS variables from shared theme
 * Sử dụng để sync shared theme với globals.css
 */

import { lightColors, darkColors, brandColors } from '@repo/shared';

/**
 * Convert shared colors to CSS custom properties
 */
export const lightModeCssVars = {
  // Brand colors
  '--brand-primary': brandColors.primary,
  '--brand-primary-dark': brandColors.primaryDark,
  '--brand-primary-light': brandColors.primaryLight,
  
  // Light mode colors
  '--background': lightColors.background,
  '--foreground': lightColors.foreground,
  '--card': lightColors.card,
  '--card-foreground': lightColors.cardForeground,
  '--primary': lightColors.primary,
  '--primary-foreground': lightColors.primaryForeground,
  '--secondary': lightColors.secondary,
  '--secondary-foreground': lightColors.secondaryForeground,
  '--muted': lightColors.muted,
  '--muted-foreground': lightColors.mutedForeground,
  '--accent': lightColors.accent,
  '--accent-foreground': lightColors.accentForeground,
  '--destructive': lightColors.destructive,
  '--destructive-foreground': lightColors.destructiveForeground,
  '--border': lightColors.border,
  '--input': lightColors.input,
  '--ring': lightColors.ring,
} as const;

export const darkModeCssVars = {
  // Brand colors (same in both modes)
  '--brand-primary': brandColors.primary,
  '--brand-primary-dark': brandColors.primaryDark,
  '--brand-primary-light': brandColors.primaryLight,
  
  // Dark mode colors
  '--background': darkColors.background,
  '--foreground': darkColors.foreground,
  '--card': darkColors.card,
  '--card-foreground': darkColors.cardForeground,
  '--primary': darkColors.primary,
  '--primary-foreground': darkColors.primaryForeground,
  '--secondary': darkColors.secondary,
  '--secondary-foreground': darkColors.secondaryForeground,
  '--muted': darkColors.muted,
  '--muted-foreground': darkColors.mutedForeground,
  '--accent': darkColors.accent,
  '--accent-foreground': darkColors.accentForeground,
  '--destructive': darkColors.destructive,
  '--destructive-foreground': darkColors.destructiveForeground,
  '--border': darkColors.border,
  '--input': darkColors.input,
  '--ring': darkColors.ring,
} as const;

/**
 * Helper to apply CSS variables to an element
 */
export function applyCssVars(
  element: HTMLElement,
  vars: Record<string, string>
) {
  Object.entries(vars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}
