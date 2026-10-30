import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAppTheme } from '../ThemeContext';
import { colors } from '../theme';

// Opens an external 360° tour (for example, a Panotour page such as
// https://nmfa.nationalmuseum.gov.ph/) inside the app.
export default function Tour360Screen({ route }) {
  const { background, surface, text, mutedText } = useAppTheme();
  const { url } = route.params;
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={[styles.title, { color: text }]}>The 360° tour could not load</Text>
        <Text style={[styles.text, { color: mutedText }]}>Check your internet connection and the tour link, then open this screen again.</Text>
      </View>
    );
  }
  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1, backgroundColor: background }}
      startInLoadingState
      allowsInlineMediaPlayback
      javaScriptEnabled
      onError={() => setFailed(true)}
      onHttpError={() => setFailed(true)}
      renderLoading={() => (
        <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.paper },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  text: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
