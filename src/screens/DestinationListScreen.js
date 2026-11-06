import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AnimatedCheckbox from '../components/AnimatedCheckbox';
import DestinationCard from '../components/DestinationCard';
import DestinationMap from '../components/DestinationMap';
import { getDestinations } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categories, categoryMeta, colors, fonts } from '../theme';

function AnimatedDestinationCard({ item, index, filterKey, onPress, compact }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      delay: Math.min(index, 5) * 35,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [filterKey, index, progress]);

  return (
    <Animated.View
      style={{
        opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
        transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
      }}
    >
      <DestinationCard item={item} onPress={onPress} compact={compact} />
    </Animated.View>
  );
}

export default function DestinationListScreen({ navigation, route }) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { background, surface, text, mutedText, border, accent } = useAppTheme();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;
  const tabBarTimer = useRef(null);
  const tabBarHidden = useRef(false);
  const tabNavigation = navigation.getParent();

  const setTabBarHidden = useCallback((hidden) => {
    if (tabBarHidden.current === hidden) return;
    tabBarHidden.current = hidden;
    tabNavigation?.setOptions({ tabBarStyle: hidden ? { display: 'none' } : undefined });
  }, [tabNavigation]);

  useFocusEffect(
    useCallback(() => () => {
      clearTimeout(tabBarTimer.current);
      setTabBarHidden(false);
    }, [setTabBarHidden])
  );

  const handleListScroll = useCallback(() => {
    setTabBarHidden(true);
    clearTimeout(tabBarTimer.current);
    tabBarTimer.current = setTimeout(() => setTabBarHidden(false), 700);
  }, [setTabBarHidden]);

  useEffect(() => {
    Animated.timing(filterAnimation, {
      toValue: filterOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [filterAnimation, filterOpen]);

  // Home tiles pass a category filter through the route.
  useEffect(() => {
    if (route.params?.category) {
      setSelectedCategories(route.params.category === 'All' ? [] : [route.params.category]);
    }
  }, [route.params?.category]);

  const load = useCallback(async () => {
    setItems(await getDestinations({ search: search.trim(), category: selectedCategories }));
  }, [search, selectedCategories]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtering = search.trim() !== '' || selectedCategories.length > 0;
  const compactCards = windowWidth < 600;
  const numColumns = compactCards ? 2 : 1;
  const mapHeight = Math.max(220, Math.min(360, windowHeight * 0.36));
  const mappedItems = items.filter((item) =>
    item.latitude !== null && item.latitude !== undefined && item.latitude !== ''
    && item.longitude !== null && item.longitude !== undefined && item.longitude !== ''
    && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude))
    && Math.abs(Number(item.latitude)) <= 90 && Math.abs(Number(item.longitude)) <= 180
  );
  const filterKey = `${search.trim()}|${selectedCategories.join(',')}`;
  const toggleCategory = (option) => {
    setSelectedCategories((current) =>
      current.includes(option)
        ? current.filter((categoryName) => categoryName !== option)
        : [...current, option]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      <DestinationMap destinations={mappedItems} height={mapHeight} />

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <View style={[styles.search, { backgroundColor: surface, borderColor: border }]}>
            <Icon name="magnify" size={22} color={mutedText} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, place, or description"
              placeholderTextColor="#8A979C"
              style={[styles.input, { color: text }]}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={10}>
                <Icon name="close-circle" size={16} color={mutedText} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: surface, borderColor: border },
              (filterOpen || selectedCategories.length > 0) && { borderColor: accent },
            ]}
            onPress={() => setFilterOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityState={{ expanded: filterOpen }}
            accessibilityLabel={`Filter destinations${selectedCategories.length ? ` by ${selectedCategories.join(', ')}` : ''}`}
          >
            <Icon
              name="filter-variant"
              size={20}
              color={filterOpen || selectedCategories.length ? accent : mutedText}
            />
            {selectedCategories.length > 0 ? (
              <View style={[styles.filterDot, { backgroundColor: accent }]} />
            ) : null}
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.addButton]}
            onPress={() => navigation.navigate('DestinationForm')}
            accessibilityRole="button"
            accessibilityLabel="Add destination"
          >
            <Icon name="plus" size={22} color={colors.ink} />
          </Pressable>
        </View>
        <Animated.View
          pointerEvents={filterOpen ? 'auto' : 'none'}
          aria-hidden={!filterOpen}
          importantForAccessibility={filterOpen ? 'auto' : 'no-hide-descendants'}
          style={[
            styles.filterDropdown,
            { backgroundColor: surface, borderColor: border },
            {
              maxHeight: filterAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 300] }),
              opacity: filterAnimation,
              transform: [{ translateY: filterAnimation.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
            },
          ]}
        >
          {categories.map((option) => {
            const selected = selectedCategories.includes(option);
            const meta = categoryMeta[option];
            return (
              <AnimatedCheckbox
                key={option}
                label={option}
                checked={selected}
                tint={meta.color}
                textColor={text}
                borderColor={border}
                onPress={() => toggleCategory(option)}
              />
            );
          })}
        </Animated.View>
      </View>

      <FlatList
        key={numColumns}
        data={items}
        numColumns={numColumns}
        columnWrapperStyle={compactCards ? styles.destinationRow : undefined}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.destinationList}
        onScroll={handleListScroll}
        scrollEventThrottle={100}
        renderItem={({ item, index }) => (
          <View style={[styles.destinationItem, compactCards && styles.compactDestinationItem]}>
            <AnimatedDestinationCard
              item={item}
              index={index}
              filterKey={filterKey}
              compact={compactCards}
              onPress={() => navigation.navigate('DestinationDetail', { id: item.id })}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: text }]}>{filtering ? 'No destinations match' : 'No destinations yet'}</Text>
            <Text style={[styles.emptyText, { color: mutedText }]}>
              {filtering
                ? 'Try a different word or choose another category.'
                : 'Tap the + button to add your first destination.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  destinationList: { paddingHorizontal: 14 },
  destinationRow: { gap: 10 },
  destinationItem: { paddingHorizontal: 6 },
  compactDestinationItem: { flex: 1, paddingHorizontal: 0 },
  emptyState: { paddingHorizontal: 20, paddingVertical: 40 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.line, borderRadius: 20, paddingHorizontal: 12, height: 40,
  },
  searchIcon: { opacity: 0.55 },
  searchWrap: { position: 'relative', zIndex: 2, marginHorizontal: 20, marginVertical: 12 },
  input: { flex: 1, fontSize: 14, color: colors.ink, paddingVertical: 0 },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: { backgroundColor: colors.gold, borderColor: colors.gold },
  filterDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  filterDropdown: {
    position: 'absolute',
    bottom: 48,
    right: 0,
    width: 212,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 4,
    elevation: 8,
    shadowColor: '#14232A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
