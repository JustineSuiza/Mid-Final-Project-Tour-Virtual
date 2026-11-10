import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getProgress, getQuestions, recordQuizAttempt } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { f, progressPalette, starText } from '../utils/progressStats';
import ScoreRing from '../components/ScoreRing';

const LETTERS = ['A', 'B', 'C', 'D'];

function BackIcon({ color }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M12 5l-7 7 7 7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function scoreMessage(pct) {
  if (pct === 100) return 'Perfect! You’re a heritage expert.';
  if (pct >= 80) return 'Great job!';
  if (pct >= 60) return 'Good effort. Try again for a higher score.';
  return 'Keep exploring, then try again.';
}

export default function QuizScreen({ route, navigation }) {
  const { destinationId, name } = route.params;
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const palette = useMemo(() => progressPalette(isDark), [isDark]);
  const [questions, setQuestions] = useState(null);
  const [picks, setPicks] = useState([]);
  const [cur, setCur] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);
  const [result, setResult] = useState(null);
  const [reduce, setReduce] = useState(false);
  const scrollRef = useRef(null);
  const offsets = useRef([]);
  const pendingJump = useRef(null);

  useEffect(() => {
    let live = true;
    getQuestions(destinationId).then((rows) => {
      if (!live) return;
      setQuestions(rows);
      setPicks(Array(rows.length).fill(null));
    });
    return () => { live = false; };
  }, [destinationId]);

  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => { if (live) setReduce(!!value); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => setReduce(!!value));
    return () => { live = false; sub?.remove?.(); };
  }, []);

  const answered = picks.filter((pick) => pick !== null).length;
  const total = questions?.length || 0;
  const allAnswered = total > 0 && answered === total;
  const showSteps = questions?.length && (!submitted || show);

  const choose = (questionIndex, optionIndex) => {
    if (submitted) return;
    setPicks((current) => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
    setCur(questionIndex);
  };

  const jumpTo = (index) => {
    if (submitted && !show) {
      pendingJump.current = index;
      setShow(true);
      return;
    }
    const y = Math.max(0, (offsets.current[index] || 0) - 150);
    scrollRef.current?.scrollTo({ y, animated: !reduce });
  };

  const finish = async () => {
    if (!allAnswered || submitted || !questions) return;
    const correct = questions.filter((q, index) => picks[index] === q.answerIndex).length;
    const pct = Math.round((correct / questions.length) * 100);
    const prev = await getProgress(destinationId);
    const prevPct = prev && prev.totalQuestions ? Math.round((prev.bestScore / prev.totalQuestions) * 100) : -1;
    const xp = pct + (prevPct < 0 ? 50 : 0);
    await recordQuizAttempt(destinationId, correct, questions.length);
    setResult({ pct, correct, prevPct, xp });
    setSubmitted(true);
    setShow(false);
    setCur(0);
    scrollRef.current?.scrollTo({ y: 0, animated: !reduce });
  };

  const retake = () => {
    setPicks(Array(questions.length).fill(null));
    setCur(0);
    setSubmitted(false);
    setShow(false);
    setResult(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const onScroll = (event) => {
    if (!questions || (submitted && !show)) return;
    const y = event.nativeEvent.contentOffset.y + 170;
    let next = 0;
    questions.forEach((_, index) => {
      if ((offsets.current[index] || 0) < y) next = index;
    });
    setCur((current) => (current === next ? current : next));
  };

  if (!questions) {
    return <View style={[styles.fill, { backgroundColor: palette.bg }]} />;
  }

  if (!questions.length) {
    return (
      <View style={[styles.emptyWrap, { backgroundColor: palette.bg, paddingTop: insets.top + 24 }]}>
        <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
          <BackIcon color={palette.ink} />
        </Pressable>
        <Text style={[styles.emptyTitle, f('extra'), { color: palette.ink }]}>No quiz questions yet</Text>
        <Text style={[styles.emptyCopy, f('medium'), { color: palette.mut }]}>
          Add questions from the destination’s Quiz button.
        </Text>
      </View>
    );
  }

  const pct = result?.pct || 0;

  return (
    <View style={[styles.fill, { backgroundColor: palette.bg }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={showSteps ? [2] : []}
        contentContainerStyle={{
          width: '100%',
          maxWidth: 520,
          alignSelf: 'center',
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 28,
        }}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" style={styles.back}>
            <BackIcon color={palette.ink} />
          </Pressable>
          <Text style={[styles.topTitle, f('extra'), { color: palette.ink }]}>{submitted ? 'Results' : 'Quiz'}</Text>
        </View>

        {submitted && result ? (
          <View style={styles.result}>
            <ScoreRing progress={pct / 100} size={160} stroke={10} color={palette.pri} track={palette.trk} animate={!reduce}>
              <Text style={[styles.resultPct, f('extra'), { color: palette.ink }]}>{`${pct}%`}</Text>
              <Text style={[styles.resultHint, f('bold'), { color: palette.mut }]}>Your score</Text>
            </ScoreRing>
            <Text style={[styles.resultName, f('extra'), { color: palette.ink }]}>{name}</Text>
            <Text style={[styles.resultStars, f('extra'), { color: palette.acc }]}>{starText(pct)}</Text>
            <Text style={[styles.resultMsg, f('medium'), { color: palette.ink }]}>{scoreMessage(pct)}</Text>
            <View style={[styles.xpPill, { backgroundColor: palette.acc }]}>
              <Text style={[styles.xpText, f('extra')]}>{`+${result.xp} XP saved to progress`}</Text>
            </View>
            <Pressable
              onPress={() => {
                if (show) {
                  setShow(false);
                  scrollRef.current?.scrollTo({ y: 0, animated: !reduce });
                  return;
                }
                pendingJump.current = 0;
                setShow(true);
              }}
              accessibilityRole="button"
              style={[styles.ghostSm, { borderColor: palette.pri }]}
            >
              <Text style={[styles.ghostSmText, f('extra'), { color: palette.pri }]}>{show ? 'Hide review' : 'Show review'}</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.destLabel, f('bold'), { color: palette.mut }]}>{name}</Text>
        )}

        {showSteps ? (
          <View style={[styles.sticky, { backgroundColor: palette.bg }]}>
            <View style={styles.stepMeta}>
              <Text style={[styles.stepMetaText, f('extra'), { color: palette.ink }]}>
                {submitted ? `Score ${pct}%` : `${answered} of ${total} answered`}
              </Text>
              <Text style={[styles.stepMetaText, f('extra'), { color: palette.ink }]}>
                {submitted ? 'Tap a number to review' : 'Tap a number to jump'}
              </Text>
            </View>
            <View style={styles.steps}>
              <View style={[styles.stepLine, { backgroundColor: palette.trk }]}>
                <View
                  style={[
                    styles.stepLineFill,
                    {
                      backgroundColor: palette.pri,
                      width: `${submitted || allAnswered ? 100 : (answered / total) * 100}%`,
                      transitionProperty: 'width',
                      transitionDuration: '400ms',
                    },
                  ]}
                />
              </View>
              {questions.map((q, index) => {
                const correct = picks[index] === q.answerIndex;
                const picked = picks[index] !== null;
                return (
                  <View key={q.id || index} style={[styles.stepSlot, index === cur && styles.stepCurrent]}>
                    {index === cur ? (
                      <View pointerEvents="none" style={[styles.halo, { borderColor: withAlpha(palette.pri, 0.22) }]} />
                    ) : null}
                    <Pressable
                      onPress={() => jumpTo(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`Go to question ${index + 1}`}
                      style={[
                        styles.step,
                        { backgroundColor: palette.card, borderColor: palette.line },
                        !submitted && picked && { backgroundColor: palette.pri, borderColor: palette.pri },
                        submitted && correct && { backgroundColor: palette.ok, borderColor: palette.ok },
                        submitted && !correct && { backgroundColor: palette.bad, borderColor: palette.bad },
                        index === cur && !submitted && { borderColor: palette.pri },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepText,
                          f('extra'),
                          { color: (!submitted && picked) || submitted ? '#fff' : palette.mut },
                          index === cur && !submitted && !picked && { color: palette.pri },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
              {submitted ? null : (
                <FinishFlag enabled={allAnswered} reduce={reduce} palette={palette} onPress={finish} />
              )}
            </View>
          </View>
        ) : null}

        {(!submitted || show) && questions.map((q, index) => {
          const picked = picks[index];
          const correct = picked === q.answerIndex;
          return (
            <View
              key={q.id || index}
              onLayout={(event) => {
                offsets.current[index] = event.nativeEvent.layout.y;
                if (pendingJump.current !== index) return;
                pendingJump.current = null;
                const y = Math.max(0, event.nativeEvent.layout.y - 150);
                requestAnimationFrame(() => scrollRef.current?.scrollTo({ y, animated: !reduce }));
              }}
              style={[styles.questionCard, { backgroundColor: palette.card, borderColor: palette.line }]}
            >
              <View style={styles.questionHead}>
                <View style={[styles.qNum, { backgroundColor: palette.pri }]}>
                  <Text style={[styles.qNumText, f('extra')]}>{index + 1}</Text>
                </View>
                <Text style={[styles.question, f('extra'), { color: palette.ink }]}>{q.question}</Text>
              </View>
              {q.options.map((option, optionIndex) => {
                let state = null;
                if (submitted && show) {
                  if (optionIndex === q.answerIndex) state = 'ok';
                  else if (optionIndex === picked) state = 'bad';
                } else if (!submitted && optionIndex === picked) state = 'sel';
                const bg = state === 'ok' ? palette.okbg : state === 'bad' ? palette.badbg : palette.card;
                const border = state === 'ok' ? palette.ok : state === 'bad' ? palette.bad : state === 'sel' ? palette.pri : palette.line;
                const badge = state === 'ok' ? palette.ok : state === 'bad' ? palette.bad : state === 'sel' ? palette.pri : palette.trk;
                return (
                  <Pressable
                    key={`${index}-${optionIndex}`}
                    disabled={submitted}
                    onPress={() => choose(index, optionIndex)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: picked === optionIndex, disabled: submitted }}
                    style={[
                      styles.option,
                      { backgroundColor: state === 'sel' ? tint(isDark) : bg, borderColor: border },
                    ]}
                  >
                    <View style={[styles.badge, { backgroundColor: badge }]}>
                      <Text style={[styles.badgeText, f('extra'), { color: state ? '#fff' : palette.ink }]}>{LETTERS[optionIndex]}</Text>
                    </View>
                    <Text style={[styles.optionText, f('bold'), { color: palette.ink }]}>{option}</Text>
                  </Pressable>
                );
              })}
              {submitted ? (
                <View style={[styles.feedback, { backgroundColor: correct ? palette.okbg : palette.badbg }]}>
                  <Text style={[styles.feedbackText, f('bold'), { color: correct ? palette.ok : palette.bad }]}>
                    {correct ? 'Correct!' : `Not quite. The answer is ${q.options[q.answerIndex]}.`}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        {submitted ? (
          <View style={styles.footer}>
            <Pressable
              onPress={() => navigation.navigate('Tabs', { screen: 'Progress' })}
              style={[styles.btn, { backgroundColor: palette.pri }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, f('extra')]}>Back to progress</Text>
            </Pressable>
            <Pressable
              onPress={retake}
              style={[styles.btn, styles.btnGhost, { borderColor: palette.pri }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, f('extra'), { color: palette.pri }]}>Retake quiz</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.footer}>
            <Pressable
              onPress={finish}
              disabled={!allAnswered}
              accessibilityRole="button"
              style={[styles.btn, { backgroundColor: palette.pri }, !allAnswered && styles.btnOff]}
            >
              <Text style={[styles.btnText, f('extra')]}>Submit answers</Text>
            </Pressable>
            <Text style={[styles.hint, f('medium'), { color: palette.mut }]}>
              {allAnswered ? 'All answered. Ready to submit!' : 'Answer every question to submit.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function tint(isDark) {
  return isDark ? '#17343b' : '#e7f1f3';
}

function withAlpha(hex, alpha) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function FinishFlag({ enabled, reduce, palette, onPress }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!enabled || reduce) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [enabled, pulse, reduce]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  return (
    <View style={styles.stepSlot}>
      {enabled && !reduce ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.finishPulse, { backgroundColor: palette.acc, opacity, transform: [{ scale }] }]}
        />
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={!enabled}
        accessibilityRole="button"
        accessibilityLabel="Submit"
        style={[
          styles.step,
          { backgroundColor: enabled ? palette.acc : palette.card, borderColor: enabled ? palette.acc : palette.line },
        ]}
      >
        <Text style={styles.flag}>🏁</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  emptyWrap: { flex: 1, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 22, marginTop: 12 },
  emptyCopy: { fontSize: 15, marginTop: 6, lineHeight: 22 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  back: { padding: 4 },
  topTitle: { fontSize: 17 },
  destLabel: { textAlign: 'center', marginBottom: 4 },
  result: { alignItems: 'center', paddingTop: 6, paddingBottom: 18, gap: 6 },
  resultPct: { fontSize: 48, lineHeight: 52 },
  resultHint: { fontSize: 12 },
  resultName: { fontSize: 19, textAlign: 'center', marginTop: 4 },
  resultStars: { fontSize: 30, letterSpacing: 4 },
  resultMsg: { textAlign: 'center', marginTop: 2 },
  xpPill: { borderRadius: 99, paddingVertical: 5, paddingHorizontal: 14, marginTop: 4 },
  xpText: { color: '#3a2a00' },
  ghostSm: { borderWidth: 1.5, borderRadius: 99, paddingVertical: 7, paddingHorizontal: 18, marginTop: 4 },
  ghostSmText: { fontSize: 14 },
  sticky: { marginHorizontal: -16, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  stepMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  stepMetaText: { fontSize: 14 },
  steps: { position: 'relative', flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 8 },
  stepLine: { position: 'absolute', left: 20, right: 20, top: 19, height: 4, borderRadius: 4 },
  stepLineFill: { height: '100%', borderRadius: 4 },
  stepSlot: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  step: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepCurrent: { transform: [{ scale: 1.12 }] },
  halo: { position: 'absolute', width: 52, height: 52, borderRadius: 26, borderWidth: 5 },
  finishPulse: { position: 'absolute', width: 42, height: 42, borderRadius: 21 },
  stepText: { fontSize: 15 },
  flag: { fontSize: 16 },
  questionCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 14 },
  questionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  qNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  qNumText: { color: '#fff' },
  question: { flex: 1, fontSize: 17, lineHeight: 23 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 14, padding: 13, marginBottom: 10 },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 13 },
  optionText: { flex: 1, fontSize: 15 },
  feedback: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, marginTop: 2 },
  feedbackText: { fontSize: 15 },
  footer: { marginTop: 2 },
  btn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 6 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 2 },
  btnOff: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16 },
  hint: { textAlign: 'center', fontSize: 13, marginTop: 8 },
});
