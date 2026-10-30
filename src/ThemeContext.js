import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'calabarzon-tour-theme';
const MOTION_KEY = 'calabarzon-tour-motion-blur';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [themeError, setThemeError] = useState('');
  const [motionBlur, setMotionBlurState] = useState(true);
  const [motionBlurError, setMotionBlurError] = useState('');

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

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(MOTION_KEY).then((saved) => {
      if (active && saved !== null) setMotionBlurState(saved !== '0');
    }).catch((error) => {
      if (active) setMotionBlurError(`Could not load motion setting: ${error.message || error}`);
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

  const changeMotionBlur = useCallback(async (nextMotionBlur) => {
    try {
      await AsyncStorage.setItem(MOTION_KEY, nextMotionBlur ? '1' : '0');
      setMotionBlurState(nextMotionBlur);
      setMotionBlurError('');
    } catch (error) {
      const message = `Could not save motion setting: ${error.message || error}`;
      setMotionBlurError(message);
      throw new Error(message);
    }
  }, []);

  const value = useMemo(() => ({
    isDark,
    setIsDark: changeTheme,
    themeError,
    motionBlur,
    setMotionBlur: changeMotionBlur,
    motionBlurError,
    background: isDark ? '#0D141C' : '#F2F4F2',
    surface: isDark ? '#16212D' : '#FFFFFF',
    text: isDark ? '#E8EEF5' : '#14232A',
    mutedText: isDark ? '#93A4B8' : '#5B6B72',
    border: isDark ? '#263646' : '#D9E0DE',
    accent: isDark ? '#6AA5FF' : '#0F4C5C',
  }), [changeMotionBlur, changeTheme, isDark, motionBlur, motionBlurError, themeError]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within ThemeProvider');
  return theme;
}
