import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DestinationImage from '../components/DestinationImage';
import { useAppTheme } from '../ThemeContext';
import { categoryMeta, fonts } from '../theme';
import { getRecentlyViewedDestinations } from '../utils/recentlyViewed';

function getViewedSection(viewedAt) {
  const viewedDate = new Date(viewedAt);
  if (!Number.isFinite(viewedDate.getTime())) return 'Earlier';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewedDay = new Date(viewedDate);
  viewedDay.setHours(0, 0, 0, 0);
  const daysAgo = Math.round((today.getTime() - viewedDay.getTime()) / 86400000);

  if (daysAgo <= 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return 'Earlier';
}

export default function RecentlyViewedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { background, surface, text, mutedText, border } = useAppTheme();
  const [destinations, setDestinations] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getRecentlyViewedDestinations()
        .then((items) => {
          if (active) setDestinations(items);
        })
        .catch((error) => {
          console.warn('Could not load recently viewed destinations:', error);
        });

      return () => { active = false; };
    }, [])
  );

  const sections = ['Today', 'Yesterday', 'Earlier']
    .map((title) => ({
      title,
      items: destinations.filter((item) => getViewedSection(item.viewedAt) === title),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={text} />
        </Pressable>
        <Text style={[styles.title, { color: text }]}>Recently viewed</Text>
      </View>

      {sections.length ? sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>{section.title}</Text>
          {section.items.map((item) => {
            const meta = categoryMeta[item.category] || categoryMeta.Cultural;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.destination,
                  { backgroundColor: surface, borderColor: border },
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.category}, ${item.province || item.address}`}
              >
                <DestinationImage
                  uri={item.imageUri}
                  category={item.category}
                  style={styles.destinationImage}
                />
                <View style={styles.destinationInfo}>
                  <Text style={[styles.location, { color: mutedText }]} numberOfLines={1}>
                    <Text style={{ color: meta.color }}>{item.category}</Text>
                    {item.province ? ` · ${item.province}` : ''}
                  </Text>
                  <Text style={[styles.destinationName, { color: text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[styles.description, { color: mutedText }]} numberOfLines={3}>
                    {item.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )) : (
        <View style={[styles.emptyState, { backgroundColor: surface, borderColor: border }]}>
          <Icon name="history" size={32} color={mutedText} />
          <Text style={[styles.emptyTitle, { color: text }]}>No places viewed yet</Text>
          <Text style={[styles.emptyText, { color: mutedText }]}>
            Destinations you open will show up here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.sans, fontSize: 22, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: fonts.sans, fontSize: 17, fontWeight: '700', marginBottom: 12 },
  destination: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  destinationImage: { width: 112, height: 112, borderRadius: 12 },
  destinationInfo: { flex: 1, justifyContent: 'center', gap: 5 },
  location: { fontSize: 13, lineHeight: 18 },
  destinationName: { fontFamily: fonts.sans, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  description: { fontSize: 13, lineHeight: 18 },
  pressed: { opacity: 0.88 },
  emptyState: {
    alignItems: 'center',
    padding: 28,
    borderWidth: 1,
    borderRadius: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 10 },
  emptyText: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 4 },
});
