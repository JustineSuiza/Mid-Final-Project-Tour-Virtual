import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { fonts } from '../theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseValue(value) {
  if (!value) return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value).trim());
  if (match) {
    const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a, b) {
  return a && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export default function DatePickerModal({ visible, value, onClose, onSelect }) {
  const { surface, text, mutedText, border, accent } = useAppTheme();
  const selected = parseValue(value);
  const [viewDate, setViewDate] = useState(() => startOfMonth(selected || new Date()));

  useEffect(() => {
    if (visible) {
      setViewDate(startOfMonth(parseValue(value) || new Date()));
    }
  }, [visible, value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = useMemo(() => {
    const result = [];
    for (let i = 0; i < firstWeekday; i += 1) result.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) result.push(day);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [firstWeekday, daysInMonth]);

  const shiftMonths = (amount) => setViewDate(new Date(year, month + amount, 1));
  const shiftYears = (amount) => setViewDate(new Date(year + amount, month, 1));

  const chooseDay = (day) => {
    onSelect(formatDate(new Date(year, month, day)));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close calendar"
        />
        <View style={[styles.panel, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <View style={styles.navGroup}>
              <Pressable onPress={() => shiftYears(-1)} accessibilityRole="button" accessibilityLabel="Previous year" hitSlop={8}>
                <Icon name="chevron-double-left" size={22} color={mutedText} />
              </Pressable>
              <Pressable onPress={() => shiftMonths(-1)} accessibilityRole="button" accessibilityLabel="Previous month" hitSlop={8}>
                <Icon name="chevron-left" size={22} color={accent} />
              </Pressable>
            </View>
            <Text style={[styles.title, { color: text }]}>{MONTHS[month]} {year}</Text>
            <View style={styles.navGroup}>
              <Pressable onPress={() => shiftMonths(1)} accessibilityRole="button" accessibilityLabel="Next month" hitSlop={8}>
                <Icon name="chevron-right" size={22} color={accent} />
              </Pressable>
              <Pressable onPress={() => shiftYears(1)} accessibilityRole="button" accessibilityLabel="Next year" hitSlop={8}>
                <Icon name="chevron-double-right" size={22} color={mutedText} />
              </Pressable>
            </View>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((label, index) => (
              <Text key={`${label}-${index}`} style={[styles.weekday, { color: mutedText }]}>{label}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) return <View key={`blank-${index}`} style={styles.dayCell} />;
              const date = new Date(year, month, day);
              const isSelected = sameDay(date, selected);
              const isToday = sameDay(date, today);
              return (
                <Pressable
                  key={day}
                  style={styles.dayCell}
                  onPress={() => chooseDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`${MONTHS[month]} ${day}, ${year}`}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isToday && !isSelected && { borderColor: accent, borderWidth: 1 },
                      isSelected && { backgroundColor: accent },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: isSelected ? '#FFFFFF' : text }]}>{day}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.footer, { borderTopColor: border }]}>
            <Pressable onPress={() => { onSelect(formatDate(today)); onClose(); }} accessibilityRole="button">
              <Text style={[styles.footerAction, { color: accent }]}>Today</Text>
            </Pressable>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text style={[styles.footerAction, { color: mutedText }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { width: '14.2857%', textAlign: 'center', fontFamily: fonts.sans, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', height: 40, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.sans, fontSize: 14 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
    paddingTop: 12,
    paddingHorizontal: 4,
  },
  footerAction: { fontFamily: fonts.sans, fontSize: 14, fontWeight: '700' },
});
