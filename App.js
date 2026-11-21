import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/db/database';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useAppTheme } from './src/ThemeContext';
import { AccountProvider } from './src/AccountContext';
import { MAX_WIDTH, colors } from './src/theme';
import { markProgressFonts } from './src/utils/progressStats';
import IntroScreen from './src/screens/IntroScreen';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  markProgressFonts('web');
  if (!document.getElementById('plus-jakarta-sans')) {
    const link = document.createElement('link');
    link.id = 'plus-jakarta-sans';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap';
    document.head.appendChild(link);
  }
}

function AppContent() {
  const { isDark, background } = useAppTheme();
  const [showIntro, setShowIntro] = useState(true);
  return (
    <>
      <StatusBar
        barStyle={showIntro || isDark ? 'light-content' : 'dark-content'}
        translucent={showIntro}
        backgroundColor={showIntro ? 'transparent' : background}
      />
      <View style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: isDark ? '#080E14' : '#FFFFFF',
      }}>
        <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? MAX_WIDTH : undefined, backgroundColor: background }}>
          {showIntro
            ? <IntroScreen onExplore={() => setShowIntro(false)} />
            : <AppNavigator />}
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
      .catch((e) => {
        console.error('Database init failed', e);
        setError(e);
      });
  }, []);

  if (error) {
    const msg = String(error?.message || error || 'Unknown error');
    const details = error?.code ? `${error.code}: ${msg}` : msg;
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.paper }}>
        <Text style={{ color: colors.danger, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          App failed to start
        </Text>
        <Text style={{ color: colors.ink, fontSize: 14, lineHeight: 20 }}>
          {details}
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
      <AccountProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AccountProvider>
    </SafeAreaProvider>
  );
}
