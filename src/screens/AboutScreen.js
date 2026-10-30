import React, { useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

function InfoCard({ title, children }) {
  const [open, setOpen] = useState(false);
  const { text, mutedText, border } = useAppTheme();
  const height = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const measuredHeight = useRef(0);

  const toggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    Animated.parallel([
      Animated.timing(height, {
        toValue: nextOpen ? measuredHeight.current : 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: nextOpen ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <View style={[styles.card, { borderBottomColor: border }]}>
      <Pressable
        style={styles.cardHeader}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}, ${open ? 'hide details' : 'show details'}`}
      >
        <Text style={[styles.heading, { color: text }]}>{title}</Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={24} color={mutedText} />
      </Pressable>
      <Animated.View
        style={{ height, opacity, overflow: 'hidden' }}
        accessibilityElementsHidden={!open}
        importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      >
        <Text style={[styles.body, { color: mutedText }]}>{children}</Text>
      </Animated.View>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.measurer}
        onLayout={(event) => {
          const nextHeight = event.nativeEvent.layout.height;
          if (!nextHeight) return;
          measuredHeight.current = nextHeight;
          if (open) height.setValue(nextHeight);
        }}
      >
        <Text style={[styles.body, { color: mutedText }]}>{children}</Text>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { background, text, mutedText } = useAppTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Icon name="map-marker-radius-outline" size={38} color="#fff" />
        </View>
        <Text style={[styles.title, { color: text }]}>CALABARZON Tour</Text>
        <Text style={[styles.tagline, { color: mutedText }]}>Discover the places and stories of Region IV-A.</Text>
      </View>

      <InfoCard title="About the app">
        CALABARZON Tour is a virtual tour and cultural mapping app for Cavite, Laguna, Batangas, Rizal, and Quezon.
        Explore destinations, learn about their history and cultural significance, and test your knowledge with quizzes.
      </InfoCard>

      <InfoCard title="Explore and learn">
        Browse places by category, view destination galleries, and track your quiz progress as you discover the region.
      </InfoCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  hero: { alignItems: 'center', paddingVertical: 28 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontFamily: fonts.sans, fontSize: 28, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  tagline: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6 },
  card: {
    paddingVertical: 16,
    marginTop: 12,
    borderBottomWidth: 1,
  },
  heading: { flex: 1, fontFamily: fonts.sans, fontSize: 20, fontWeight: '700', color: colors.ink },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted, marginTop: 8 },
  measurer: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
});
