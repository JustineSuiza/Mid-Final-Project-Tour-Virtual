import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Button from '../components/Button';
import Field from '../components/Field';
import { addQuestion, deleteQuestion, getQuestions } from '../db/database';
import { confirmAction } from '../utils/confirm';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

const BLANK_OPTIONS = ['', '', '', ''];

export default function QuizEditorScreen({ route }) {
  const { background, surface, text, mutedText, border } = useAppTheme();
  const { destinationId, name } = route.params;
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(BLANK_OPTIONS);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => setQuestions(await getQuestions(destinationId)), [destinationId]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const save = async () => {
    // Drop empty options, then find where the correct one ended up.
    const kept = options.map((text, i) => ({ text: text.trim(), i })).filter((o) => o.text);
    const answerIndex = kept.findIndex((o) => o.i === correct);
    if (!question.trim()) return setError('Enter the question.');
    if (kept.length < 2) return setError('Enter at least two answer choices.');
    if (answerIndex === -1) return setError('Select a correct answer that has text.');
    setError('');
    await addQuestion(destinationId, {
      question: question.trim(), options: kept.map((o) => o.text), answerIndex, explanation: explanation.trim(),
    });
    setQuestion(''); setOptions(BLANK_OPTIONS); setCorrect(0); setExplanation('');
    load();
  };

  const remove = (q) =>
    confirmAction({
      title: 'Delete question',
      message: 'Remove this question from the quiz?',
      onConfirm: async () => {
        await deleteQuestion(q.id);
        load();
      },
    });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: text }]}>{name}</Text>
      <Text style={[styles.muted, { color: mutedText }]}>{questions.length} question{questions.length === 1 ? '' : 's'}</Text>

      {questions.map((q, n) => (
        <View key={q.id} style={[styles.qCard, { backgroundColor: surface, borderColor: border }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.qText}>{n + 1}. {q.question}</Text>
            <Text style={styles.qAnswer}>Answer: {q.options[q.answerIndex]}</Text>
          </View>
          <Pressable onPress={() => remove(q)} accessibilityLabel="Delete question" hitSlop={10}>
            <Icon name="trash-can-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      ))}

      <Text style={[styles.heading, { color: text }]}>Add a question</Text>
      <Field label="Question" value={question} onChangeText={setQuestion} multiline />
      {options.map((opt, i) => (
        <View key={i} style={styles.optRow}>
          <Pressable onPress={() => setCorrect(i)} accessibilityRole="radio" accessibilityState={{ selected: correct === i }} accessibilityLabel={`Mark choice ${i + 1} as correct`}>
            <Icon name={correct === i ? 'radiobox-marked' : 'radiobox-blank'} size={26} color={correct === i ? colors.success : colors.muted} />
          </Pressable>
          <Field
            label={`Choice ${i + 1}${correct === i ? ' (correct)' : ''}`}
            value={opt}
            onChangeText={(v) => setOptions((o) => o.map((x, idx) => (idx === i ? v : x)))}
            style={{ flex: 1, marginBottom: 0 }}
          />
        </View>
      ))}
      <Field label="Explanation (optional)" value={explanation} onChangeText={setExplanation} multiline style={{ marginTop: 16 }} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Add question" icon="plus" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '700', color: colors.ink },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2, marginBottom: 14 },
  heading: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: colors.ink, marginTop: 24, marginBottom: 12 },
  qCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1,
    borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 8,
  },
  qText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  qAnswer: { fontSize: 13, color: colors.success, marginTop: 4 },
  optRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 10 },
  error: { color: colors.danger, fontSize: 14, marginBottom: 10 },
});
