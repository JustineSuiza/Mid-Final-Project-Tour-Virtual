import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function FilterChip({ label, tint, onRemove }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      friction: 6,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
      }}
    >
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${label} filter`}
        style={[styles.chip, { backgroundColor: tint }]}
      >
        <Text style={styles.text}>{label}</Text>
        <Icon name="close" size={13} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 9,
    paddingVertical: 5,
  },
  text: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
