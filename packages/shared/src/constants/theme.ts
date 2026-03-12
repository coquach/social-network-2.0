import { brandColors, lightColors, darkColors, spacing, borderRadius } from './colors';

/**
 * Complete theme configuration
 * Có thể sử dụng cho cả Web (CSS variables) và React Native (StyleSheet)
 */
export const theme = {
  colors: {
    brand: brandColors,
    light: lightColors,
    dark: darkColors,
  },
  spacing,
  borderRadius,
  fonts: {
    family: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'Fira Code, monospace',
    },
    size: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    weight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type Theme = typeof theme;
