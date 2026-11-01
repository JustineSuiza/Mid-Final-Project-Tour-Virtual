import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DestinationCard from '../components/DestinationCard';
import { getDestinations } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categories, categoryMeta, colors, fonts } from '../theme';

export default function DestinationListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { background, surface, text, mutedText, border, accent } = useAppTheme();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterAnimation = useRef(new Animated.Value(0)).current;

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
  const toggleCategory = (option) => {
    setSelectedCategories((current) =>
      current.includes(option)
        ? current.filter((categoryName) => categoryName !== option)
        : [...current, option]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: background, paddingTop: insets.top + 12 }}>
      <Text style={[styles.title, { color: text }]}>Destinations</Text>

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <View style={[styles.search, { backgroundColor: surface, borderColor: border }]}>
            <Icon name="magnify" size={26} color={mutedText} style={styles.searchIcon} />
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
                <Icon name="close-circle" size={18} color={mutedText} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={[
              styles.filterButton,
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
              size={22}
              color={filterOpen || selectedCategories.length ? accent : mutedText}
            />
            {selectedCategories.length > 0 ? (
              <View style={[styles.filterDot, { backgroundColor: accent }]} />
            ) : null}
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
              height: filterAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 232] }),
              opacity: filterAnimation,
              transform: [{ translateY: filterAnimation.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            },
          ]}
        >
          <Pressable
            style={styles.filterOption}
            onPress={() => {
              setSelectedCategories([]);
              setFilterOpen(false);
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selectedCategories.length === 0 }}
          >
            <Text style={[styles.filterOptionText, { color: text }]}>All categories</Text>
            {selectedCategories.length === 0 ? <Icon name="check" size={16} color={colors.primary} /> : null}
          </Pressable>
          {categories.map((option) => {
            const selected = selectedCategories.includes(option);
            const tint = categoryMeta[option].color;
            return (
              <Pressable
                key={option}
                style={[styles.filterOption, { borderBottomColor: border }]}
                onPress={() => toggleCategory(option)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
              >
                <Text style={[styles.filterOptionText, { color: text }]} numberOfLines={1}>{option}</Text>
                <View style={[styles.checkbox, selected && { backgroundColor: tint, borderColor: tint }]}>
                  {selected ? <Icon name="check" size={13} color="#fff" /> : null}
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        renderItem={({ item }) => (
          <DestinationCard item={item} onPress={() => navigation.navigate('DestinationDetail', { id: item.id })} />
        )}
        ListEmptyComponent={
          <View style={{ paddingVertical: 40 }}>
            <Text style={[styles.emptyTitle, { color: text }]}>{filtering ? 'No destinations match' : 'No destinations yet'}</Text>
            <Text style={[styles.emptyText, { color: mutedText }]}>
              {filtering
                ? 'Try a different word or choose another category.'
                : 'Tap the + button to add your first destination.'}
            </Text>
          </View>
        }
      />

      <Pressable
        style={[styles.fab, { bottom: 20 }]}
        onPress={() => navigation.navigate('DestinationForm')}
        accessibilityRole="button"
        accessibilityLabel="Add destination"
      >
        <Icon name="plus" size={30} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.serif, fontSize: 30, fontWeight: '700', color: colors.ink, paddingHorizontal: 20, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.line, borderRadius: 25, paddingHorizontal: 14, height: 50,
  },
  searchIcon: { opacity: 0.55 },
  searchWrap: { position: 'relative', zIndex: 2, marginHorizontal: 20, marginBottom: 10 },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 0 },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  filterDropdown: {
    position: 'absolute',
    top: 58,
    right: 0,
    width: 184,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#14232A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  filterOptionText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute', right: 20, width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  emptyText: { fontSize: 15, color: colors.muted, textAlign: 'center', marginTop: 6 },
});
