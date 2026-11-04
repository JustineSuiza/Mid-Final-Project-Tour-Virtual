import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors } from '../theme';

const SPARKS = [0, 60, 120, 180, 240, 300];

export default function AnimatedCheckbox({
  label,
  icon,
  checked,
  tint,
  textColor,
  mutedColor,
  borderColor,
  onPress,
}) {
  const progress = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const wasChecked = useRef(checked);

  useEffect(() => {
    if (checked && !wasChecked.current) {
      burst.setValue(0);
      Animated.timing(burst, {
        toValue: 1,
        duration: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      Animated.sequence([
        Animated.timing(pop, { toValue: 0.78, duration: 90, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
      ]).start();
      Animated.spring(progress, {
        toValue: 1,
        friction: 5,
        tension: 160,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: checked ? 1 : 0,
        duration: 190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
    wasChecked.current = checked;
  }, [burst, checked, pop, progress]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={styles.row}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: tint,
            borderRadius: 12,
            opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }),
          },
        ]}
      />
      {icon ? (
        <Icon name={icon} size={17} color={checked ? tint : mutedColor} />
      ) : null}
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: checked ? tint : textColor,
            transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }],
          },
        ]}
      >
        {label}
      </Animated.Text>
      <View style={styles.boxWrap}>
        <Animated.View
          style={[
            styles.box,
            { borderColor: checked ? tint : borderColor, transform: [{ scale: pop }] },
          ]}
        >
          <Animated.View
            style={[
              styles.fill,
              {
                backgroundColor: tint,
                transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] }) }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] }),
              transform: [{ scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.3, 1.2, 1] }) }],
            }}
          >
            <Icon name="check" size={16} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
        {SPARKS.map((angle) => (
          <Animated.View
            key={angle}
            pointerEvents="none"
            style={[
              styles.spark,
              {
                backgroundColor: colors.gold,
                opacity: burst.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                  { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600' },
  boxWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: { position: 'absolute', width: 24, height: 24, borderRadius: 8 },
  spark: { position: 'absolute', width: 5, height: 5, borderRadius: 3, left: 9.5, top: 9.5 },
});
