export type ThemeMode = 'light' | 'dark';
export type ThemePreference = ThemeMode | 'system';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  foreground: string;
  mutedForeground: string;
  primary: string;
  primaryForeground: string;
  border: string;
  destructive: string;
};

export const lightTheme: ThemeColors = {
  background: '#f3fbff',
  surface: '#ffffff',
  surfaceElevated: '#e8f6ff',
  foreground: '#406179',
  mutedForeground: '#6b8aa1',
  primary: '#0ea5e9',
  primaryForeground: '#ffffff',
  border: '#cfe5f2',
  destructive: '#ef4444',
};

export const darkTheme: ThemeColors = {
  background: '#071823',
  surface: '#0d2535',
  surfaceElevated: '#15364b',
  foreground: '#e6f7ff',
  mutedForeground: '#8fb2c8',
  primary: '#22d3ee',
  primaryForeground: '#083344',
  border: '#21455d',
  destructive: '#fb7185',
};

export const appThemeColors: Record<ThemeMode, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
};
