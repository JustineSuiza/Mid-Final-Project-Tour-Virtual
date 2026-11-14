import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Rect, Stop } from 'react-native-svg';
import Button from '../components/Button';
import DestinationImage from '../components/DestinationImage';
import RotatingImage from '../components/RotatingImage';
import { getDestination, getQuestionCount } from '../db/database';
import { useAppTheme } from '../ThemeContext';
import { MAX_WIDTH, colors, fonts } from '../theme';
import {
  AGUINALDO_BALCONY_IMAGE_URI, AGUINALDO_BEDROOM_IMAGE_URI, AGUINALDO_CEILING_MAP_IMAGE_URI,
  AGUINALDO_DINING_ROOM_IMAGE_URI, AGUINALDO_DIORAMA_IMAGE_URI, AGUINALDO_HOME_IMAGE_URI,
  AGUINALDO_LUNCH_BOX_IMAGE_URI, AGUINALDO_MEDICINE_CABINET_IMAGE_URI,
  AGUINALDO_SECRET_PASSAGE_IMAGE_URI, AGUINALDO_SWORD_IMAGE_URI,
  RIZAL_BIRTH_ROOM_IMAGE_URI, RIZAL_BOYS_BEDROOM_IMAGE_URI, RIZAL_CHILDHOOD_MEMORABILIA_IMAGE_URI,
  RIZAL_COMEDOR_IMAGE_URI, RIZAL_FAMILY_DINING_ROOM_IMAGE_URI, RIZAL_GIRLS_BEDROOM_IMAGE_URI,
  RIZAL_GROUND_FLOOR_EXHIBITS_IMAGE_URI, RIZAL_LIBRARY_IMAGE_URI, RIZAL_TRADITIONAL_KITCHEN_IMAGE_URI,
  RIZAL_YOUNG_STATUE_IMAGE_URI, getDestinationImageSource,
} from '../utils/destinationImages';

export default function VirtualTourScreen({ route, navigation }) {
  const { background, text, mutedText } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const width = Math.min(screenWidth, MAX_WIDTH);
  const exhibitImageWidth = Math.min(150, Math.max(108, (width - 60) * 0.27));
  const listRef = useRef(null);
  const [dest, setDest] = useState(null);
  const [qCount, setQCount] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedExhibit, setSelectedExhibit] = useState(null);
  const viewerImageRatio = selectedExhibit?.imageRatio || 1.5;
  const viewerMaxWidth = screenWidth - 32;
  const viewerMaxHeight = Math.max(180, screenHeight - insets.top - insets.bottom - 240);
  const viewerImageWidth = Math.min(viewerMaxWidth, viewerMaxHeight * viewerImageRatio);
  const viewerImageHeight = viewerImageWidth / viewerImageRatio;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setDest(await getDestination(id));
        setQCount(await getQuestionCount(id));
      })();
    }, [id])
  );

  const goTo = (i) => {
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    setPage(i);
  };

  if (!dest) return null;
  // The cover photo leads the gallery; with no photos at all we show one placeholder slide.
  const slides = [dest.imageUri, ...dest.photos].filter(Boolean);
  const gallery = slides.length ? slides : [null];
  const museumDescription = 'The detailed woodwork, furnishings, and display cases show the shrine’s interior as both a preserved ancestral home and a museum. Its rooms offer visitors a glimpse of the historic house and the exhibits kept inside.';
  const swordDescription = 'The shrine displays these swords alongside a portrait of General Aguinaldo and other historical objects. The exhibit gives visitors a closer look at the personal and revolutionary-era artifacts preserved in the house.';
  const dioramaDescription = 'This wide diorama shows figures gathered around a wooden defensive barrier in a rural setting, with trees and traditional houses behind them. It offers a visual impression of the people and surroundings of the Philippine Revolution.';
  const bedroomDescription = 'The bedroom’s four-poster bed and rocking chair show the furnishings of the Aguinaldo family home. The room was a private space for rest and daily life, and is now preserved so visitors can see its historic interior.';
  const diningRoomDescription = 'The spacious dining room contains a large table and chairs arranged for shared meals. It served as a place for the Aguinaldo household to dine and receive guests, and its furnishings show how family life took place inside the ancestral home.';
  const ceilingMapDescription = 'A map of the Philippines is displayed across the dining-room ceiling, turning the ceiling into a striking feature of the room. It presents the country’s islands as a single archipelago and reflects the home’s national and historical setting.';
  const balconyDescription = 'Known as the Galeria de los Pecadores, or “Balcony of Sinners,” this upper-level balcony is a distinctive part of the house’s facade. Its raised position overlooks the entrance and grounds, giving visitors a sense of the home’s layout and architecture.';
  const medicineCabinetDescription = 'This antique cabinet is presented with General Aguinaldo’s personal effects. A medicine cabinet would have been used to keep remedies and medical supplies organized; the historic piece offers a glimpse of how such items were stored in the household.';
  const lunchBoxDescription = 'A personal lunch box was used to carry and keep a meal together for eating away from the dining table. The item is shown among General Aguinaldo’s personal effects, giving visitors a glimpse of an everyday possession.';
  const secretPassageDescription = 'The narrow stairway shown here leads through a concealed opening beneath the floor. It is identified as a secret passage and bomb shelter, a space associated with reaching protected areas during danger.';
  const rizalExhibits = [
    {
      image: RIZAL_GROUND_FLOOR_EXHIBITS_IMAGE_URI,
      title: 'Ground Floor Historical Exhibits',
      purpose: 'These displays present objects and information connected with José Rizal and his family. Museums use exhibits like these to help visitors explore historical materials in context.',
      description: 'The ground-floor displays introduce visitors to historical materials preserved at the shrine and provide context for Rizal’s life and family home.',
    },
    {
      image: RIZAL_YOUNG_STATUE_IMAGE_URI,
      title: 'Young José Rizal Statue',
      purpose: 'The statue portrays José Rizal as a child. Sculptures like this commemorate a person and help visitors picture the subject at an earlier stage of life.',
      description: 'This statue depicts a young José Rizal and commemorates his childhood in Calamba.',
    },
    {
      image: RIZAL_CHILDHOOD_MEMORABILIA_IMAGE_URI,
      title: "Rizal's Childhood Memorabilia",
      purpose: 'Childhood memorabilia preserves objects associated with a person’s early years. These artifacts help visitors connect historical accounts with the everyday life of the family.',
      description: 'These objects are presented as memorabilia from Rizal’s childhood, offering a glimpse of the keepsakes and materials associated with his early life.',
    },
    {
      image: RIZAL_LIBRARY_IMAGE_URI,
      title: "Francisco Mercado's Library",
      purpose: 'A household library keeps books and reading materials for study and reference. This room is named for Francisco Mercado, José Rizal’s father, and shows a space for reading within the family home.',
      description: 'The library exhibit is associated with Francisco Mercado and shows the kind of room used for keeping books and reading materials in the family home.',
    },
    {
      image: RIZAL_FAMILY_DINING_ROOM_IMAGE_URI,
      title: 'The Family Dining Room',
      purpose: 'A family dining room is where household members gather to share meals. Its table and furnishings show how the home was arranged for everyday family life.',
      description: 'The dining room’s table and furnishings help visitors imagine the family gathering for meals in the ancestral home.',
    },
    {
      image: RIZAL_BIRTH_ROOM_IMAGE_URI,
      title: "Rizal's Birth Room",
      purpose: 'This room is identified as the place where José Rizal was born. A preserved birth room helps visitors connect a historical figure’s early life to the home and family setting.',
      description: 'The shrine preserves this room as the birthplace of José Rizal, linking his story to the house where he was born.',
    },
    {
      image: RIZAL_BOYS_BEDROOM_IMAGE_URI,
      title: "Boys' Bedroom",
      purpose: 'A boys’ bedroom provided sleeping space for the boys in the household. Its furnishings show how a shared room could be arranged for rest and daily family life.',
      description: 'This bedroom represents the sleeping quarters for boys in the household and shows the furnishings of a family home.',
    },
    {
      image: RIZAL_GIRLS_BEDROOM_IMAGE_URI,
      title: "Girls' Bedroom",
      purpose: 'A girls’ bedroom provided sleeping space for the girls in the household. The room’s furnishings illustrate a private domestic space within the ancestral home.',
      description: 'This room represents the girls’ sleeping quarters and gives visitors a view of the home’s domestic interiors.',
    },
    {
      image: RIZAL_COMEDOR_IMAGE_URI,
      title: 'Comedor and Traditional Ceiling Fan',
      purpose: '“Comedor” means dining room. The room was used for meals, while a ceiling fan helps circulate air indoors.',
      description: 'The comedor is the home’s dining space. Its traditional ceiling fan is a distinctive fixture and a practical way to move air through the room.',
    },
    {
      image: RIZAL_TRADITIONAL_KITCHEN_IMAGE_URI,
      title: 'Traditional Kitchen and Household Items',
      purpose: 'A kitchen is where food is prepared and cooked. The household items on display illustrate tools used in everyday domestic work.',
      description: 'The traditional kitchen and its household objects show the tools and workspaces used for preparing food and managing daily chores.',
    },
  ];

  return (
    <>
    <ScrollView style={{ flex: 1, backgroundColor: background }} contentContainerStyle={{ paddingBottom: 40 }}>
      <View>
        <FlatList
          ref={listRef}
          data={gallery}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <DestinationImage uri={item} category={dest.category} style={{ width, height: 260 }} iconSize={64} />
          )}
        />
        {gallery.length > 1 && page > 0 ? (
          <Pressable style={[styles.arrow, { left: 10 }]} onPress={() => goTo(page - 1)} accessibilityLabel="Previous photo">
            <Icon name="chevron-left" size={28} color="#fff" />
          </Pressable>
        ) : null}
        {gallery.length > 1 && page < gallery.length - 1 ? (
          <Pressable style={[styles.arrow, { right: 10 }]} onPress={() => goTo(page + 1)} accessibilityLabel="Next photo">
            <Icon name="chevron-right" size={28} color="#fff" />
          </Pressable>
        ) : null}
      </View>
      {gallery.length > 1 ? (
        <View style={styles.dots} accessibilityLabel={`Photo ${page + 1} of ${gallery.length}`}>
          {gallery.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
      ) : null}

      <View style={[styles.content, { backgroundColor: background }]}>
        <Text style={[styles.name, { color: text }]}>{dest.name}</Text>
        <Text style={[styles.address, { color: mutedText }]}>{dest.address}</Text>

        <Text style={[styles.heading, { color: text }]}>History</Text>
        <Text style={[styles.body, { color: text }]}>{dest.history || 'No historical notes have been added yet. Use Edit destination to add some.'}</Text>

        <Text style={[styles.heading, { color: text }]}>Cultural significance</Text>
        <Text style={[styles.body, { color: text }]}>{dest.significance || 'No notes on cultural significance have been added yet.'}</Text>

        <Text style={[styles.heading, { color: text }]}>About this place</Text>
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={styles.aboutRow}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_HOME_IMAGE_URI,
                  imageRatio: 1.5,
                  title: 'Historical Museum Exhibits',
                  purpose: 'This was the Aguinaldo family home. Its balcony was used for the June 12, 1898 proclamation of Philippine independence; today, the rooms let visitors see how the house was furnished and used.',
                  description: museumDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Historical Museum Exhibits full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_HOME_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.72 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Historical Museum Exhibits</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{museumDescription}</Text>
          </View>
        ) : (
          <Text style={[styles.body, { color: text }]}>{dest.description}</Text>
        )}
        {dest.name === 'Rizal Shrine, Calamba' ? rizalExhibits.map((exhibit, index) => (
          <View
            key={exhibit.image}
            style={[styles.aboutRow, styles.exhibitRow, index % 2 === 1 && styles.reverseAboutRow]}
          >
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: exhibit.image,
                  imageRatio: 4 / 3,
                  title: exhibit.title,
                  purpose: exhibit.purpose,
                  description: exhibit.description,
                })}
                accessibilityRole="button"
                accessibilityLabel={`View ${exhibit.title} full screen`}
              >
                <DestinationImage
                  uri={exhibit.image}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.75 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>{exhibit.title}</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{exhibit.description}</Text>
          </View>
        )) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View
            style={[
              styles.aboutRow,
              styles.exhibitRow,
              styles.reverseAboutRow,
            ]}
          >
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_SWORD_IMAGE_URI,
                  imageRatio: 4 / 3,
                  title: "General Aguinaldo's Personal Sword",
                  purpose: 'Swords were carried as weapons and could be used in close combat during the revolutionary period. The sword pictured is identified as General Aguinaldo’s personal sword and represents the arms carried by revolutionary leaders.',
                  description: swordDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View General Aguinaldo's Personal Sword full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_SWORD_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.72 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>General Aguinaldo&apos;s Personal Sword</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>
              {swordDescription}
            </Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_DIORAMA_IMAGE_URI,
                  imageRatio: 16 / 9,
                  title: 'Historical Diorama',
                  purpose: 'This diorama represents a revolutionary-era scene. The figures gathered behind a wooden barricade show how fighters could use barriers for protection, while the rural setting suggests the surroundings in which communities experienced the conflict.',
                  description: dioramaDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Historical Diorama full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_DIORAMA_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.56 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Historical Diorama</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>
              {dioramaDescription}
            </Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow, styles.reverseAboutRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_BEDROOM_IMAGE_URI,
                  imageRatio: 1.5,
                  title: "General Aguinaldo's Bedroom",
                  purpose: 'The bedroom was a private room for rest and daily life in the Aguinaldo family home. Its preserved bed and furnishings help visitors picture how the room was used.',
                  description: bedroomDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View General Aguinaldo's Bedroom full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_BEDROOM_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.72 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>General Aguinaldo&apos;s Bedroom</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>
              {bedroomDescription}
            </Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_DINING_ROOM_IMAGE_URI,
                  imageRatio: 4 / 3,
                  title: 'Antique Dining Room',
                  purpose: 'The dining room was used for shared household meals and receiving guests. Its large table and surrounding chairs show how the family gathered in this room.',
                  description: diningRoomDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Antique Dining Room full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_DINING_ROOM_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.75 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Antique Dining Room</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{diningRoomDescription}</Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow, styles.reverseAboutRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_CEILING_MAP_IMAGE_URI,
                  imageRatio: 1.5,
                  title: 'Philippine Map on the Dining Room Ceiling',
                  purpose: 'The map decorates the ceiling above the family dining room and displays the Philippine archipelago. It serves as a distinctive visual feature while emphasizing the country’s islands and national identity.',
                  description: ceilingMapDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Philippine Map on the Dining Room Ceiling full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_CEILING_MAP_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.67 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Philippine Map on the Dining Room Ceiling</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{ceilingMapDescription}</Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_BALCONY_IMAGE_URI,
                  imageRatio: 1.5,
                  title: 'The Balcony of Sinners (Galeria de los Pecadores)',
                  purpose: 'This upper-level balcony is part of the house’s gallery and facade. Its elevated position provides a view over the entrance and grounds; its historical name, “Balcony of Sinners,” is part of the site’s local story.',
                  description: balconyDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View The Balcony of Sinners full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_BALCONY_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.67 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>The Balcony of Sinners (Galeria de los Pecadores)</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{balconyDescription}</Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow, styles.reverseAboutRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_MEDICINE_CABINET_IMAGE_URI,
                  imageRatio: 4 / 3,
                  title: 'Antique Medicine Cabinet',
                  purpose: 'A medicine cabinet is used to store and organize medicines and medical supplies. This antique cabinet is displayed among the shrine’s historical objects.',
                  description: medicineCabinetDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Antique Medicine Cabinet full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_MEDICINE_CABINET_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.75 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Antique Medicine Cabinet</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{medicineCabinetDescription}</Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_LUNCH_BOX_IMAGE_URI,
                  imageRatio: 4 / 3,
                  title: "Aguinaldo's Personal Lunch Box",
                  purpose: 'A lunch box carries a meal so it can be kept together and eaten later. This one is presented among General Aguinaldo’s personal effects.',
                  description: lunchBoxDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Aguinaldo's Personal Lunch Box full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_LUNCH_BOX_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.75 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Aguinaldo&apos;s Personal Lunch Box</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{lunchBoxDescription}</Text>
          </View>
        ) : null}
        {dest.name === 'Aguinaldo Shrine' ? (
          <View style={[styles.aboutRow, styles.exhibitRow, styles.reverseAboutRow]}>
            <View style={[styles.aboutPhoto, { width: exhibitImageWidth }]}>
              <Pressable
                onPress={() => setSelectedExhibit({
                  image: AGUINALDO_SECRET_PASSAGE_IMAGE_URI,
                  imageRatio: 2 / 3,
                  title: 'Secret Passage and Bomb Shelter',
                  purpose: 'The passage provides access through a concealed floor opening. The space is identified as a bomb shelter, intended as a protected place during bombardment or other danger.',
                  description: secretPassageDescription,
                })}
                accessibilityRole="button"
                accessibilityLabel="View Secret Passage and Bomb Shelter full screen"
              >
                <DestinationImage
                  uri={AGUINALDO_SECRET_PASSAGE_IMAGE_URI}
                  category={dest.category}
                  style={[styles.aboutImage, { width: exhibitImageWidth, height: exhibitImageWidth * 0.75 }]}
                />
                <Text style={[styles.photoCaption, { color: mutedText }]}>Secret Passage and Bomb Shelter</Text>
              </Pressable>
            </View>
            <Text style={[styles.body, styles.aboutDescription, { color: text }]}>{secretPassageDescription}</Text>
          </View>
        ) : null}

        {dest.tourUrl ? (
          <Button
            label="Open 360° tour"
            icon="rotate-3d-variant"
            variant="gold"
            onPress={() => navigation.navigate('Tour360', { url: dest.tourUrl, name: dest.name })}
            style={{ marginTop: 24 }}
          />
        ) : null}
        <Button
          label={qCount ? 'Test what you learned' : 'No quiz questions yet'}
          icon="school-outline"
          disabled={!qCount}
          onPress={() => navigation.navigate('Quiz', { destinationId: id, name: dest.name })}
          style={{ marginTop: 12 }}
        />
      </View>
    </ScrollView>
    <Modal
      visible={selectedExhibit !== null}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setSelectedExhibit(null)}
    >
      {selectedExhibit ? (
        <View style={styles.fullscreen}>
          <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <SvgRadialGradient id="tourSpotTop" cx="50%" cy="0%" rx="40%" ry="60%">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
                <Stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </SvgRadialGradient>
              <SvgRadialGradient id="tourSpotCenter" cx="50%" cy="42%" rx="50%" ry="48%">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#tourSpotTop)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#tourSpotCenter)" />
          </Svg>
          <Pressable
            style={[styles.closeButton, { top: insets.top + 12 }]}
            onPress={() => setSelectedExhibit(null)}
            accessibilityRole="button"
            accessibilityLabel="Close full-screen exhibit"
          >
            <Icon name="close" size={26} color="#fff" />
          </Pressable>
          <View style={[styles.fullscreenHeader, { paddingTop: insets.top + 18 }]}>
            <Text style={styles.fullscreenHistoryTitle}>What it shows</Text>
            <ScrollView style={styles.fullscreenHistoryScroll} nestedScrollEnabled>
              <Text style={styles.fullscreenHistoryText}>
                {selectedExhibit.purpose}
              </Text>
            </ScrollView>
          </View>
          <View style={[styles.fullscreenContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <RotatingImage
              source={getDestinationImageSource(selectedExhibit.image)}
              width={viewerImageWidth}
              height={viewerImageHeight}
              accessibilityLabel={selectedExhibit.title}
            />
            <View style={styles.fullscreenCaption}>
              <Text style={styles.fullscreenTitle}>{selectedExhibit.title}</Text>
              <Text style={styles.fullscreenDescription}>{selectedExhibit.description}</Text>
            </View>
          </View>
        </View>
      ) : null}
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  arrow: {
    position: 'absolute', top: 110, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  content: { padding: 20 },
  aboutRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  reverseAboutRow: { flexDirection: 'row-reverse' },
  exhibitRow: { marginTop: 12 },
  aboutPhoto: { gap: 6 },
  aboutImage: { borderRadius: 8 },
  photoCaption: { width: '100%', fontSize: 12, lineHeight: 16, fontWeight: '600', textAlign: 'center' },
  aboutDescription: { flex: 1, fontSize: 16, lineHeight: 24 },
  fullscreen: {
    flex: 1, backgroundColor: '#08090B', alignItems: 'center',
  },
  closeButton: {
    position: 'absolute', right: 16, zIndex: 1, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center',
  },
  fullscreenHeader: {
    width: '100%', paddingHorizontal: 20, paddingBottom: 10,
  },
  fullscreenHistoryTitle: { color: '#fff', fontSize: 18, lineHeight: 24, fontWeight: '700', marginBottom: 6 },
  fullscreenHistoryScroll: { maxHeight: 110 },
  fullscreenHistoryText: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 19, paddingRight: 48 },
  fullscreenContent: {
    flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, gap: 14,
  },
  fullscreenCaption: {
    width: '100%', maxWidth: 640, flexShrink: 0, paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#15171A', borderRadius: 12,
  },
  fullscreenTitle: { color: '#fff', fontSize: 18, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  fullscreenDescription: {
    color: 'rgba(255,255,255,0.86)', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8,
  },
  name: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: colors.ink },
  address: { fontSize: 15, color: colors.muted, marginTop: 4 },
  heading: { fontFamily: fonts.serif, fontSize: 21, fontWeight: '700', color: colors.ink, marginTop: 24, marginBottom: 8 },
  body: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 27, color: colors.ink },
});
