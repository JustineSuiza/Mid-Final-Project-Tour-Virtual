import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'calabarzon-tour-theme';
const MOTION_KEY = 'calabarzon-tour-motion-blur';
const MUSIC_ENABLED_KEY = 'calabarzon-tour-music-enabled';
const MUSIC_VOLUME_KEY = 'calabarzon-tour-music-volume';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');
  const [themeError, setThemeError] = useState('');
  const [motionBlur, setMotionBlurState] = useState(true);
  const [motionBlurError, setMotionBlurError] = useState('');
  const [musicEnabled, setMusicEnabledState] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState(0.6);
  const [musicError, setMusicError] = useState('');

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

  useEffect(() => {
    let active = true;
    Promise.all([
      AsyncStorage.getItem(MUSIC_ENABLED_KEY),
      AsyncStorage.getItem(MUSIC_VOLUME_KEY),
    ]).then(([savedEnabled, savedVolume]) => {
      if (!active) return;
      if (savedEnabled !== null) setMusicEnabledState(savedEnabled === '1');
      if (savedVolume !== null) {
        const parsedVolume = Number(savedVolume);
        if (Number.isFinite(parsedVolume)) {
          setMusicVolumeState(Math.max(0, Math.min(1, parsedVolume)));
        }
      }
    }).catch((error) => {
      if (active) setMusicError(`Could not load music settings: ${error.message || error}`);
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

  const changeMusicEnabled = useCallback(async (nextEnabled) => {
    try {
      await AsyncStorage.setItem(MUSIC_ENABLED_KEY, nextEnabled ? '1' : '0');
      setMusicEnabledState(nextEnabled);
      setMusicError('');
    } catch (error) {
      const message = `Could not save music setting: ${error.message || error}`;
      setMusicError(message);
      throw new Error(message);
    }
  }, []);

  const changeMusicVolume = useCallback(async (nextVolume) => {
    const volume = Math.max(0, Math.min(1, nextVolume));
    try {
      await AsyncStorage.setItem(MUSIC_VOLUME_KEY, String(volume));
      setMusicVolumeState(volume);
      setMusicError('');
    } catch (error) {
      const message = `Could not save music volume: ${error.message || error}`;
      setMusicError(message);
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
    musicEnabled,
    setMusicEnabled: changeMusicEnabled,
    musicVolume,
    setMusicVolume: changeMusicVolume,
    musicError,
    background: isDark ? '#0D141C' : '#F2F4F2',
    surface: isDark ? '#16212D' : '#FFFFFF',
    text: isDark ? '#E8EEF5' : '#14232A',
    mutedText: isDark ? '#93A4B8' : '#5B6B72',
    border: isDark ? '#263646' : '#D9E0DE',
    accent: isDark ? '#6AA5FF' : '#0F4C5C',
  }), [
    changeMotionBlur, changeMusicEnabled, changeMusicVolume, changeTheme, isDark, motionBlur,
    motionBlurError, musicEnabled, musicError, musicVolume, themeError,
  ]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within ThemeProvider');
  return theme;
}
