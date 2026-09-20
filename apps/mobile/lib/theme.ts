import { useColorScheme } from 'react-native';

export const palette = {
  light: {
    background: '#f5f6fa',
    foreground: '#0f1117',
    card: '#ffffff',
    muted: '#5a6072',
    border: '#d2d6e4',
    primary: '#5b6ef7',
    primaryText: '#ffffff',
    accent: '#ecefff',
    danger: '#dc323c',
    success: '#059669',
  },
  dark: {
    background: '#0a0b0f',
    foreground: '#f0f0f5',
    card: '#12141c',
    muted: '#969cb0',
    border: '#303444',
    primary: '#5b6ef7',
    primaryText: '#ffffff',
    accent: '#242844',
    danger: '#ef4444',
    success: '#34d399',
  },
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { isDark, colors: isDark ? palette.dark : palette.light };
}
