import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';
import React, { type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { paperDarkTheme, paperLightTheme } from './theme';

function navigationThemeFrom(
  base: NavigationTheme,
  paper: typeof paperLightTheme,
): NavigationTheme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: paper.colors.primary,
      background: paper.colors.background,
      card: paper.colors.surface,
      text: paper.colors.onSurface,
      border: paper.colors.outlineVariant,
      notification: paper.colors.error,
    },
  };
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const paperTheme = isDark ? paperDarkTheme : paperLightTheme;
  const navigationTheme = navigationThemeFrom(
    isDark ? NavigationDarkTheme : NavigationLightTheme,
    paperTheme,
  );

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeContext.Provider value={navigationTheme}>
        {children}
      </NavigationThemeContext.Provider>
    </PaperProvider>
  );
}

const NavigationThemeContext = React.createContext<NavigationTheme>(NavigationLightTheme);

export function useNavigationTheme() {
  return React.useContext(NavigationThemeContext);
}
