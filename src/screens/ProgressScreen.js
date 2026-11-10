import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo, Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { getProgressDashboard } from '../db/database';
import TiltCard from '../components/TiltCard';
import { useAppTheme } from '../ThemeContext';
import {
  CATEGORY_COLORS, categoryColor, f, levelMeta, progressPalette, starText,
} from '../utils/progressStats';
import ScoreRing from '../components/ScoreRing';
import ScoreTrend, { trendDelta } from '../components/ScoreTrend';

const FILTERS = [
  ['all', 'All'],
  ['done', 'Done'],
  ['todo', 'To do'],
];

const EMPTY = {
  destinations: [],
  recent: [],
  quizzesTaken: 0,
  stars: 0,
  xp: 0,
  done: 0,
  avg: null,
};

function CheckMark() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12l5 5 9-10" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StarGlyph({ spin }) {
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spin) return undefined;
    const loop = Animated.loop(Animated.timing(turn, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    }));
    loop.start();
    return () => loop.stop();
  }, [spin, turn]);
  const rotateY = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={[{ transform: [{ perspective: 160 }, { rotateY }] }, Platform.OS === 'web' ? { filter: 'drop-shadow(0 2px 4px rgba(240,165,0,0.5))' } : null]}>
      <Svg width={28} height={28} viewBox="0 0 24 24">
        <Defs>
          <SvgGradient id="starGold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ffe98a" />
            <Stop offset="1" stopColor="#f0a500" />
          </SvgGradient>
        </Defs>
        <Path
          d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
          fill="url(#starGold)"
          stroke="#c98a00"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <Path d="M12 5.6l1.6 3.4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      </Svg>
    </Animated.View>
  );
}

export default function ProgressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const palette = useMemo(() => progressPalette(isDark), [isDark]);
  const [data, setData] = useState(EMPTY);
  const [filter, setFilter] = useState('all');
  const [reduce, setReduce] = useState(false);
  const [heroTilt, setHeroTilt] = useState(false);
  const shine = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const [heroWidth, setHeroWidth] = useState(320);

  const load = useCallback(() => {
    getProgressDashboard().then(setData).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (live) setReduce(!!value); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setReduce(!!value));
    return () => { live = false; sub?.remove?.(); };
  }, []);

  useEffect(() => {
    if (reduce) return undefined;
    const shineLoop = Animated.loop(Animated.sequence([
      Animated.delay(3025),
      Animated.timing(shine, { toValue: 1, duration: 2475, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]));
    const swayLoop = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    shineLoop.start();
    swayLoop.start();
    return () => { shineLoop.stop(); swayLoop.stop(); };
  }, [reduce, shine, sway]);

  const total = data.destinations.length;
  const meta = levelMeta(data.xp);
  const rows = data.destinations.filter((d) => {
    if (filter === 'done') return d.bestPct !== null;
    if (filter === 'todo') return d.bestPct === null;
    return true;
  });
  const categories = Object.keys(CATEGORY_COLORS).filter((name) => name !== 'Museum'
    || data.destinations.some((d) => d.category === 'Museum'));
  data.destinations.forEach((d) => {
    if (!categories.includes(d.category)) categories.push(d.category);
  });

  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-heroWidth * 0.6, heroWidth * 1.3],
  });
  const swayX = sway.interpolate({ inputRange: [0, 1], outputRange: ['2deg', '-2deg'] });
  const swayY = sway.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });

  const delta = data.recent.length ? trendDelta(data.recent) : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.bg }}
      contentContainerStyle={{
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
        paddingTop: insets.top + 18,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 108,
      }}
    >
      <TiltCard enabled={!reduce} glare={false} radius={26} onActiveChange={setHeroTilt}>
      <Animated.View
        onLayout={(event) => setHeroWidth(event.nativeEvent.layout.width)}
        style={reduce || heroTilt ? null : { transform: [{ perspective: 800 }, { rotateX: swayX }, { rotateY: swayY }] }}
      >
        <LinearGradient
          colors={[palette.h1, palette.h2]}
          start={{ x: 0.85, y: 0 }}
          end={{ x: 0.15, y: 1 }}
          style={styles.hero}
        >
          <LinearGradient
            pointerEvents="none"
            colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
            locations={[0, 0.42, 0.43]}
            style={StyleSheet.absoluteFill}
          />
          {reduce ? null : (
            <Animated.View
              pointerEvents="none"
              style={[styles.shine, { transform: [{ translateX: shineX }, { skewX: '-18deg' }] }]}
            />
          )}
          <ScoreRing
            progress={total ? data.done / total : 0}
            size={112}
            stroke={10}
            color={palette.acc}
            track="rgba(255,255,255,0.19)"
            animate={!reduce}
          >
            <Text style={[styles.ringCount, f('extra'), { color: '#fff' }]}>{data.done}</Text>
            <Text style={[styles.heroSmall, f('bold')]}>{`of ${total} done`}</Text>
          </ScoreRing>
          <View style={styles.heroBody}>
            <Text style={[styles.big, f('extra'), { color: '#fff' }]}>{data.avg === null ? '–' : `${data.avg}%`}</Text>
            <Text style={[styles.heroSmall, f('bold')]}>Average best score</Text>
            <Text style={[styles.level, f('extra'), { color: '#fff' }]}>
              {`Level ${meta.level} `}
              <Text style={[styles.levelRank, f('bold')]}>{meta.rank}</Text>
            </Text>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${meta.width}%`, backgroundColor: palette.acc }]} />
            </View>
            <Text style={[styles.heroSmall, f('bold')]}>{`${meta.toNext} XP to level ${meta.level + 1}`}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
      </TiltCard>

      <View style={styles.tiles}>
        <TiltCard enabled={!reduce} radius={18} style={styles.tileWrap}>
          <View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.line }]}>
            <Text style={[styles.tileValue, f('extra'), { color: palette.ink }]}>{data.quizzesTaken}</Text>
            <Text style={[styles.tileLabel, f('bold'), { color: palette.mut }]}>Quizzes taken</Text>
          </View>
        </TiltCard>
        <TiltCard enabled={!reduce} radius={18} style={styles.tileWrap}>
          <View style={[styles.tile, { backgroundColor: palette.card, borderColor: palette.line }]}>
            <View style={styles.starRow}>
              <StarGlyph spin={!reduce} />
              <Text style={[styles.tileValue, f('extra'), { color: palette.ink }]}>{data.stars}</Text>
            </View>
            <Text style={[styles.tileLabel, f('bold'), { color: palette.mut }]}>Stars earned</Text>
          </View>
        </TiltCard>
      </View>

      <TiltCard enabled={!reduce} radius={22} style={styles.cardWrap}>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.line }]}>
        <Text style={[styles.h2, f('extra'), { color: palette.ink }]}>Score trend</Text>
        <Text style={[styles.cardNote, f('bold'), { color: palette.mut }]}>Your last 6 quizzes by category</Text>
        {delta ? (
          <>
            <View style={styles.trendHead}>
              <Text style={[styles.trendScore, f('extra'), { color: palette.ink }]}>{`${delta.last}%`}</Text>
              <Text style={[styles.delta, f('extra'), deltaStyle(delta.tone, palette)]}>{delta.label}</Text>
            </View>
            <ScoreTrend recent={data.recent} palette={palette} />
          </>
        ) : (
          <Text style={[styles.empty, f('medium'), { color: palette.mut }]}>Take a quiz to see your score trend.</Text>
        )}
      </View>
      </TiltCard>

      <TiltCard enabled={!reduce} radius={22} style={styles.cardWrap}>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.line }]}>
        <Text style={[styles.h2, f('extra'), { color: palette.ink }]}>Strength by category</Text>
        <View style={styles.catGrid}>
          {categories.map((name) => {
            const scored = data.destinations.filter((d) => d.category === name && d.bestPct !== null);
            const avg = scored.length
              ? Math.round(scored.reduce((sum, d) => sum + d.bestPct, 0) / scored.length)
              : 0;
            const color = categoryColor(name);
            return (
              <View key={name} style={styles.catItem}>
                <Text style={[styles.catValue, f('extra'), { color }]}>{scored.length ? `${avg}%` : '–'}</Text>
                <Text style={[styles.catLabel, f('bold'), { color: palette.mut }]}>{name}</Text>
                <GrowBar pct={avg} color={color} track={palette.trk} animate={!reduce} />
              </View>
            );
          })}
        </View>
      </View>
      </TiltCard>

      <View style={styles.headingRow}>
        <Text style={[styles.h2, f('extra'), { color: palette.ink }]}>Destinations</Text>
        <View style={styles.chips}>
          {FILTERS.map(([key, label]) => {
            const on = filter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setFilter(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[
                  styles.chip,
                  { backgroundColor: on ? palette.pri : palette.card, borderColor: on ? palette.pri : palette.line },
                ]}
              >
                <Text style={[styles.chipText, f('bold'), { color: on ? '#fff' : palette.ink }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {rows.length === 0 ? (
        <Text style={[styles.empty, f('medium'), { color: palette.mut }]}>Nothing here yet.</Text>
      ) : rows.map((d) => {
        const color = categoryColor(d.category);
        const done = d.bestPct !== null;
        return (
          <TiltCard key={d.id} enabled={!reduce} radius={16} style={styles.destWrap}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Quiz', { destinationId: d.id, name: d.name })}
            style={[styles.dest, { backgroundColor: palette.card, borderColor: palette.line }]}
          >
            <View style={[styles.check, { borderColor: done ? color : palette.mut, backgroundColor: done ? color : 'transparent' }]}>
              {done ? <CheckMark /> : null}
            </View>
            <View style={styles.destName}>
              <Text style={[styles.destTitle, f('bold'), { color: palette.ink }]} numberOfLines={2}>{d.name}</Text>
              <Text style={[styles.destCat, f('bold'), { color }]}>{d.category}</Text>
            </View>
            <View style={styles.destScore}>
              <Text style={[styles.score, f('bold'), { color: palette.ink }]}>{done ? `${d.bestPct}%` : 'No score'}</Text>
              <Text style={[styles.attempts, f('bold'), { color: palette.mut }]}>
                {`${d.attempts} attempt${d.attempts === 1 ? '' : 's'}`}
              </Text>
              {done ? <Text style={[styles.stars, f('bold'), { color: palette.acc }]}>{starText(d.bestPct)}</Text> : null}
            </View>
          </Pressable>
          </TiltCard>
        );
      })}
    </ScrollView>
  );
}

function GrowBar({ pct, color, track, animate }) {
  const grow = useRef(new Animated.Value(animate ? 0 : pct)).current;
  useEffect(() => {
    if (!animate) {
      grow.setValue(pct);
      return undefined;
    }
    grow.setValue(0);
    const anim = Animated.timing(grow, {
      toValue: pct,
      duration: 900,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [animate, grow, pct]);
  const width = grow.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  return (
    <View style={[styles.catTrack, { backgroundColor: track }]}>
      <Animated.View style={[styles.catFill, { width, backgroundColor: color }]} />
    </View>
  );
}

function deltaStyle(tone, palette) {
  if (tone === 'up') return { backgroundColor: palette.okbg, color: palette.ok };
  if (tone === 'dn') return { backgroundColor: palette.badbg, color: palette.bad };
  return { backgroundColor: palette.trk, color: palette.mut };
}

const CARD_SHADOW = Platform.select({
  web: { boxShadow: '0 6px 16px rgba(17,78,92,0.12)' },
  default: {
    shadowColor: '#114e5c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  h2: { fontSize: 19 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: 26,
    padding: 20,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 10px 24px rgba(17,78,92,0.25)' },
      default: {
        shadowColor: '#114e5c',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  shine: {
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    width: '38%',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroBody: { flex: 1, minWidth: 0 },
  ringCount: { fontSize: 32, lineHeight: 34, color: '#fff' },
  heroSmall: { color: 'rgba(255,255,255,0.73)', fontSize: 12 },
  big: { fontSize: 34, lineHeight: 36, color: '#fff' },
  level: { marginTop: 12, marginBottom: 6, fontSize: 14, color: '#fff' },
  levelRank: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  xpTrack: { height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.19)', overflow: 'hidden', marginBottom: 4 },
  xpFill: { height: '100%', borderRadius: 8 },
  tiles: { flexDirection: 'row', gap: 10, marginVertical: 12 },
  tile: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 12, alignItems: 'center', ...CARD_SHADOW },
  tileValue: { fontSize: 24 },
  tileLabel: { fontSize: 12 },
  starRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  tileWrap: { flex: 1 },
  cardWrap: { marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 22, padding: 16, ...CARD_SHADOW },
  cardNote: { fontSize: 12, marginTop: 2 },
  trendHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  trendScore: { fontSize: 32, lineHeight: 36 },
  delta: { fontSize: 12, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 11, overflow: 'hidden' },
  empty: { textAlign: 'center', marginTop: 14, marginBottom: 4 },
  catGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  catItem: { flex: 1, minWidth: 0, alignItems: 'center' },
  catValue: { fontSize: 20, lineHeight: 24 },
  catLabel: { fontSize: 12, marginBottom: 6, textAlign: 'center' },
  catTrack: { height: 6, borderRadius: 6, overflow: 'hidden', alignSelf: 'stretch' },
  catFill: { height: '100%', borderRadius: 6 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10, gap: 8 },
  chips: { flexDirection: 'row', gap: 6 },
  chip: { borderWidth: 1, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 13 },
  chipText: { fontSize: 13 },
  destWrap: { marginBottom: 9 },
  dest: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 14, ...CARD_SHADOW },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  destName: { flex: 1, minWidth: 0 },
  destTitle: { fontSize: 15 },
  destCat: { fontSize: 12 },
  destScore: { alignItems: 'flex-end' },
  score: { fontSize: 15 },
  attempts: { fontSize: 12 },
  stars: { fontSize: 13, letterSpacing: 1 },
});
