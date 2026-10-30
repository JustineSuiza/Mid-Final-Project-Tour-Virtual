import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Button from '../components/Button';
import { getQuestions, recordQuizAttempt } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { PASS_MARK, colors, fonts } from '../theme';

export default function QuizScreen({ route, navigation }) {
  const { background, surface, text, mutedText, border, accent } = useAppTheme();
  const { destinationId, name } = route.params;
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getQuestions(destinationId).then(setQuestions);
  }, [destinationId]);

  if (!questions) return null;
  if (!questions.length) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={[styles.title, { color: text }]}>No quiz questions yet</Text>
        <Text style={[styles.muted, { color: mutedText }]}>Add questions from the destination’s Quiz button.</Text>
      </View>
    );
  }

  const restart = () => {
    setIndex(0); setSelected(null); setChecked(false); setScore(0); setResult(null);
  };

  if (result) {
    const pct = Math.round(result.pct * 100);
    return (
      <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={styles.resultWrap}>
        <Icon name={result.passed ? 'check-decagram' : 'book-open-variant'} size={56} color={result.passed ? colors.success : colors.gold} />
        <Text style={[styles.score, { color: text }]}>{score} / {questions.length}</Text>
        <Text style={[styles.pct, { color: accent }]}>{pct}%</Text>
        <Text style={[styles.verdict, { color: text }]}>
          {result.passed
            ? `${name} is now marked as completed.`
            : `Score ${Math.round(PASS_MARK * 100)}% or higher to complete this destination. Review the virtual tour and try again.`}
        </Text>
        <Text style={[styles.muted, { color: mutedText }]}>Best score: {result.best.score}/{result.best.total}</Text>
        <Button label="Retake quiz" icon="refresh" onPress={restart} style={{ marginTop: 24, alignSelf: 'stretch' }} />
        <Button label="Review the tour" icon="rotate-3d-variant" variant="secondary"
          onPress={() => navigation.navigate('VirtualTour', { id: destinationId })} style={{ marginTop: 10, alignSelf: 'stretch' }} />
        <Button label="View my progress" icon="chart-timeline-variant" variant="secondary"
          onPress={() => navigation.navigate('Tabs', { screen: 'Progress' })} style={{ marginTop: 10, alignSelf: 'stretch' }} />
      </ScrollView>
    );
  }

  const q = questions[index];
  const last = index === questions.length - 1;

  const check = () => {
    setChecked(true);
    if (selected === q.answerIndex) setScore((s) => s + 1);
  };
  const next = async () => {
    if (!last) {
      setIndex((i) => i + 1); setSelected(null); setChecked(false);
      return;
    }
    setResult(await recordQuizAttempt(destinationId, score, questions.length));
  };

  const optionStyle = (i) => {
    if (!checked) return selected === i
      ? [styles.option, { backgroundColor: surface, borderColor: accent }, styles.optionSelected]
      : [styles.option, { backgroundColor: surface, borderColor: border }];
    if (i === q.answerIndex) return [styles.option, styles.optionCorrect];
    if (i === selected) return [styles.option, styles.optionWrong];
    return [styles.option, { opacity: 0.6 }];
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={[styles.muted, { color: mutedText }]}>{name}</Text>
      <Text style={[styles.count, { color: text }]}>Question {index + 1} of {questions.length}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${((index + (checked ? 1 : 0)) / questions.length) * 100}%` }]} />
      </View>

      <Text style={[styles.question, { color: text }]}>{q.question}</Text>

      {q.options.map((opt, i) => (
        <Pressable
          key={i}
          disabled={checked}
          onPress={() => setSelected(i)}
          style={optionStyle(i)}
          accessibilityRole="radio"
          accessibilityState={{ selected: selected === i, disabled: checked }}
        >
          <Text style={[styles.optionText, { color: text }]}>{opt}</Text>
          {checked && i === q.answerIndex ? <Icon name="check-circle" size={22} color={colors.success} /> : null}
          {checked && i === selected && i !== q.answerIndex ? <Icon name="close-circle" size={22} color={colors.danger} /> : null}
        </Pressable>
      ))}

      {checked ? (
        <View style={[styles.feedback, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.feedbackTitle, { color: selected === q.answerIndex ? colors.success : colors.danger }]}>
            {selected === q.answerIndex ? 'Correct' : 'Not quite'}
          </Text>
          {q.explanation ? <Text style={[styles.feedbackText, { color: text }]}>{q.explanation}</Text> : null}
        </View>
      ) : null}

      <Button
        label={checked ? (last ? 'See my score' : 'Next question') : 'Check answer'}
        onPress={checked ? next : check}
        disabled={!checked && selected === null}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.paper },
  title: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: colors.ink },
  muted: { fontSize: 14, color: colors.muted, marginTop: 4, textAlign: 'center' },
  count: { fontSize: 15, fontWeight: '600', color: colors.ink, marginTop: 4 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.line, marginTop: 10, overflow: 'hidden' },
  fill: { height: 6, backgroundColor: colors.primary },
  question: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 30, fontWeight: '700', color: colors.ink, marginVertical: 22 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, padding: 14, marginBottom: 10, minHeight: 54,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#E6F0F2' },
  optionCorrect: { borderColor: colors.success, backgroundColor: '#E5F3EA' },
  optionWrong: { borderColor: colors.danger, backgroundColor: '#F7E6E1' },
  optionText: { flex: 1, fontSize: 16, color: colors.ink },
  feedback: { marginTop: 6, padding: 14, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line },
  feedbackTitle: { fontSize: 16, fontWeight: '700' },
  feedbackText: { fontSize: 15, lineHeight: 22, color: colors.ink, marginTop: 4 },
  resultWrap: { padding: 24, alignItems: 'center', paddingTop: 48 },
  score: { fontFamily: fonts.serif, fontSize: 56, fontWeight: '700', color: colors.ink, marginTop: 12 },
  pct: { fontSize: 22, fontWeight: '600', color: colors.primary },
  verdict: { fontSize: 16, lineHeight: 24, color: colors.ink, textAlign: 'center', marginTop: 14, marginBottom: 6 },
});
