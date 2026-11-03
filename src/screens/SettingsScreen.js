import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    isDark, setIsDark, themeError,
    musicEnabled, setMusicEnabled, musicVolume, setMusicVolume, musicError,
    background, surface, text, mutedText, border, accent,
  } = useAppTheme();
  const toggleRef = useRef(null);
  const transitionInProgress = useRef(false);
  const [toggleError, setToggleError] = useState('');
  const [volumePreview, setVolumePreview] = useState(musicVolume);

  useEffect(() => {
    setVolumePreview(musicVolume);
  }, [musicVolume]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    const style = document.createElement('style');
    style.textContent = `
      ::view-transition-old(root) {
        animation: none;
        mix-blend-mode: normal;
      }
      ::view-transition-new(root) {
        animation: theme-reveal 300ms ease-out;
      }
      @keyframes theme-reveal {
        from {
          clip-path: circle(0px at var(--theme-transition-x, 50vw) var(--theme-transition-y, 50vh));
        }
        to {
          clip-path: circle(var(--theme-transition-radius, 150vmax) at var(--theme-transition-x, 50vw) var(--theme-transition-y, 50vh));
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const toggleTheme = async (nextIsDark = !isDark) => {
    setToggleError('');
    const change = async () => {
      try {
        await setIsDark(nextIsDark);
      } catch (error) {
        setToggleError(error.message);
      }
    };

    if (
      Platform.OS === 'web' &&
      typeof document !== 'undefined' &&
      typeof document.startViewTransition === 'function' &&
      !(typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      if (transitionInProgress.current) {
        await change();
        return;
      }

      const bounds = toggleRef.current?.getBoundingClientRect();
      const x = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;
      const y = bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const root = document.documentElement;
      root.style.setProperty('--theme-transition-x', `${x}px`);
      root.style.setProperty('--theme-transition-y', `${y}px`);
      root.style.setProperty('--theme-transition-radius', `${radius}px`);
      try {
        transitionInProgress.current = true;
        const transition = document.startViewTransition(change);
        transition.ready.catch((error) => {
          console.warn('Theme reveal animation could not start:', error);
        });
        transition.finished.then(
          () => { transitionInProgress.current = false; },
          () => { transitionInProgress.current = false; }
        );
      } catch (error) {
        transitionInProgress.current = false;
        console.warn('Theme transition could not start:', error);
        await change();
      }
      return;
    }
    await change();
  };

  const toggleMusic = async (nextEnabled) => {
    try {
      await setMusicEnabled(nextEnabled);
    } catch (error) {
      // The error message is exposed through musicError.
    }
  };

  const saveMusicVolume = async (nextVolume) => {
    try {
      await setMusicVolume(nextVolume);
    } catch (error) {
      setVolumePreview(musicVolume);
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={[styles.title, { color: text }]}>Settings</Text>
      <View style={[styles.settingRow, { borderBottomColor: border }]}>
        <Text style={[styles.settingLabel, { color: text }]}>Music</Text>
        <View style={styles.musicControls}>
          <Slider
            style={styles.musicSlider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={volumePreview}
            onValueChange={setVolumePreview}
            onSlidingComplete={saveMusicVolume}
            minimumTrackTintColor={accent}
            maximumTrackTintColor={border}
            thumbTintColor={accent}
            accessibilityLabel="Music volume"
          />
          <Text style={[styles.volumeValue, { color: mutedText }]}>
            {Math.round(volumePreview * 100)}%
          </Text>
          <Switch
            value={musicEnabled}
            onValueChange={toggleMusic}
            trackColor={{ false: border, true: accent }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={border}
            accessibilityRole="switch"
            accessibilityState={{ checked: musicEnabled }}
            accessibilityLabel="Toggle music"
          />
        </View>
      </View>
      {musicError ? <Text style={styles.error}>{musicError}</Text> : null}

      <View style={[styles.settingRow, { borderBottomColor: border }]}>
        <Text style={[styles.settingLabel, { color: text }]}>Dark theme</Text>
        <Switch
          ref={toggleRef}
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: border, true: accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={border}
          accessibilityRole="switch"
          accessibilityState={{ checked: isDark }}
          accessibilityLabel="Toggle dark theme"
        />
      </View>
      {themeError || toggleError ? <Text style={styles.error}>{toggleError || themeError}</Text> : null}

      <Text style={[styles.sectionTitle, { color: text }]}>Data and privacy</Text>
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.iconBox}>
          <Icon name="database-outline" size={23} color={accent} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color: text }]}>Your tour data</Text>
          <Text style={[styles.description, { color: mutedText }]}>
            Destinations, photos, and quiz progress are saved on this device or in this browser. They are not synced between devices.
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  title: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: colors.ink },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  musicControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  musicSlider: { width: 116, height: 40 },
  volumeValue: { width: 36, fontSize: 12, textAlign: 'right' },
  error: { color: colors.danger, fontSize: 13, lineHeight: 18, marginTop: 8 },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 22,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F0EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  description: { fontSize: 14, lineHeight: 20, color: colors.muted, marginTop: 4 },
});
