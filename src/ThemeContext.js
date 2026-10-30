import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'calabarzon-tour-theme';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [themeError, setThemeError] = useState('');

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((savedTheme) => {
      if (active && (savedTheme === 'light' || savedTheme === 'dark')) {
        setIsDark(savedTheme === 'dark');
      }
    }).catch((error) => {
      if (active) setThemeError(`Could not load appearance setting: ${error.message || error}`);
    });
    return () => { active = false; };
  }, []);

  const changeTheme = useCallback(async (nextIsDark) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextIsDark ? 'dark' : 'light');
      setIsDark(nextIsDark);
      setThemeError('');
    } catch (error) {
      const message = `Could not save appearance setting: ${error.message || error}`;
      setThemeError(message);
      throw new Error(message);
    }
  }, []);

  const value = useMemo(() => ({
    isDark,
    setIsDark: changeTheme,
    themeError,
    background: isDark ? '#0D141C' : '#F2F4F2',
    surface: isDark ? '#16212D' : '#FFFFFF',
    text: isDark ? '#E8EEF5' : '#14232A',
    mutedText: isDark ? '#93A4B8' : '#5B6B72',
    border: isDark ? '#263646' : '#D9E0DE',
    accent: isDark ? '#6AA5FF' : '#0F4C5C',
  }), [changeTheme, isDark, themeError]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within ThemeProvider');
  return theme;
}
