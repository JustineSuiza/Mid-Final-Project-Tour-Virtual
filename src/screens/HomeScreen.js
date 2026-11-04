import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from '../AccountContext';
import { getHomeData } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { categories, categoryMeta, colors, fonts } from '../theme';

const FAQ_ITEMS = [
  {
    question: 'About this app',
    answer: 'Gala Tour is a virtual tour and cultural mapping app for CALABARZON. Explore destinations, learn about their history and culture, and test your knowledge with quizzes.',
  },
  {
    question: 'What can I explore in Gala Tour?',
    answer: 'Discover historical, cultural, religious, nature, and museum destinations across CALABARZON.',
  },
  {
    question: 'Can I take a virtual tour?',
    answer: 'Yes. Open a destination to view its photos, history, and cultural significance. Some destinations may also include a 360° tour.',
  },
  {
    question: 'How does the quiz and progress tracking work?',
    answer: 'Take a destination quiz to test your knowledge. Your attempts and completed destinations are saved on this device or browser.',
  },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { surface, text, mutedText, background } = useAppTheme();
  const { currentUser } = useAccount();
  const [fontsLoaded] = useFonts({
    GalaDisplay: require('../../font/CfMidnightRegular-MJ8B.ttf'),
  });
  const [home, setHome] = useState({ categoryImages: {}, upNext: [] });
  const [openFaq, setOpenFaq] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [weatherUnavailable, setWeatherUnavailable] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [greetingHeight, setGreetingHeight] = useState(36);
  const greetingName = currentUser?.name?.trim().toUpperCase() || 'TRAVELER';
  const greetingTop = Math.max(92, insets.top + 48);
  const heroHeight = Math.max(300, greetingTop + greetingHeight + 86);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=14.17&longitude=121.24&current=temperature_2m&temperature_unit=celsius&timezone=Asia%2FManila')
      .then((response) => {
        if (!response.ok) throw new Error(`Weather request failed (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        const currentTemperature = data?.current?.temperature_2m;
        if (typeof currentTemperature !== 'number' || !Number.isFinite(currentTemperature)) {
          throw new Error('Weather response did not contain a valid temperature.');
        }
        if (active) setTemperature(currentTemperature);
      })
      .catch(() => {
        if (active) setWeatherUnavailable(true);
      });

    return () => { active = false; };
  }, []);

  useFocusEffect(
    useCallback(() => {
      getHomeData().then(setHome);
    }, [])
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: background }]}
      contentContainerStyle={{ flexGrow: 1, paddingTop: 0, paddingBottom: 20 }}
    >
      <View style={[styles.content, { flex: 1 }]}>
        <ImageBackground
          source={require('../../images/Mt._Batulao,_Nasugbu,_Batangas,_Philippines.jpg')}
          style={[styles.hero, { height: heroHeight }]}
          resizeMode="cover"
          accessibilityLabel="Mount Batulao in Nasugbu, Batangas"
        >
          <View style={[StyleSheet.absoluteFillObject, styles.heroOverlay]} />
          <View style={[styles.dateTime, { top: Math.max(24, insets.top + 12) }]}>
            <Text style={styles.dateTimeText}>
              {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </Text>
            <Text style={styles.dateTimeText}>
              {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={[styles.heroInfo, { top: greetingTop }]}>
            <Text
              style={styles.greeting}
              onLayout={(event) => {
                const nextHeight = event.nativeEvent.layout.height;
                setGreetingHeight((previousHeight) => (
                  Math.abs(previousHeight - nextHeight) > 1 ? nextHeight : previousHeight
                ));
              }}
            >
              MABUHAY {greetingName}!
            </Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherRow}>
                <Icon name="map-marker" size={23} color="#FFF4D8" />
                <Text style={styles.weatherText}>Los Baños, Philippines</Text>
              </View>
              <View style={styles.weatherRow}>
                <Icon name="weather-partly-cloudy" size={23} color="#FFF4D8" />
                <Text style={styles.weatherText}>
                  {temperature !== null
                    ? `${temperature.toFixed(1)}°C`
                    : weatherUnavailable ? 'Temperature unavailable' : 'Loading temperature...'}
                </Text>
              </View>
            </View>
          </View>
          <Image
            source={require('../../images/flag.gif')}
            style={[styles.flag, { top: Math.max(16, insets.top + 4) }]}
            contentFit="cover"
            accessibilityLabel="Philippine flag"
          />
        </ImageBackground>

          <View style={styles.intro}>
            <Text style={[styles.title, { color: text, fontFamily: fontsLoaded ? 'GalaDisplay' : fonts.sans }]}>
              Gala <Text style={[styles.titleAccent, { color: colors.gold }]}>Tour</Text>
            </Text>
            <Text style={[styles.sub, { color: '#000000' }]}>
              Visit heritage sites and natural wonders in Cavite, Laguna, Batangas, Rizal, and Quezon from wherever you are.
            </Text>
          </View>
          <Text style={[styles.categoryHeading, { color: text }]}>Where to?</Text>
          <Text style={[styles.categorySubheading, { color: mutedText }]}>
            Adventure starts here. Take your pick.
          </Text>
          <View style={styles.grid}>
            {categories.map((c) => (
              <Pressable
                key={c}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Destinations', { category: c })}
                accessibilityRole="button"
                accessibilityLabel={`${c} destinations`}
              >
                <ImageBackground
                  source={
                    c === 'Museum'
                      ? require('../../images/meseum.jpg')
                      : c === 'Historical'
                      ? require('../../images/history.jpg')
                      : c === 'Religious'
                      ? require('../../images/religious.jpg')
                      : c === 'Cultural'
                      ? require('../../images/culture.jpg')
                      : home.categoryImages[c]
                      ? { uri: home.categoryImages[c] }
                      : c === 'Nature' ? require('../../images/beach.jpeg') : undefined
                  }
                  style={[styles.categoryImage, { backgroundColor: categoryMeta[c].color }]}
                  imageStyle={styles.categoryImageContent}
                  resizeMode="cover"
                />
                <View style={[styles.categoryLabel, { backgroundColor: surface }]}>
                  <Text style={[styles.categoryName, { color: text }]}>{c}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.heading, { color: text }]}>Frequently asked questions</Text>
          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <View
                  key={item.question}
                  style={[styles.faqItem, { backgroundColor: surface, borderColor: colors.line }]}
                >
                  <Pressable
                    style={styles.faqQuestion}
                    onPress={() => setOpenFaq(isOpen ? null : index)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                  >
                    <Text style={[styles.faqQuestionText, { color: text }]}>{item.question}</Text>
                    <Icon name={isOpen ? 'minus' : 'plus'} size={22} color={colors.primary} />
                  </Pressable>
                  {isOpen ? (
                    <Text style={[styles.faqAnswer, { color: mutedText }]}>{item.answer}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>

        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: 20,
  },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    height: 300,
    flexShrink: 0,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 0,
  },
  heroOverlay: {
    backgroundColor: 'rgba(7, 24, 34, 0.38)',
  },
  dateTime: {
    position: 'absolute',
    left: 22,
    gap: 2,
  },
  dateTimeText: {
    color: '#FFF4D8',
    fontSize: 14,
    lineHeight: 19,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  intro: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  greeting: {
    fontFamily: fonts.sans,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.8,
    lineHeight: 36,
    color: '#FFF4D8',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  heroInfo: {
    position: 'absolute',
    left: 22,
    right: 22,
  },
  weatherDetails: {
    marginTop: 8,
    gap: 6,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherText: {
    color: '#FFF4D8',
    fontSize: 16,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  flag: { position: 'absolute', right: 14, width: 84, height: 56, borderRadius: 6 },
  titleAccent: { fontWeight: '800', letterSpacing: 0.4 },
  sub: { fontFamily: fonts.sans, fontSize: 16, fontWeight: '400', lineHeight: 23, marginTop: 8, textAlign: 'center' },
  categoryHeading: {
    fontFamily: fonts.sans,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
  },
  categorySubheading: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  heading: {
    fontFamily: fonts.sans,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.ink,
    marginTop: 26,
    marginBottom: 12,
  },
  faqList: { gap: 10 },
  faqItem: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  faqQuestion: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  faqQuestionText: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  faqAnswer: { fontSize: 14, lineHeight: 21, paddingBottom: 14 },
  grid: { gap: 16 },
  categoryCard: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    shadowColor: '#14232A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  categoryImageContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  categoryLabel: {
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});
