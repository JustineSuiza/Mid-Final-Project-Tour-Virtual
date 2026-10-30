import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../ThemeContext';
import { colors, fonts } from '../theme';

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

function SlidingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { surface, mutedText } = useAppTheme();
  const slide = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth ? (barWidth - 16) / state.routes.length : 0;

  useEffect(() => {
    if (!tabWidth) return;
    Animated.spring(slide, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [slide, state.index, tabWidth]);

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={[styles.tabBar, { backgroundColor: surface }]}
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
      >
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeBubble,
              { width: tabWidth, transform: [{ translateX: slide }] },
            ]}
          />
        )}
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
              <Icon name={tabIcons[route.name]} size={23} color={focused ? '#fff' : mutedText} />
              <Text style={[styles.tabLabel, { color: focused ? '#fff' : mutedText }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
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
  tabBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    width: '100%',
    maxWidth: 420,
    height: 66,
    padding: 8,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#14232A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  activeBubble: {
    position: 'absolute',
    left: 8,
    top: 8,
    bottom: 8,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
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
