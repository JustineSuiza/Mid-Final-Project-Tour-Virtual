import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Easing, Image, PanResponder, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { useAccount } from '../AccountContext';
import { colors, fonts } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import DestinationListScreen from '../screens/DestinationListScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AccountScreen from '../screens/AccountScreen';
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
  Destinations: 'map',
  Progress: 'chart-timeline-variant',
  Settings: 'cog-outline',
  Account: 'account-circle-outline',
};

const BAR_HEIGHT = 56;
const CIRCLE_SIZE = 48;
const NOTCH_SIZE = 60;

function SlidingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { surface, background, mutedText, accent } = useAppTheme();
  const { currentUser } = useAccount();
  const activeOptions = descriptors[state.routes[state.index].key]?.options;
  const [barWidth, setBarWidth] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(state.index);

  const tabCount = state.routes.length;
  const tabWidth = barWidth ? barWidth / tabCount : 0;

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const xRef = useRef(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const didInitRef = useRef(false);

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
      return;
    }

    if (distance < 0.5) {
      translateX.setValue(target);
      translateY.setValue(0);
      return;
    }

    translateY.stopAnimation();

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

  }, [tabWidth, translateX, translateY]);

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
      translateX.stopAnimation();
      translateY.stopAnimation();
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
    },
    onPanResponderRelease: () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
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
      animateTo(centerOf(state.index), true);
    },
  }), [animateTo, barWidth, centerOf, navigation, state.index, state.routes, tabAt, tabWidth, translateX, translateY]);

  if (activeOptions?.tabBarStyle?.display === 'none') return null;

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
                {route.name === 'Account' && currentUser?.profilePhoto ? (
                  <Image source={{ uri: currentUser.profilePhoto }} style={styles.accountTabAvatar} />
                ) : (
                  <Icon
                    name={tabIcons[route.name]}
                    size={22}
                    color={focused ? accent : mutedText}
                    style={focused ? styles.hiddenIcon : undefined}
                  />
                )}
                {focused ? (
                  <Text style={[styles.tabLabel, { color: accent }]}>
                    {label}
                  </Text>
                ) : null}
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
            {...panResponder.panHandlers}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Drag the tab selector to switch tabs"
            style={[
              styles.activeCircle,
              {
                backgroundColor: state.routes[displayIndex].name === 'Account' && currentUser?.profilePhoto
                  ? 'transparent'
                  : accent,
                shadowColor: accent,
                shadowOpacity: state.routes[displayIndex].name === 'Account' && currentUser?.profilePhoto ? 0 : 0.3,
                overflow: state.routes[displayIndex].name === 'Account' && currentUser?.profilePhoto
                  ? 'hidden'
                  : 'visible',
                transform: [
                  { translateX: Animated.subtract(translateX, CIRCLE_SIZE / 2) },
                  { translateY },
                ],
              },
            ]}
          >
            {state.routes[displayIndex].name === 'Account' && currentUser?.profilePhoto ? (
              <Image source={{ uri: currentUser.profilePhoto }} style={styles.activeAccountAvatar} />
            ) : (
              <Icon name={tabIcons[state.routes[displayIndex].name]} size={25} color="#fff" />
            )}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <SlidingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="Destinations" component={DestinationListScreen} options={{ tabBarLabel: 'Places' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ tabBarLabel: 'My Account' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  barSlot: {
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    width: '100%',
    height: BAR_HEIGHT,
    borderRadius: 0,
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
    top: -NOTCH_SIZE / 2,
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    elevation: 9,
    shadowColor: 'transparent',
  },
  activeCircle: {
    position: 'absolute',
    left: 0,
    top: -CIRCLE_SIZE / 2,
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
  accountTabAvatar: { width: 23, height: 23, borderRadius: 12 },
  activeAccountAvatar: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 },
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
          animation: 'none',
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
