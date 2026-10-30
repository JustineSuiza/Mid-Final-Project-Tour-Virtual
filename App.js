import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/ThemeContext';
import { MAX_WIDTH, colors } from './src/theme';

function AppContent() {
  const { isDark, background } = useAppTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: isDark ? '#080E14' : Platform.OS === 'web' ? '#DCE3E1' : background,
      }}>
        <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? MAX_WIDTH : undefined, backgroundColor: background }}>
          <AppNavigator />
        </View>
      </View>
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((e) => setError(e));
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.paper }}>
        <Text style={{ color: colors.danger, fontSize: 16 }}>
          The database could not be opened: {String(error.message || error)}
        </Text>
      </View>
    );
  }
  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
