/**
 * Brand Colors - Sentimeta
 * Màu sắc chung cho cả web và mobile apps
 */

export const brandColors = {
  primary: '#59c7f9', // Sky blue - màu chính của brand
  primaryDark: '#3b9ac9',
  primaryLight: '#7dd4fc',
} as const;

/**
 * Color palette for light mode
 */
export const lightColors = {
  // Màu nền & text chính
  background: '#ffffff',
  foreground: '#0f172a',
  
  // Card & surfaces
  card: '#ffffff',
  cardForeground: '#0f172a',
  
  // Primary colors
  primary: '#4f86f7',
  primaryForeground: '#fafafa',
  
  // Secondary colors
  secondary: '#f1f5f9',
  secondaryForeground: '#1e293b',
  
  // Muted colors
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  
  // Accent colors
  accent: '#e0e7ff',
  accentForeground: '#1e293b',
  
  // Destructive
  destructive: '#ef4444',
  destructiveForeground: '#fafafa',
  
  // Border & input
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#4f86f7',
} as const;

/**
 * Color palette for dark mode
 */
export const darkColors = {
  // Màu nền & text chính
  background: '#0f172a',
  foreground: '#f8fafc',
  
  // Card & surfaces
  card: '#1e293b',
  cardForeground: '#f8fafc',
  
  // Primary colors
  primary: '#60a5fa',
  primaryForeground: '#0f172a',
  
  // Secondary colors
  secondary: '#1e293b',
  secondaryForeground: '#f8fafc',
  
  // Muted colors
  muted: '#1e293b',
  mutedForeground: '#94a3b8',
  
  // Accent colors
  accent: '#334155',
  accentForeground: '#f8fafc',
  
  // Destructive
  destructive: '#dc2626',
  destructiveForeground: '#fafafa',
  
  // Border & input
  border: 'rgba(255, 255, 255, 0.18)',
  input: 'rgba(255, 255, 255, 0.2)',
  ring: '#3b82f6',
} as const;

/**
 * Spacing constants
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Border radius
 */
export const borderRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type ColorPalette = typeof lightColors;
export type BrandColors = typeof brandColors;
