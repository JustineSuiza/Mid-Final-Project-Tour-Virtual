import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Easing, PanResponder, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { MAX_WIDTH, colors, fonts } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import DestinationListScreen from '../screens/DestinationListScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import DestinationDetailScreen from '../screens/DestinationDetailScreen';
import DestinationFormScreen from '../screens/DestinationFormScreen';
import VirtualTourScreen from '../screens/VirtualTourScreen';
import Tour360Screen from '../screens/Tour360Screen';
import QuizScreen from '../screens/QuizScreen';
import QuizEditorScreen from '../screens/QuizEditorScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.paper, primary: colors.primary } };

const tabIcons = {
  Home: 'compass-outline',
  Destinations: 'format-list-bulleted',
  Progress: 'chart-timeline-variant',
  Settings: 'cog-outline',
  About: 'information-outline',
};

const BAR_HEIGHT = 64;
const CIRCLE_SIZE = 56;
const NOTCH_SIZE = 74;

function SlidingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { surface, background, mutedText, accent, motionBlur } = useAppTheme();
  const [barWidth, setBarWidth] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(state.index);

  const tabCount = state.routes.length;
  const tabWidth = barWidth ? barWidth / tabCount : 0;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const ghostShift = useRef(new Animated.Value(0)).current;
  const ghostScaleX = useRef(new Animated.Value(1)).current;
  const ghostOpacity = useRef(new Animated.Value(0)).current;

  const xRef = useRef(0);
  const startXRef = useRef(0);
  const lastMoveRef = useRef(0);
  const draggingRef = useRef(false);
  const didInitRef = useRef(false);
  const motionBlurRef = useRef(motionBlur);

  useEffect(() => {
    motionBlurRef.current = motionBlur;
  }, [motionBlur]);

  useEffect(() => {
    const id = translateX.addListener(({ value }) => { xRef.current = value; });
    return () => translateX.removeListener(id);
  }, [translateX]);

  const centerOf = useCallback((index) => tabWidth * (index + 0.5), [tabWidth]);

  const animateTo = useCallback((target, snap = false) => {
    const from = xRef.current;
    const distance = Math.abs(target - from);
    const duration = snap ? 200 : 300;

    if (!didInitRef.current) {
      didInitRef.current = true;
      translateX.setValue(target);
      translateY.setValue(0);
      scaleX.setValue(1);
      ghostOpacity.setValue(0);
      ghostScaleX.setValue(1);
      ghostShift.setValue(0);
      return;
    }

    if (distance < 0.5) {
      translateX.setValue(target);
      translateY.setValue(0);
      scaleX.setValue(1);
      ghostOpacity.setValue(0);
      ghostScaleX.setValue(1);
      ghostShift.setValue(0);
      return;
    }

    translateY.stopAnimation();
    scaleX.stopAnimation();
    ghostScaleX.stopAnimation();
    ghostOpacity.stopAnimation();
    ghostShift.stopAnimation();

    const direction = target > from ? 1 : -1;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: target,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 22,
          duration: duration * 0.5,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          speed: 12,
          bounciness: 16,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (motionBlurRef.current) {
      const stretch = 1 + Math.min(0.8, (distance / Math.max(tabWidth, 1)) * 0.45);
      const blurIn = Math.max(60, duration * 0.25);

      Animated.sequence([
        Animated.timing(scaleX, {
          toValue: stretch,
          duration: duration * 0.35,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleX, {
          toValue: 1,
          speed: 14,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();

      ghostShift.setValue(-direction * Math.min(56, distance * 0.4));
      ghostScaleX.setValue(stretch * 1.25);
      Animated.parallel([
        Animated.timing(ghostShift, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(ghostOpacity, {
            toValue: 0.45,
            duration: blurIn,
            useNativeDriver: true,
          }),
          Animated.timing(ghostOpacity, {
            toValue: 0,
            duration: Math.max(80, duration - blurIn),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(ghostScaleX, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleX.setValue(1);
      ghostOpacity.setValue(0);
      ghostScaleX.setValue(1);
      ghostShift.setValue(0);
    }
  }, [ghostOpacity, ghostScaleX, ghostShift, scaleX, tabWidth, translateX, translateY]);

  useEffect(() => {
    if (!tabWidth) return;
    setDisplayIndex(state.index);
    animateTo(centerOf(state.index));
  }, [animateTo, centerOf, state.index, tabWidth]);

  const tabAt = useCallback(
    (x) => Math.max(0, Math.min(tabCount - 1, Math.floor(x / Math.max(tabWidth, 1)))),
    [tabCount, tabWidth]
  );

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      draggingRef.current = true;
      startXRef.current = xRef.current;
      lastMoveRef.current = xRef.current;
      translateX.stopAnimation();
      translateY.stopAnimation();
      scaleX.stopAnimation();
      scaleX.setValue(1);
      translateY.setValue(-10);
    },
    onPanResponderMove: (event, gesture) => {
      if (!tabWidth) return;
      const min = tabWidth * 0.5;
      const max = barWidth - tabWidth * 0.5;
      const next = Math.max(min, Math.min(max, startXRef.current + gesture.dx));
      translateX.setValue(next);
      xRef.current = next;

      const index = tabAt(next);
      setDisplayIndex((current) => (current === index ? current : index));

      if (motionBlurRef.current) {
        const velocity = Math.abs(next - lastMoveRef.current);
        lastMoveRef.current = next;
        scaleX.setValue(1 + Math.min(0.3, velocity * 0.03));
      }
    },
    onPanResponderRelease: () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      scaleX.setValue(1);
      const index = tabAt(xRef.current);
      setDisplayIndex(index);
      if (index === state.index) {
        animateTo(centerOf(index), true);
      } else {
        const route = state.routes[index];
        navigation.navigate(route.name, route.params);
      }
    },
    onPanResponderTerminate: () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      scaleX.setValue(1);
      animateTo(centerOf(state.index), true);
    },
  }), [animateTo, barWidth, centerOf, navigation, state.index, state.routes, tabAt, tabWidth, translateX, translateY, scaleX]);

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={styles.barSlot}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        <View style={[styles.tabBar, { backgroundColor: surface }]}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? `${label} tab`}
                testID={options.tabBarButtonTestID}
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                style={styles.tabButton}
              >
                <Icon
                  name={tabIcons[route.name]}
                  size={22}
                  color={focused ? accent : mutedText}
                  style={focused ? styles.hiddenIcon : undefined}
                />
                <Text style={[styles.tabLabel, { color: focused ? accent : mutedText }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.notch,
              {
                backgroundColor: background,
                transform: [{ translateX: Animated.subtract(translateX, NOTCH_SIZE / 2) }],
              },
            ]}
          />
        )}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ghostCircle,
              {
                backgroundColor: accent,
                opacity: ghostOpacity,
                transform: [
                  { translateX: Animated.add(Animated.subtract(translateX, CIRCLE_SIZE / 2), ghostShift) },
                  { translateY },
                  { scaleX: ghostScaleX },
                ],
              },
            ]}
          />
        )}
        {tabWidth > 0 && (
          <Animated.View
            {...panResponder.panHandlers}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Drag the tab selector to switch tabs"
            style={[
              styles.activeCircle,
              {
                backgroundColor: accent,
                shadowColor: accent,
                transform: [
                  { translateX: Animated.subtract(translateX, CIRCLE_SIZE / 2) },
                  { translateY },
                  { scaleX },
                ],
              },
            ]}
          >
            <Icon name={tabIcons[state.routes[displayIndex].name]} size={25} color="#fff" />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function Tabs() {
  const { width } = useWindowDimensions();
  const pageWidth = Platform.OS === 'web' ? Math.min(width, MAX_WIDTH) : width;

  // Slide whole pages left or right depending on the tab order.
  const forSlide = useCallback(
    ({ current }) => ({
      sceneStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [-pageWidth, 0, pageWidth],
            }),
          },
        ],
      },
    }),
    [pageWidth]
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <SlidingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyleInterpolator: forSlide,
        transitionSpec: {
          animation: 'timing',
          config: { duration: 300, easing: Easing.out(Easing.cubic) },
        },
      }}
    >
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Destinations" component={DestinationListScreen} options={{ tabBarLabel: 'Places' }} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingHorizontal: 18,
  },
  barSlot: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    paddingTop: NOTCH_SIZE / 2,
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#14232A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  notch: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    elevation: 9,
    shadowColor: 'transparent',
  },
  ghostCircle: {
    position: 'absolute',
    left: 0,
    top: (NOTCH_SIZE - CIRCLE_SIZE) / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    elevation: 9,
    shadowColor: 'transparent',
  },
  activeCircle: {
    position: 'absolute',
    left: 0,
    top: (NOTCH_SIZE - CIRCLE_SIZE) / 2,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  hiddenIcon: { opacity: 0 },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default function AppNavigator() {
  const { background, text, border, accent, isDark } = useAppTheme();
  const navigationTheme = {
    ...theme,
    dark: isDark,
    colors: { ...theme.colors, background, card: background, text, border, primary: accent },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          animation: 'slide_from_right',
          headerStyle: { backgroundColor: background },
          headerTintColor: text,
          headerTitleStyle: { fontFamily: fonts.serif, fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="DestinationForm" component={DestinationFormScreen} />
        <Stack.Screen name="VirtualTour" component={VirtualTourScreen} options={{ title: 'Virtual tour' }} />
        <Stack.Screen name="Tour360" component={Tour360Screen} options={{ title: '360° tour' }} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
        <Stack.Screen name="QuizEditor" component={QuizEditorScreen} options={{ title: 'Quiz questions' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
