import React, { useCallback, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
  const { surface, text, mutedText, background } = useAppTheme();
  const [home, setHome] = useState({ categoryImages: {}, upNext: [] });
  const [openFaq, setOpenFaq] = useState(null);

  useFocusEffect(
    useCallback(() => {
      getHomeData().then(setHome);
    }, [])
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: background }]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    >
      <View style={[styles.content, { flex: 1 }]}>
        <ImageBackground
          source={require('../../images/beach.jpeg')}
          style={styles.hero}
          resizeMode="cover"
          accessibilityLabel="Beach landscape"
        >
          <View style={[StyleSheet.absoluteFillObject, styles.heroOverlay]} />
          <View style={styles.heroContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: '#FFFFFF' }]}>
                Gala <Text style={[styles.titleAccent, { color: '#F6D278' }]}>Tour</Text>
              </Text>
              <Image
                source={require('../../images/flag.gif')}
                style={styles.flag}
                contentFit="cover"
                accessibilityLabel="Philippine flag"
              />
            </View>
            <Text style={styles.sub}>
              Visit heritage sites and natural wonders in Cavite, Laguna, Batangas, Rizal, and Quezon from wherever you are.
            </Text>
          </View>
        </ImageBackground>

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
    marginBottom: 18,
  },
  heroOverlay: {
    backgroundColor: 'rgba(7, 24, 34, 0.38)',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
  },
  title: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
    color: colors.ink,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  flag: { width: 84, height: 56, borderRadius: 6 },
  titleAccent: { fontWeight: '800', letterSpacing: 0.4 },
  sub: { fontSize: 16, lineHeight: 23, color: '#FFFFFF', marginTop: 8 },
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
