import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import DestinationImage from '../components/DestinationImage';
import { getDestination, getQuestionCount } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { MAX_WIDTH, colors, fonts } from '../theme';

export default function VirtualTourScreen({ route, navigation }) {
  const { background, text, mutedText } = useAppTheme();
  const { id } = route.params;
  const width = Math.min(useWindowDimensions().width, MAX_WIDTH);
  const listRef = useRef(null);
  const [dest, setDest] = useState(null);
  const [qCount, setQCount] = useState(0);
  const [page, setPage] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setDest(await getDestination(id));
        setQCount(await getQuestionCount(id));
      })();
    }, [id])
  );

  const goTo = (i) => {
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    setPage(i);
  };

  if (!dest) return null;
  // The cover photo leads the gallery; with no photos at all we show one placeholder slide.
  const slides = [dest.imageUri, ...dest.photos].filter(Boolean);
  const gallery = slides.length ? slides : [null];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View>
      <FlatList
        ref={listRef}
        data={gallery}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <DestinationImage uri={item} category={dest.category} style={{ width, height: 260 }} iconSize={64} />
        )}
      />
      {gallery.length > 1 && page > 0 ? (
        <Pressable style={[styles.arrow, { left: 10 }]} onPress={() => goTo(page - 1)} accessibilityLabel="Previous photo">
          <Icon name="chevron-left" size={28} color="#fff" />
        </Pressable>
      ) : null}
      {gallery.length > 1 && page < gallery.length - 1 ? (
        <Pressable style={[styles.arrow, { right: 10 }]} onPress={() => goTo(page + 1)} accessibilityLabel="Next photo">
          <Icon name="chevron-right" size={28} color="#fff" />
        </Pressable>
      ) : null}
      </View>
      {gallery.length > 1 ? (
        <View style={styles.dots} accessibilityLabel={`Photo ${page + 1} of ${gallery.length}`}>
          {gallery.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
      ) : null}

      <View style={[styles.content, { backgroundColor: background }]}>
        <Text style={[styles.name, { color: text }]}>{dest.name}</Text>
        <Text style={[styles.address, { color: mutedText }]}>{dest.address}</Text>

        <Text style={[styles.heading, { color: text }]}>History</Text>
        <Text style={[styles.body, { color: text }]}>{dest.history || 'No historical notes have been added yet. Use Edit destination to add some.'}</Text>

        <Text style={[styles.heading, { color: text }]}>Cultural significance</Text>
        <Text style={[styles.body, { color: text }]}>{dest.significance || 'No notes on cultural significance have been added yet.'}</Text>

        {dest.tourUrl ? (
          <Button
            label="Open 360° tour"
            icon="rotate-3d-variant"
            variant="gold"
            onPress={() => navigation.navigate('Tour360', { url: dest.tourUrl, name: dest.name })}
            style={{ marginTop: 24 }}
          />
        ) : null}
        <Button
          label={qCount ? 'Test what you learned' : 'No quiz questions yet'}
          icon="school-outline"
          disabled={!qCount}
          onPress={() => navigation.navigate('Quiz', { destinationId: id, name: dest.name })}
          style={{ marginTop: 12 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute', top: 110, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  content: { padding: 20 },
  name: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: colors.ink },
  address: { fontSize: 15, color: colors.muted, marginTop: 4 },
  heading: { fontFamily: fonts.serif, fontSize: 21, fontWeight: '700', color: colors.ink, marginTop: 24, marginBottom: 8 },
  body: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 27, color: colors.ink },
});
