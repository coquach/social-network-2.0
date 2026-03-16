import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Platform } from 'react-native';

import {
  appThemeColors,
  type ThemeMode,
  type ThemePreference,
} from '~/constants/theme';
import { getItem, setItem } from '~/utils/storage';

const THEME_PREFERENCE_KEY = 'theme-preference';

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

type ThemeContextValue = {
  colors: (typeof appThemeColors)[ThemeMode];
  themePreference: ThemePreference;
  resolvedTheme: ThemeMode;
  setThemePreference: (theme: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    React.useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = React.useState(false);

  const applyColorScheme = React.useCallback(
    (nextTheme: ThemePreference) => {
      try {
        if (nextTheme === 'system' && Platform.OS === 'android') {
          // RN 0.83 Android expects "unspecified" for follow-system mode.
          setColorScheme(
            'unspecified' as unknown as Parameters<typeof setColorScheme>[0],
          );
          return;
        }

        setColorScheme(nextTheme);
      } catch (error) {
        if (__DEV__) {
          console.warn('[theme] Failed to set color scheme', error);
        }
      }
    },
    [setColorScheme],
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadStoredPreference = async () => {
      const storedTheme = await getItem(THEME_PREFERENCE_KEY);

      if (!isMounted) {
        return;
      }

      if (isThemePreference(storedTheme)) {
        setThemePreferenceState(storedTheme);
        applyColorScheme(storedTheme);
      }

      setIsHydrated(true);
    };

    loadStoredPreference();

    return () => {
      isMounted = false;
    };
  }, [applyColorScheme]);

  const setThemePreference = React.useCallback(
    (nextTheme: ThemePreference) => {
      setThemePreferenceState(nextTheme);
      applyColorScheme(nextTheme);
      void setItem(THEME_PREFERENCE_KEY, nextTheme);
    },
    [applyColorScheme],
  );

  const resolvedTheme: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = appThemeColors[resolvedTheme];

  React.useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const navigationTheme = React.useMemo(() => {
    const baseTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.foreground,
        border: colors.border,
        notification: colors.destructive,
      },
    };
  }, [colors, resolvedTheme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      colors,
      themePreference,
      resolvedTheme,
      setThemePreference,
      toggleTheme: () => {
        setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark');
      },
    }),
    [colors, resolvedTheme, setThemePreference, themePreference],
  );

  if (!isHydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        {children}
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
