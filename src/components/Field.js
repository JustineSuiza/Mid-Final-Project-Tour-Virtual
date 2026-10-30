import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../ThemeContext';
import { colors } from '../theme';

export default function Field({ label, error, multiline, style, ...props }) {
  const { surface, text, border } = useAppTheme();
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#8A979C"
        style={[styles.input, { backgroundColor: surface, color: text, borderColor: border }, multiline && { minHeight: 96, textAlignVertical: 'top' }, error && { borderColor: colors.danger }]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: colors.ink,
  },
  error: { color: colors.danger, fontSize: 13, marginTop: 4 },
});
