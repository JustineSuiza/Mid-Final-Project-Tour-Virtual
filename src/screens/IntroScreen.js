import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';

const introVideo = require('../../Wake Up in CALABARZON _ Philippines Tourism Ad.mp4');
const FOOTER_HEIGHT = 112;

export default function IntroScreen({ onExplore }) {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(introVideo, (videoPlayer) => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
  });

  useEffect(() => {
    player.play();
  }, [player]);

  return (
    <View style={styles.screen}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.04)', 'rgba(0,0,0,0.45)']}
        locations={[0, 0.48, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headline}>
        <Text style={styles.welcome}>MABUHAY!</Text>
        <Text style={styles.headlineLine}>EXPLORE THE</Text>
        <Text style={styles.headlineLine}>PHILIPPINES</Text>
      </View>

      <Pressable
        onPress={onExplore}
        style={[styles.exploreButton, { bottom: FOOTER_HEIGHT + insets.bottom + 22 }]}
        accessibilityRole="button"
        accessibilityLabel="Explore Calabarzon"
      >
        <Text style={styles.exploreText}>Explore</Text>
      </Pressable>

      <View style={[styles.footer, { height: FOOTER_HEIGHT + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Text style={styles.loveLogo} accessibilityLabel="Love the Philippines">
          <Text style={styles.logoL}>L</Text>
          <Text style={styles.logoO}>O</Text>
          <Text style={styles.logoV}>V</Text>
          <Text style={styles.logoE}>E</Text>
        </Text>
        <Text style={styles.logoCaption}>THE PHILIPPINES</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#071a1a', overflow: 'hidden' },
  headline: {
    position: 'absolute',
    top: '43%',
    left: 28,
    right: 20,
  },
  welcome: {
    color: '#fff',
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  headlineLine: {
    color: '#fff',
    fontSize: 31,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  exploreButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: '70%',
    maxWidth: 340,
    minHeight: 58,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  loveLogo: {
    fontSize: 60,
    lineHeight: 58,
    fontWeight: '900',
    letterSpacing: -3,
  },
  logoL: { color: '#E84238' },
  logoO: { color: '#1E9B58' },
  logoV: { color: '#2381C5' },
  logoE: { color: '#F0A72E' },
  logoCaption: {
    color: '#1C2A79',
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: -4,
  },
});
