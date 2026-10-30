import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { categoryMeta, colors } from '../theme';

export default function CategoryChip({ label, active, onPress }) {
  const tint = categoryMeta[label]?.color || colors.primary;
  const { surface, text, border } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, { backgroundColor: active ? tint : surface, borderColor: active ? tint : border }]}
    >
      <Text style={[styles.text, { color: active ? '#fff' : text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  text: { fontSize: 14, fontWeight: '600' },
});
