import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';
import DestinationImage from '../components/DestinationImage';
import MapLocation from '../components/MapLocation';
import { useAppTheme } from '../ThemeContext';
import {
  deleteDestination, getDestination, getProgress, getQuestionCount, setCompleted,
} from '../db/database';
import { categoryMeta, colors, fonts } from '../theme';

export default function DestinationDetailScreen({ route, navigation }) {
  const { background, surface, text, mutedText, border } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [dest, setDest] = useState(null);
  const [progress, setProgress] = useState(null);
  const [qCount, setQCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const [deleteWarningVisible, setDeleteWarningVisible] = useState(false);
  const menuButtonRef = useRef(null);

  const openMenu = () => {
    const button = menuButtonRef.current;
    if (button?.measureInWindow) {
      button.measureInWindow((x, y, width, height) => {
        setMenuPos({ x, y, width, height });
        setMenuVisible(true);
      });
    } else {
      setMenuVisible(true);
    }
  };

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

  const confirmDelete = async () => {
    setDeleteWarningVisible(false);
    await deleteDestination(id);
    navigation.goBack();
  };

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={{ paddingBottom: 40 }}>
        <View>
          <DestinationImage uri={dest.imageUri} category={dest.category} style={styles.hero} iconSize={64} />
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            style={[styles.backButton, { top: insets.top + 10 }]}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Pressable
            ref={menuButtonRef}
            onPress={openMenu}
            accessibilityRole="button"
            accessibilityLabel="More options"
            hitSlop={10}
            style={[styles.menuButton, { top: insets.top + 10 }]}
          >
            <Icon name="dots-horizontal" size={24} color="#fff" />
          </Pressable>
        </View>

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

        <MapLocation
          name={dest.name}
          address={dest.address}
          latitude={dest.latitude}
          longitude={dest.longitude}
        />
        </View>
      </ScrollView>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close options"
          />
          <View
            style={[
              styles.menu,
              {
                backgroundColor: surface,
                borderColor: border,
                top: menuPos ? menuPos.y + menuPos.height + 8 : insets.top + 60,
                right: menuPos ? Dimensions.get('window').width - (menuPos.x + menuPos.width) : 16,
              },
            ]}
          >
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('DestinationForm', { id });
              }}
              accessibilityRole="button"
            >
              <Icon name="pencil-outline" size={20} color={text} />
              <Text style={[styles.menuText, { color: text }]}>Edit page</Text>
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: border }]} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('QuizEditor', { destinationId: id, name: dest.name });
              }}
              accessibilityRole="button"
            >
              <Icon name="playlist-edit" size={20} color={text} />
              <Text style={[styles.menuText, { color: text }]}>Edit quiz</Text>
            </Pressable>
            <View style={[styles.menuDivider, { backgroundColor: border }]} />
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setDeleteWarningVisible(true);
              }}
              accessibilityRole="button"
            >
              <Icon name="trash-can-outline" size={20} color={colors.danger} />
              <Text style={[styles.menuText, { color: colors.danger }]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteWarningVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteWarningVisible(false)}
      >
        <View style={styles.warningOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDeleteWarningVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close warning"
          />
          <View style={[styles.warningCard, { backgroundColor: surface, borderColor: border }]}>
            <View style={[styles.warningIconCircle, { backgroundColor: colors.danger + '1A' }]}>
              <Icon name="alert-circle-outline" size={26} color={colors.danger} />
            </View>
            <Text style={[styles.warningTitle, { color: text }]}>Delete destination?</Text>
            <Text style={[styles.warningBody, { color: mutedText }]}>
              Remove “{dest.name}” along with its quiz questions and your progress? This can’t be undone.
            </Text>
            <View style={styles.warningActions}>
              <Pressable
                style={[styles.warningButton, { backgroundColor: surface, borderColor: border }]}
                onPress={() => setDeleteWarningVisible(false)}
                accessibilityRole="button"
              >
                <Text style={[styles.warningButtonText, { color: text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.warningButton, { backgroundColor: colors.danger, borderColor: colors.danger }]}
                onPress={confirmDelete}
                accessibilityRole="button"
              >
                <Text style={[styles.warningButtonText, { color: '#fff' }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 280 },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
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
  menuButton: {
    position: 'absolute',
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  menu: {
    position: 'absolute',
    width: 180,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  menuItem: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 },
  menuText: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '600' },
  menuDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },
  warningOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  warningCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  warningIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  warningTitle: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700' },
  warningBody: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  warningActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  warningButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  warningButtonText: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
});
