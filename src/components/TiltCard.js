import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TiltCard({
  children,
  style,
  enabled = true,
  glare = true,
  radius = 22,
  onActiveChange,
}) {
  const [pose, setPose] = useState(null);
  const raf = useRef(0);
  const onActive = useRef(onActiveChange);
  onActive.current = onActiveChange;
  const active = pose !== null;
  const web = Platform.OS === 'web' && enabled;

  useEffect(() => {
    onActive.current?.(active);
  }, [active]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const move = (event) => {
    const node = event.currentTarget;
    if (!node?.getBoundingClientRect) return;
    const point = event.nativeEvent;
    const box = node.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const x = (point.clientX - box.left) / box.width;
    const y = (point.clientY - box.top) / box.height;
    const depth = box.height > 180 ? 0.45 : 1;
    const next = {
      rx: (0.5 - y) * 14 * depth,
      ry: (x - 0.5) * 16,
      gx: x * 100,
      gy: y * 100,
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setPose(next));
  };

  const endTouch = (event) => {
    if (event.nativeEvent.pointerType === 'mouse') return;
    cancelAnimationFrame(raf.current);
    setPose(null);
  };

  const leave = () => {
    cancelAnimationFrame(raf.current);
    setPose(null);
  };

  const poseStyle = web ? {
    transform: [
      { perspective: 800 },
      { rotateX: `${pose ? pose.rx : 0}deg` },
      { rotateY: `${pose ? pose.ry : 0}deg` },
    ],
    zIndex: pose ? 2 : 0,
    borderRadius: radius,
    transitionProperty: 'transform, box-shadow',
    transitionDuration: pose ? '60ms' : '350ms',
    transitionTimingFunction: pose ? 'linear' : 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    boxShadow: pose ? '0 16px 30px rgba(10, 31, 38, 0.25)' : 'none',
    touchAction: 'pan-y',
  } : null;

  return (
    <View
      style={[style, poseStyle]}
      onPointerDown={web ? move : undefined}
      onPointerMove={web ? move : undefined}
      onPointerUp={web ? endTouch : undefined}
      onPointerCancel={web ? endTouch : undefined}
      onPointerLeave={web ? leave : undefined}
    >
      {children}
      {web && glare ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.glare,
            {
              borderRadius: radius,
              opacity: pose ? 1 : 0,
              backgroundImage: pose
                ? `radial-gradient(circle at ${pose.gx}% ${pose.gy}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 62%)`
                : 'none',
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  glare: {
    transitionProperty: 'opacity',
    transitionDuration: '250ms',
  },
});
