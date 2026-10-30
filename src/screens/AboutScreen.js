import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const { background, surface, text, mutedText, border } = useAppTheme();

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

      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <Text style={[styles.heading, { color: text }]}>About the app</Text>
        <Text style={[styles.body, { color: mutedText }]}>
          CALABARZON Tour is a virtual tour and cultural mapping app for Cavite, Laguna, Batangas, Rizal, and Quezon.
          Explore destinations, learn about their history and cultural significance, and test your knowledge with quizzes.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <Text style={[styles.heading, { color: text }]}>Explore and learn</Text>
        <Text style={[styles.body, { color: mutedText }]}>
          Browse places by category, view destination galleries, and track your quiz progress as you discover the region.
        </Text>
      </View>
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
  title: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  tagline: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
  },
  heading: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: colors.ink },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted, marginTop: 8 },
});
