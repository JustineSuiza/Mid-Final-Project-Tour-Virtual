import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import { useAppTheme } from '../ThemeContext';
import { colors } from '../theme';

// Browser version of the 360° tour: an iframe, with a fallback link for sites that block embedding.
export default function Tour360Screen({ route }) {
  const { background, mutedText } = useAppTheme();
  const { url } = route.params;
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <View style={styles.bar}>
        <Text style={[styles.note, { color: mutedText }]}>If the tour stays blank, the site may block embedding. Open it in a new tab instead.</Text>
        <Button label="Open in new tab" icon="open-in-new" variant="secondary" onPress={() => Linking.openURL(url)} />
      </View>
      {React.createElement('iframe', {
        src: url,
        title: '360° tour',
        allow: 'fullscreen; accelerometer; gyroscope; xr-spatial-tracking',
        allowFullScreen: true,
        style: { flex: 1, minHeight: 420, width: '100%', border: 'none' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, flexWrap: 'wrap' },
  note: { flex: 1, minWidth: 220, fontSize: 14, color: colors.muted, lineHeight: 20 },
});
