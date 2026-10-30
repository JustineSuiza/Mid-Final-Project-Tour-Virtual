import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDark, setIsDark, themeError, motionBlur, setMotionBlur, motionBlurError, background, surface, text, mutedText, border, accent } = useAppTheme();
  const toggleRef = useRef(null);
  const transitionInProgress = useRef(false);
  const iconScale = useRef(new Animated.Value(1)).current;
  const [toggleError, setToggleError] = useState('');

  const animateToggleIcon = () => {
    Animated.sequence([
      Animated.timing(iconScale, { toValue: 0.1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 16, bounciness: 8 }),
    ]).start();
  };

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

  const toggleTheme = async () => {
    const nextIsDark = !isDark;
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
          animateToggleIcon();
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
    animateToggleIcon();
  };

  const toggleMotionBlur = async (nextMotionBlur) => {
    try {
      await setMotionBlur(nextMotionBlur);
    } catch (error) {
      // The error message is exposed through motionBlurError.
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={[styles.title, { color: text }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: mutedText }]}>Manage app appearance, navigation, and learn how your tour data is stored.</Text>

      <Text style={[styles.sectionTitle, { color: text }]}>Appearance</Text>
      <View style={[styles.themeCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.themeCopy}>
          <Text style={[styles.cardTitle, { color: text }]}>Dark theme</Text>
          <Text style={[styles.description, { color: mutedText }]}>
            {isDark ? 'Dark appearance is on' : 'Use a darker appearance'}
          </Text>
        </View>
        <Pressable
          ref={toggleRef}
          style={[styles.themeToggle, { borderColor: accent }]}
          onPress={toggleTheme}
          accessibilityRole="switch"
          accessibilityState={{ checked: isDark }}
          accessibilityLabel="Toggle dark theme"
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Icon name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'} size={25} color={accent} />
          </Animated.View>
        </Pressable>
      </View>
      {themeError || toggleError ? <Text style={styles.error}>{toggleError || themeError}</Text> : null}

      <Text style={[styles.sectionTitle, { color: text }]}>Navigation</Text>
      <View style={[styles.themeCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.themeCopy}>
          <Text style={[styles.cardTitle, { color: text }]}>Motion blur</Text>
          <Text style={[styles.description, { color: mutedText }]}>
            {motionBlur ? 'The tab circle stretches as it slides' : 'The tab circle moves without stretching'}
          </Text>
        </View>
        <Switch
          value={motionBlur}
          onValueChange={toggleMotionBlur}
          trackColor={{ false: border, true: accent }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={border}
          accessibilityRole="switch"
          accessibilityState={{ checked: motionBlur }}
          accessibilityLabel="Toggle motion blur"
        />
      </View>
      {motionBlurError ? <Text style={styles.error}>{motionBlurError}</Text> : null}

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

      <Text style={[styles.sectionTitle, { color: text }]}>Application</Text>
      <Pressable
        style={[styles.linkCard, { backgroundColor: surface, borderColor: border }]}
        onPress={() => navigation.navigate('About')}
        accessibilityRole="button"
      >
        <View style={styles.iconBox}>
          <Icon name="information-outline" size={23} color={accent} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={[styles.cardTitle, { color: text }]}>About CALABARZON Tour</Text>
          <Text style={[styles.description, { color: mutedText }]}>Learn about this cultural mapping and virtual tour app.</Text>
        </View>
        <Icon name="chevron-right" size={24} color={mutedText} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  title: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: 6, marginBottom: 12 },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 14,
  },
  themeCopy: { flex: 1 },
  themeToggle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
