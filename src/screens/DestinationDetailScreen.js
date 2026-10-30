import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Button from '../components/Button';
import DestinationImage from '../components/DestinationImage';
import { useAppTheme } from '../ThemeContext';
import {
  deleteDestination, getDestination, getProgress, getQuestionCount, setCompleted,
} from '../db/database';
import { confirmAction } from '../utils/confirm';
import { categoryMeta, colors, fonts } from '../theme';

export default function DestinationDetailScreen({ route, navigation }) {
  const { background, surface, text, mutedText, border } = useAppTheme();
  const { id } = route.params;
  const [dest, setDest] = useState(null);
  const [progress, setProgress] = useState(null);
  const [qCount, setQCount] = useState(0);

  const load = useCallback(async () => {
    const d = await getDestination(id);
    if (!d) return;
    setDest(d);
    setProgress(await getProgress(id));
    setQCount(await getQuestionCount(id));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!dest) return null;
  const meta = categoryMeta[dest.category] || categoryMeta.Cultural;
  const completed = progress?.completed === 1;

  const toggleCompleted = async () => {
    await setCompleted(id, !completed);
    load();
  };

  const confirmDelete = () =>
    confirmAction({
      title: 'Delete destination',
      message: `Remove “${dest.name}” along with its quiz questions and your progress? This can’t be undone.`,
      onConfirm: async () => {
        await deleteDestination(id);
        navigation.goBack();
      },
    });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={{ paddingBottom: 40 }}>
      <DestinationImage uri={dest.imageUri} category={dest.category} style={styles.hero} iconSize={64} />

      <View style={[styles.content, { backgroundColor: background }]}>
        <View style={[styles.pill, { backgroundColor: meta.color + '1A' }]}>
          <Icon name={meta.icon} size={16} color={meta.color} />
          <Text style={[styles.pillText, { color: meta.color }]}>{dest.category}</Text>
        </View>
        <Text style={[styles.name, { color: text }]}>{dest.name}</Text>
        <View style={styles.row}>
          <Icon name="map-marker-outline" size={18} color={mutedText} />
          <Text style={[styles.address, { color: mutedText }]}>{dest.address}</Text>
        </View>
        <Text style={[styles.description, { color: text }]}>{dest.description}</Text>

        <View style={[styles.status, { backgroundColor: surface, borderColor: border }]}>
          <Icon
            name={completed ? 'check-circle' : 'circle-outline'}
            size={22}
            color={completed ? colors.success : mutedText}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusTitle, { color: text }]}>{completed ? 'Completed' : 'Not completed yet'}</Text>
            <Text style={[styles.statusSub, { color: mutedText }]}>
              {progress?.totalQuestions
                ? `Best quiz score: ${progress.bestScore}/${progress.totalQuestions}`
                : 'Take the quiz to record a score.'}
            </Text>
          </View>
        </View>

        <Button
          label="Start virtual tour"
          icon="rotate-3d-variant"
          onPress={() => navigation.navigate('VirtualTour', { id })}
          style={{ marginTop: 18 }}
        />
        <Button
          label={qCount ? `Take the quiz (${qCount} questions)` : 'No quiz questions yet'}
          icon="school-outline"
          variant="secondary"
          disabled={!qCount}
          onPress={() => navigation.navigate('Quiz', { destinationId: id, name: dest.name })}
          style={{ marginTop: 10 }}
        />
        <Button
          label={completed ? 'Mark as not completed' : 'Mark as completed'}
          icon={completed ? 'undo' : 'check'}
          variant="secondary"
          onPress={toggleCompleted}
          style={{ marginTop: 10 }}
        />

        <Text style={[styles.section, { color: text }]}>Manage this destination</Text>
        <View style={styles.manage}>
          <Button label="Edit" icon="pencil-outline" variant="secondary" style={{ flex: 1 }}
            onPress={() => navigation.navigate('DestinationForm', { id })} />
          <Button label="Quiz" icon="playlist-edit" variant="secondary" style={{ flex: 1 }}
            onPress={() => navigation.navigate('QuizEditor', { destinationId: id, name: dest.name })} />
          <Button label="Delete" icon="trash-can-outline" variant="danger" style={{ flex: 1 }} onPress={confirmDelete} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 240 },
  content: { padding: 20 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 13, fontWeight: '700' },
  name: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: colors.ink, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  address: { fontSize: 15, color: colors.muted, flex: 1 },
  description: { fontSize: 16, lineHeight: 24, color: colors.ink, marginTop: 16 },
  status: {
    flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1,
    borderColor: colors.line, borderRadius: 12, padding: 14, marginTop: 20,
  },
  statusTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  statusSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  section: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 28, marginBottom: 10 },
  manage: { flexDirection: 'row', gap: 8 },
});
