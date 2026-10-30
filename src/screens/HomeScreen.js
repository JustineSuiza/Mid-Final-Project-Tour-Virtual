import React, { useCallback, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DestinationCard from '../components/DestinationCard';
import { getHomeData } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categories, categoryMeta, colors, fonts } from '../theme';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { surface, text, mutedText, border } = useAppTheme();
  const [home, setHome] = useState({ total: 0, completed: 0, counts: {}, upNext: [] });

  useFocusEffect(
    useCallback(() => {
      getHomeData().then(setHome);
    }, [])
  );

  const pct = home.total ? home.completed / home.total : 0;

  return (
    <ImageBackground source={require('../../images/beach.jpeg')} style={styles.background} resizeMode="cover">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 12 }}
      >
        <View style={[styles.content, { backgroundColor: surface }]}>
          <Text style={[styles.title, { color: text }]}>Explore CALABARZON</Text>
          <Text style={[styles.sub, { color: mutedText }]}>
            Visit heritage sites and natural wonders in Cavite, Laguna, Batangas, Rizal, and Quezon from wherever you are.
          </Text>

          <Pressable style={styles.progress} onPress={() => navigation.navigate('Progress')} accessibilityRole="button">
            <View style={{ flex: 1 }}>
              <Text style={styles.progressTitle}>
                {home.completed} of {home.total} destinations completed
              </Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </Pressable>

          <Text style={[styles.heading, { color: text }]}>Browse by category</Text>
          <View style={styles.grid}>
            {categories.map((c) => (
              <Pressable
                key={c}
                style={[styles.tile, { backgroundColor: categoryMeta[c].color }]}
                onPress={() => navigation.navigate('Destinations', { category: c })}
                accessibilityRole="button"
                accessibilityLabel={`${c}, ${home.counts[c] || 0} destinations`}
              >
                <Icon name={categoryMeta[c].icon} size={28} color="rgba(255,255,255,0.9)" />
                <Text style={styles.tileName}>{c}</Text>
                <Text style={styles.tileCount}>{home.counts[c] || 0} places</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.tile, styles.tileAll, { backgroundColor: surface, borderColor: border }]}
              onPress={() => navigation.navigate('Destinations', { category: 'All' })}
              accessibilityRole="button"
            >
              <Icon name="map-search-outline" size={28} color={colors.primary} />
              <Text style={[styles.tileName, { color: text }]}>All destinations</Text>
              <Text style={[styles.tileCount, { color: mutedText }]}>{home.total} places</Text>
            </Pressable>
          </View>

          <Text style={[styles.heading, { color: text }]}>Up next</Text>
          {home.upNext.length === 0 ? (
            <Text style={[styles.empty, { color: mutedText }]}>
              You have completed every destination. Add a new one from the Destinations tab.
            </Text>
          ) : (
            home.upNext.map((item) => (
              <DestinationCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  content: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
  },
  title: { fontFamily: fonts.serif, fontSize: 32, fontWeight: '700', color: colors.ink },
  sub: { fontSize: 16, lineHeight: 23, color: colors.muted, marginTop: 8, marginBottom: 18 },
  progress: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    borderRadius: 12, padding: 16,
  },
  progressTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.gold },
  heading: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', color: colors.ink, marginTop: 26, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: { width: '48%', borderRadius: 12, padding: 14, minHeight: 104, justifyContent: 'space-between' },
  tileAll: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  tileName: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 8 },
  tileCount: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
