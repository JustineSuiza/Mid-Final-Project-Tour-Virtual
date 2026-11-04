import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAppTheme } from '../ThemeContext';
import { createDestinationMapHtml } from '../utils/destinationMapHtml';

export default function DestinationMap({ destinations, height }) {
  const { text } = useAppTheme();
  const [webViewError, setWebViewError] = useState('');
  const html = createDestinationMapHtml(destinations);
  const mapContent = Platform.OS === 'web'
    ? React.createElement('iframe', {
      srcDoc: html,
      title: 'Map showing destination locations',
      loading: 'lazy',
      style: styles.webMap,
    })
    : (
      <WebView
        source={{ html }}
        style={styles.nativeMap}
        scrollEnabled
        nestedScrollEnabled
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onError={(event) => setWebViewError(event.nativeEvent.description || 'Could not load the map.')}
        accessibilityLabel="Interactive Mapbox map showing destination locations"
      />
    );

  return (
    <View style={styles.wrap}>
      <View style={[styles.mapSection, { height }]}>
        {mapContent}
      </View>
      {webViewError ? <Text style={[styles.error, { color: text }]}>{webViewError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginBottom: 20 },
  mapSection: { width: '100%', overflow: 'hidden', borderRadius: 12 },
  nativeMap: { flex: 1, backgroundColor: 'transparent' },
  webMap: { display: 'block', width: '100%', height: '100%', border: 'none' },
  error: { fontSize: 13, marginTop: 6 },
});
