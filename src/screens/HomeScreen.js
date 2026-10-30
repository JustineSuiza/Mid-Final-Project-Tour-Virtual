import React, { useCallback, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import DestinationCard from '../components/DestinationCard';
import { getHomeData } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categories, categoryMeta, colors, fonts } from '../theme';

export default function HomeScreen({ navigation }) {
  const { surface, text, mutedText, background } = useAppTheme();
  const [home, setHome] = useState({ categoryImages: {}, upNext: [] });

  useFocusEffect(
    useCallback(() => {
      getHomeData().then(setHome);
    }, [])
  );

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

          <Text style={[styles.categoryHeading, { color: text }]}>Where to?</Text>
          <Text style={[styles.categorySubheading, { color: mutedText }]}>
            Adventure starts here. Take your pick.
          </Text>
          <View style={styles.grid}>
            {categories.map((c) => (
              <Pressable
                key={c}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Destinations', { category: c })}
                accessibilityRole="button"
                accessibilityLabel={`${c} destinations`}
              >
                <ImageBackground
                  source={
                    c === 'Museum'
                      ? require('../../images/meseum.jpg')
                      : c === 'Historical'
                      ? require('../../images/history.jpg')
                      : c === 'Religious'
                      ? require('../../images/religious.jpg')
                      : c === 'Cultural'
                      ? require('../../images/culture.jpg')
                      : home.categoryImages[c]
                      ? { uri: home.categoryImages[c] }
                      : c === 'Nature' ? require('../../images/beach.jpeg') : undefined
                  }
                  style={[styles.categoryImage, { backgroundColor: categoryMeta[c].color }]}
                  imageStyle={styles.categoryImageContent}
                  resizeMode="cover"
                />
                <View style={[styles.categoryLabel, { backgroundColor: surface }]}>
                  <Text style={[styles.categoryName, { color: text }]}>{c}</Text>
                </View>
              </Pressable>
            ))}
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
  categoryHeading: {
    fontFamily: fonts.sans,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
  },
  categorySubheading: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  heading: {
    fontFamily: fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.ink,
    marginTop: 26,
    marginBottom: 12,
  },
  grid: { gap: 16 },
  categoryCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    shadowColor: '#14232A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  categoryImageContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryLabel: {
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  empty: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
