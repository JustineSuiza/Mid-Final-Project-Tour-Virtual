import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

export const mapLink = (latitude, longitude) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;

const embedUrl = (lat, lng) => {
  const d = 0.004;
  const bbox = [lng - d, lat - d, lng + d, lat + d].join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

export default function MapLocation({ name, address, latitude, longitude }) {
  const { surface, text, mutedText, border } = useAppTheme();
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: text }]}>Location</Text>
      <View style={[styles.mapCard, { backgroundColor: surface, borderColor: border }]}>
        <WebView
          source={{ uri: embedUrl(lat, lng) }}
          style={styles.web}
          scrollEnabled={false}
          originWhitelist={['*']}
          accessibilityLabel={`Map of ${name}`}
        />
        <Pressable
          style={styles.overlay}
          onPress={() => Linking.openURL(mapLink(lat, lng))}
          accessibilityRole="link"
          accessibilityLabel={`Open ${name} in Maps`}
        >
          <View style={styles.openBtn}>
            <Icon name="open-in-new" size={15} color="#fff" />
            <Text style={styles.openText}>Open in Maps</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Icon name="map-marker-outline" size={18} color={mutedText} />
        <Text style={[styles.address, { color: mutedText }]} numberOfLines={2}>{address}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 28 },
  heading: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  mapCard: { height: 220, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  web: { flex: 1, backgroundColor: 'transparent' },
  overlay: { ...StyleSheet.absoluteFillObject, padding: 10, alignItems: 'flex-end', justifyContent: 'flex-end' },
  openBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
  },
  openText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  address: { flex: 1, fontSize: 13 },
});
