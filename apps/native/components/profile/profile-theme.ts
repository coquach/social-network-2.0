import type { ProfilePalette } from './profile-types';

export const INDIGO_ETHER: Record<'light' | 'dark', ProfilePalette> = {
  light: {
    background: '#f6f6f8',
    surface: '#ffffff',
    surfaceLow: '#f1f0fb',
    onSurface: '#0f172a',
    onSurfaceVariant: '#64748b',
    primary: '#5048e5',
    primaryForeground: '#ffffff',
    outline: '#e2e8f0',
    glass: 'rgba(255, 255, 255, 0.82)',
    coverOverlay: 'rgba(15, 23, 42, 0.12)',
    shadow: '#0f172a',
    divider: '#eef2ff',
  },
  dark: {
    background: '#101421',
    surface: '#191f32',
    surfaceLow: '#252c40',
    onSurface: '#f8faff',
    onSurfaceVariant: '#adb7cf',
    primary: '#8b87ff',
    primaryForeground: '#f8faff',
    outline: 'rgba(148, 163, 184, 0.3)',
    glass: 'rgba(14, 18, 30, 0.88)',
    coverOverlay: 'rgba(0, 0, 0, 0.24)',
    shadow: '#000000',
    divider: 'rgba(148, 163, 184, 0.24)',
  },
};
