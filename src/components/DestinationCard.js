import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DestinationImage from './DestinationImage';
import { useAppTheme } from '../ThemeContext';
import { categoryMeta, colors, fonts } from '../theme';

export default function DestinationCard({ item, onPress, compact = false }) {
  const meta = categoryMeta[item.category] || categoryMeta.Cultural;
  const { surface, text, mutedText, border } = useAppTheme();
  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, ${item.address}, ${item.category}. ${item.description}`}
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: surface, borderColor: border },
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={styles.imageWrap}>
          <DestinationImage uri={item.imageUri} category={item.category} style={styles.compactImg} />
          <View style={styles.location}>
            <Icon name="map-marker" size={14} color="#fff" />
            <Text style={styles.locationText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>
        <View style={styles.compactBody}>
          <Text style={[styles.name, { color: text }]} numberOfLines={2}>{item.name}</Text>
          <View style={[styles.compactPill, { backgroundColor: meta.color + '1A' }]}>
            <Text style={[styles.compactPillText, { color: meta.color }]} numberOfLines={1}>{item.category}</Text>
          </View>
          <Text style={[styles.description, { color: mutedText }]} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.category}`}
      style={({ pressed }) => [styles.card, { backgroundColor: surface, borderColor: border }, pressed && { opacity: 0.9 }]}
    >
      <DestinationImage uri={item.imageUri} category={item.category} style={styles.img} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: text }]} numberOfLines={2}>{item.name}</Text>
        <View style={styles.row}>
          <Icon name="map-marker-outline" size={14} color={mutedText} />
          <Text style={[styles.addr, { color: mutedText }]} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.pill, { backgroundColor: meta.color + '1A' }]}>
            <Text style={[styles.pillText, { color: meta.color }]}>{item.category}</Text>
          </View>
          {item.completed === 1 ? (
            <View style={styles.row}>
              <Icon name="check-circle" size={14} color={colors.success} />
              <Text style={styles.done}>Completed</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 10,
    marginBottom: 12,
  },
  img: { width: 92, height: 92, borderRadius: 8 },
  body: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  name: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addr: { flex: 1, fontSize: 13, color: colors.muted },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: '700' },
  done: { fontSize: 12, color: colors.success, fontWeight: '600' },
  compactCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageWrap: { position: 'relative' },
  compactImg: { width: '100%', height: 126 },
  location: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 4 },
  compactBody: { padding: 10, gap: 7 },
  compactPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  compactPillText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 12, lineHeight: 17 },
});
