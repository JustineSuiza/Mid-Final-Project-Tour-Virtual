import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

export const mapLink = (latitude, longitude) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;

// Browser version of the location card: an embedded map, with a link for opening the full map.
export default function MapLocation({ name, address, latitude, longitude }) {
  const { surface, text, mutedText, border } = useAppTheme();
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: text }]}>Location</Text>
      <View style={[styles.mapCard, { borderColor: border, backgroundColor: surface }]}>
        {React.createElement('iframe', {
          src: `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`,
          title: `Map of ${name}`,
          loading: 'lazy',
          referrerPolicy: 'no-referrer-when-downgrade',
          style: { display: 'block', width: '100%', height: '100%', border: 'none' },
        })}
      </View>
      <Pressable
        style={styles.row}
        onPress={() => Linking.openURL(mapLink(lat, lng))}
        accessibilityRole="link"
        accessibilityLabel={`Open ${name} in Google Maps`}
      >
        <Icon name="map-marker-outline" size={18} color={mutedText} />
        <Text style={[styles.address, { color: mutedText }]} numberOfLines={2}>{address}</Text>
        <Text style={styles.link}>Open in Google Maps</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  heading: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  mapCard: { height: 220, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  address: { flex: 1, fontSize: 13 },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
