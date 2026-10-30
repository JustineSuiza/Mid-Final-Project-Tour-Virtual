import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { getProgressSummary } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categoryMeta, colors, fonts } from '../theme';

export default function ProgressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { background, surface, text, mutedText, border } = useAppTheme();
  const [data, setData] = useState({ total: 0, completed: 0, avgBest: null, destinations: [], recent: [] });

  useFocusEffect(
    useCallback(() => {
      getProgressSummary().then(setData);
    }, [])
  );

  const pct = data.total ? data.completed / data.total : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: background }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 40 }}
    >
      <Text style={[styles.title, { color: text }]}>My progress</Text>

      <View style={styles.summary}>
        <View style={styles.stat}>
          <Text style={styles.big}>{data.completed}<Text style={styles.small}> / {data.total}</Text></Text>
          <Text style={styles.label}>Destinations completed</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.big}>{data.avgBest === null ? '–' : `${Math.round(data.avgBest * 100)}%`}</Text>
          <Text style={styles.label}>Average best score</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>

      <Text style={[styles.heading, { color: text }]}>Destinations</Text>
      {data.destinations.map((d) => {
        const meta = categoryMeta[d.category] || categoryMeta.Cultural;
        return (
          <Pressable
            key={d.id}
            style={[styles.row, { backgroundColor: surface, borderColor: border }]}
            onPress={() => navigation.navigate('DestinationDetail', { id: d.id })}
            accessibilityRole="button"
          >
            <Icon
              name={d.completed === 1 ? 'check-circle' : 'circle-outline'}
              size={24}
              color={d.completed === 1 ? colors.success : mutedText}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowName, { color: text }]} numberOfLines={1}>{d.name}</Text>
              <Text style={[styles.rowSub, { color: meta.color }]}>{d.category}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.score, { color: text }]}>{d.totalQuestions ? `${d.bestScore}/${d.totalQuestions}` : 'No score'}</Text>
              <Text style={[styles.rowSub, { color: mutedText }]}>{d.attempts} {d.attempts === 1 ? 'attempt' : 'attempts'}</Text>
            </View>
          </Pressable>
        );
      })}

      <Text style={[styles.heading, { color: text }]}>Recent quiz attempts</Text>
      {data.recent.length === 0 ? (
        <Text style={[styles.empty, { color: mutedText }]}>No quizzes taken yet. Open a destination and take its quiz to see your scores here.</Text>
      ) : (
        data.recent.map((a) => (
          <View key={a.id} style={[styles.attempt, { borderBottomColor: border }]}>
            <Text style={[styles.rowName, { color: text }]} numberOfLines={1}>{a.name}</Text>
            <Text style={[styles.score, { color: text }]}>{a.score}/{a.total}</Text>
            <Text style={[styles.rowSub, { color: mutedText }]}>{String(a.takenAt).slice(0, 10)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  summary: { flexDirection: 'row', backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 18 },
  stat: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  big: { fontFamily: fonts.serif, fontSize: 34, fontWeight: '700', color: '#fff' },
  small: { fontSize: 18, fontWeight: '400', color: 'rgba(255,255,255,0.8)' },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.line, marginTop: 12, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.gold },
  heading: { fontFamily: fonts.serif, fontSize: 21, fontWeight: '700', color: colors.ink, marginTop: 28, marginBottom: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1,
    borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  rowName: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.ink },
  rowSub: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  score: { fontSize: 15, fontWeight: '700', color: colors.ink },
  attempt: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  empty: { fontSize: 15, color: colors.muted, lineHeight: 22 },
});
