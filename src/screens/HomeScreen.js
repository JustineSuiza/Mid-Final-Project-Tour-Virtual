import React, { useCallback, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DestinationCard from '../components/DestinationCard';
import { getHomeData } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categories, categoryMeta, colors, fonts } from '../theme';

export default function HomeScreen({ navigation }) {
  const { surface, text, mutedText, border, background } = useAppTheme();
  const [home, setHome] = useState({ total: 0, completed: 0, counts: {}, upNext: [] });

  useFocusEffect(
    useCallback(() => {
      getHomeData().then(setHome);
    }, [])
  );

  const pct = home.total ? home.completed / home.total : 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: background }]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <View style={[styles.content, { flex: 1 }]}>
        <ImageBackground
          source={require('../../images/beach.jpeg')}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel="Beach landscape"
        >
          <View style={[StyleSheet.absoluteFillObject, styles.heroOverlay]} />
          <View style={styles.heroContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: '#FFFFFF' }]}>
                Explore <Text style={[styles.titleAccent, { color: '#F6D278' }]}>CALABARZON</Text>
              </Text>
              <Image
                source={require('../../images/flag.gif')}
                style={styles.flag}
                contentFit="cover"
                accessibilityLabel="Philippine flag"
              />
            </View>
            <Text style={styles.sub}>
              Visit heritage sites and natural wonders in Cavite, Laguna, Batangas, Rizal, and Quezon from wherever you are.
            </Text>
          </View>
        </ImageBackground>

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
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: 20,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    height: 300,
    flexShrink: 0,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 18,
  },
  heroOverlay: {
    backgroundColor: 'rgba(7, 24, 34, 0.38)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  title: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
    color: colors.ink,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flag: { width: 84, height: 56, borderRadius: 6 },
  titleAccent: { fontWeight: '800', letterSpacing: 0.4 },
  sub: { fontSize: 16, lineHeight: 23, color: '#FFFFFF', marginTop: 8 },
  progress: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    borderRadius: 12, padding: 16,
  },
  progressTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 10 },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.gold },
  heading: {
    fontFamily: fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.ink,
    marginTop: 26,
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: { width: '48%', borderRadius: 12, padding: 14, minHeight: 104, justifyContent: 'space-between' },
  tileAll: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  tileName: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 8 },
  tileCount: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
