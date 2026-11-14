import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

const DEGREES = { inputRange: [0, 360], outputRange: ['0deg', '360deg'] };
const wrap = (value) => ((value % 360) + 360) % 360;
const wrapSigned = (value) => {
  const wrapped = wrap(value);
  return wrapped > 180 ? wrapped - 360 : wrapped;
};

// A picture that can be dragged to turn freely in any direction (360°),
// with a slow idle spin that resumes when the finger is lifted.
export default function RotatingImage({ source, width, height, radius = 10, style, accessibilityLabel }) {
  const yaw = useRef(new Animated.Value(0)).current;
  const pitch = useRef(new Animated.Value(0)).current;
  const angle = useRef({ yaw: 0, pitch: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const apply = () => {
    yaw.setValue(wrap(angle.current.yaw));
    pitch.setValue(wrap(angle.current.pitch));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        dragging.current = true;
        last.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
      },
      onPanResponderMove: (event) => {
        const { pageX, pageY } = event.nativeEvent;
        const dx = pageX - last.current.x;
        const dy = pageY - last.current.y;
        last.current = { x: pageX, y: pageY };
        angle.current.yaw += dx * 0.6;
        angle.current.pitch += dy * 0.6;
        apply();
      },
      onPanResponderRelease: () => { dragging.current = false; },
      onPanResponderTerminate: () => { dragging.current = false; },
    })
  ).current;

  useEffect(() => {
    let raf = 0;
    let previous = performance.now();
    const AUTO_SPIN = 18;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - previous) / 1000);
      previous = now;
      if (!dragging.current) {
        angle.current.yaw = wrap(angle.current.yaw + AUTO_SPIN * dt);
        angle.current.pitch += (0 - wrapSigned(angle.current.pitch)) * Math.min(1, dt * 1.5);
        apply();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [yaw, pitch]);

  const rotateX = pitch.interpolate(DEGREES);
  const rotateY = yaw.interpolate(DEGREES);

  return (
    <View style={[{ width, height }, style]}>
      <Animated.Image
        source={source}
        resizeMode="cover"
        accessibilityLabel={accessibilityLabel}
        {...responder.panHandlers}
        style={[
          styles.image,
          {
            width,
            height,
            borderRadius: radius,
            transform: [{ perspective: 1000 }, { rotateX }, { rotateY }],
          },
        ]}
      />
      <Svg
        pointerEvents="none"
        width={width * 1.9}
        height={height * 0.4}
        style={{ position: 'absolute', top: height * 0.96, left: -width * 0.45 }}
      >
        <Defs>
          <RadialGradient id="floorGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
            <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="url(#floorGlow)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
});
