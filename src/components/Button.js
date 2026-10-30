import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors } from '../theme';

const variants = {
  primary: { box: { backgroundColor: colors.primary }, color: '#FFFFFF' },
  secondary: { box: { borderWidth: 1.5, borderColor: colors.primary }, color: colors.primary },
  danger: { box: { borderWidth: 1.5, borderColor: colors.danger }, color: colors.danger },
  gold: { box: { backgroundColor: colors.gold }, color: colors.ink },
};

export default function Button({ label, icon, onPress, variant = 'primary', disabled, style }) {
  const { accent } = useAppTheme();
  const v = variant === 'secondary'
    ? { box: { borderWidth: 1.5, borderColor: accent }, color: accent }
    : variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.base, v.box, pressed && { opacity: 0.85 }, disabled && { opacity: 0.45 }, style]}
    >
      {icon ? <Icon name={icon} size={20} color={v.color} /> : null}
      <Text style={[styles.label, { color: v.color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: { fontSize: 16, fontWeight: '600' },
});
