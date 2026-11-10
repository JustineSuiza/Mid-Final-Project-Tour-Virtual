import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ScoreRing({
  progress,
  size,
  stroke,
  color,
  track,
  animate = true,
  children,
}) {
  const r = (100 - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.max(0, Math.min(1, progress)));
  const offset = useRef(new Animated.Value(animate ? c : target)).current;

  useEffect(() => {
    if (!animate) {
      offset.setValue(target);
      return;
    }
    offset.setValue(c);
    Animated.timing(offset, {
      toValue: target,
      duration: 1100,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [animate, c, offset, target]);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx="50" cy="50" r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </View>
    </View>
  );
}
