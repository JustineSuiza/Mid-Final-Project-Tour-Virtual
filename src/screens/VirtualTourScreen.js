import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  PAHIYAS_AGRICULTURAL_PRODUCTS_IMAGE_URI, PAHIYAS_BASILICA_IMAGE_URI,
  PAHIYAS_BURI_HANDICRAFTS_IMAGE_URI, PAHIYAS_CARABAO_HARVEST_IMAGE_URI,
  PAHIYAS_COLORFUL_HOUSES_IMAGE_URI, PAHIYAS_FLOWER_DECORATIONS_IMAGE_URI,
  PAHIYAS_KIPING_IMAGE_URI, PAHIYAS_LONGGANISA_IMAGE_URI, PAHIYAS_PANCIT_HABHAB_IMAGE_URI,
  PAHIYAS_SAN_ISIDRO_IMAGE_URI,
  PILA_ANCESTRAL_HOUSES_IMAGE_URI, PILA_CAPIZ_WINDOWS_IMAGE_URI, PILA_MUNICIPAL_HALL_IMAGE_URI,
  PILA_MUSEUM_ARTIFACTS_IMAGE_URI, PILA_SAN_ANTONIO_CHURCH_IMAGE_URI, PILA_SPANISH_BRIDGE_IMAGE_URI,
  PILA_TOWN_PLAZA_IMAGE_URI, PILA_VENTANILLAS_GRILLS_IMAGE_URI,
  PILA_WOODEN_CEILINGS_IMAGE_URI, PILA_WOODEN_STAIRCASE_IMAGE_URI,
  TAAL_APACIBLE_MUSEUM_IMAGE_URI, TAAL_BASILICA_IMAGE_URI, TAAL_CASA_REAL_IMAGE_URI,
  TAAL_CASA_VILLAVICENCIO_IMAGE_URI, TAAL_CAMERA_MUSEUM_IMAGE_URI, TAAL_ESCUELA_PIA_IMAGE_URI,
  TAAL_HERITAGE_HOUSES_IMAGE_URI, TAAL_MARCELA_AGONCILLO_MUSEUM_IMAGE_URI,
  TAAL_WEDDING_GIFT_HOUSE_IMAGE_URI, TAAL_2020_ERUPTION_IMAGE_URI,
  TAAL_BININTIANG_MALAKI_IMAGE_URI, TAAL_GEOLOGICAL_FORMATIONS_IMAGE_URI,
  TAAL_LAKE_IMAGE_URI, TAAL_MAIN_CRATER_LAKE_IMAGE_URI, TAAL_PANORAMIC_VIEW_IMAGE_URI,
  TAAL_STEAM_GAS_IMAGE_URI, TAAL_VOLCANIC_LANDSCAPE_IMAGE_URI, TAAL_VOLCANO_ISLAND_IMAGE_URI,
  TAAL_VULCAN_POINT_IMAGE_URI,
  MAKILING_BOTANIC_GARDENS_IMAGE_URI, MAKILING_FOREST_CANOPY_IMAGE_URI,
  MAKILING_FOREST_WATERWAYS_IMAGE_URI, MAKILING_HIKING_TRAIL_IMAGE_URI,
  MAKILING_MOUNTAIN_VIEW_IMAGE_URI, MAKILING_PEAK_II_IMAGE_URI, MAKILING_RAFFLESIA_IMAGE_URI,
  MAKILING_WILDLIFE_IMAGE_URI,
  ANTIPOLO_BAS_RELIEF_IMAGE_URI, ANTIPOLO_BLACK_NAZARENE_IMAGE_URI,
  ANTIPOLO_CATHEDRAL_NAVE_IMAGE_URI, ANTIPOLO_DOME_CEILING_IMAGE_URI,
  ANTIPOLO_GALLERY_CHOIR_LOFT_IMAGE_URI, ANTIPOLO_MAIN_ALTAR_IMAGE_URI,
  ANTIPOLO_OUR_LADY_IMAGE_URI, ANTIPOLO_PIPE_ORGAN_IMAGE_URI, ANTIPOLO_SANTO_ENTIERRO_IMAGE_URI,
  ANTIPOLO_STAINED_GLASS_IMAGE_URI,
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
  const { background, text, mutedText, photoMotionEnabled } = useAppTheme();
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
  const antipoloExhibits = [
    {
      image: ANTIPOLO_MAIN_ALTAR_IMAGE_URI,
      title: 'Main Altar and Sanctuary',
      purpose: 'The sanctuary is the church’s principal worship area, with the altar as the focal point for the celebration of Mass.',
      description: 'The main altar and sanctuary form the central liturgical space of Antipolo Cathedral, where worship and major religious services take place.',
    },
    {
      image: ANTIPOLO_OUR_LADY_IMAGE_URI,
      title: 'Image of Our Lady of Peace and Good Voyage',
      purpose: 'The image is venerated by pilgrims under the title Our Lady of Peace and Good Voyage, reflecting devotion to Mary and prayers for protection during travel.',
      description: 'This image is the focus of devotion at Antipolo Cathedral and is associated with pilgrims seeking peace and safe journeys.',
    },
    {
      image: ANTIPOLO_CATHEDRAL_NAVE_IMAGE_URI,
      title: 'Cathedral Nave',
      purpose: 'The nave is the long central part of a church where the congregation gathers during services.',
      description: 'The cathedral nave provides seating and space for worshippers, leading toward the sanctuary and main altar.',
    },
    {
      image: ANTIPOLO_STAINED_GLASS_IMAGE_URI,
      title: 'Stained-Glass Windows',
      purpose: 'Stained glass admits colored light into the church and can use imagery to support reflection and convey religious themes.',
      description: 'The stained-glass windows add color and religious imagery to the cathedral interior while filtering daylight into the space.',
    },
    {
      image: ANTIPOLO_DOME_CEILING_IMAGE_URI,
      title: 'Cathedral Dome and Ceiling',
      purpose: 'A dome and decorated ceiling create a high, open interior and draw the eye upward within the church.',
      description: 'The dome and ceiling are prominent architectural features that shape the cathedral’s spacious interior.',
    },
    {
      image: ANTIPOLO_PIPE_ORGAN_IMAGE_URI,
      title: 'Cathedral Pipe Organ',
      purpose: 'A pipe organ produces music through air passing through pipes and is used to accompany worship and choral singing.',
      description: 'The cathedral pipe organ provides music for liturgies and other services, supporting congregational and choral worship.',
    },
    {
      image: ANTIPOLO_BLACK_NAZARENE_IMAGE_URI,
      title: 'Black Nazarene Statue',
      purpose: 'The Black Nazarene depicts Jesus carrying the cross. Catholic devotees pray before the image as an expression of faith and devotion.',
      description: 'This statue represents Jesus carrying the cross and is one of the religious images displayed within the cathedral.',
    },
    {
      image: ANTIPOLO_SANTO_ENTIERRO_IMAGE_URI,
      title: 'Santo Entierro',
      purpose: 'Santo Entierro, or the Holy Burial, depicts the body of Jesus after the crucifixion and is used in Catholic devotion, especially during Holy Week.',
      description: 'The Santo Entierro image recalls the burial of Jesus and is associated with prayer and Holy Week observances.',
    },
    {
      image: ANTIPOLO_BAS_RELIEF_IMAGE_URI,
      title: 'Bas-Relief Religious Artwork',
      purpose: 'Bas-relief is a sculptural technique in which figures project slightly from a flat background, allowing religious scenes to be represented on walls or panels.',
      description: 'The bas-relief artwork adds sculpted religious imagery to the cathedral and invites visitors to look closely at its details.',
    },
    {
      image: ANTIPOLO_GALLERY_CHOIR_LOFT_IMAGE_URI,
      title: 'Gallery and Choir Loft',
      purpose: 'A choir loft is an elevated area used by singers and musicians during services; a gallery provides an upper-level view into the church.',
      description: 'The gallery and choir loft form an elevated interior area associated with music during worship and offer a view across the cathedral.',
    },
  ];
  const pahiyasExhibits = [
    {
      image: PAHIYAS_COLORFUL_HOUSES_IMAGE_URI,
      title: 'Colorful Pahiyas Festival Houses',
      purpose: 'During the Pahiyas Festival, families decorate their homes to give thanks for the harvest. Visitors walk through the town to see the decorated facades.',
      description: 'Lucban’s decorated homes are a signature sight of Pahiyas, turning the town streets into a community display of harvest thanksgiving and creativity.',
    },
    {
      image: PAHIYAS_KIPING_IMAGE_URI,
      title: 'Kiping Decorations',
      purpose: 'Kiping are colorful, leaf-shaped rice wafers made for festival decoration. They are often arranged into ornaments and hung on house fronts.',
      description: 'These vibrant rice wafers are a distinctive Pahiyas decoration, adding color and pattern to the festival displays.',
    },
    {
      image: PAHIYAS_AGRICULTURAL_PRODUCTS_IMAGE_URI,
      title: 'Agricultural Products Display',
      purpose: 'Fruits, vegetables, and other farm products are arranged as decorations to celebrate the harvest and give thanks for a productive season.',
      description: 'The produce display highlights the agricultural roots of Pahiyas and the harvest that the festival celebrates.',
    },
    {
      image: PAHIYAS_FLOWER_DECORATIONS_IMAGE_URI,
      title: 'Pahiyas Festival Flower Decorations',
      purpose: 'Flowers are used to decorate homes and festival displays, bringing natural colors and textures into the celebration.',
      description: 'The flower arrangements complement the kiping and produce, adding another layer of color to the decorated houses.',
    },
    {
      image: PAHIYAS_SAN_ISIDRO_IMAGE_URI,
      title: 'San Isidro Labrador Religious Image',
      purpose: 'San Isidro Labrador is honored as the patron saint of farmers. Devotion to the saint is central to the festival’s harvest thanksgiving tradition.',
      description: 'This religious image represents the festival’s connection to San Isidro Labrador and prayers for agricultural abundance.',
    },
    {
      image: PAHIYAS_BASILICA_IMAGE_URI,
      title: 'Minor Basilica of Saint Michael the Archangel',
      purpose: 'The basilica serves as a place for Catholic worship and community religious observances in Lucban.',
      description: 'The Minor Basilica of Saint Michael the Archangel is an important religious landmark in Lucban and part of the town’s heritage setting.',
    },
    {
      image: PAHIYAS_CARABAO_HARVEST_IMAGE_URI,
      title: 'Traditional Carabao and Harvest Decorations',
      purpose: 'The carabao is closely associated with farm work in the Philippines. Harvest-themed decorations celebrate the animals, crops, and labor connected with farming.',
      description: 'These decorations bring agricultural imagery into the festival and recognize the role of farming in local life.',
    },
    {
      image: PAHIYAS_BURI_HANDICRAFTS_IMAGE_URI,
      title: 'Traditional Buri Hats and Handicrafts',
      purpose: 'Buri is a palm used in weaving. Hats and other woven crafts are practical handmade products that also display local skill and material traditions.',
      description: 'The buri hats and handicrafts showcase traditional weaving and the craftwork associated with local life.',
    },
    {
      image: PAHIYAS_PANCIT_HABHAB_IMAGE_URI,
      title: 'Pancit Habhab',
      purpose: 'Pancit habhab is a Lucban noodle dish traditionally eaten directly from a banana leaf, without utensils.',
      description: 'This local specialty is part of Lucban’s food culture and is commonly enjoyed by residents and festival visitors.',
    },
    {
      image: PAHIYAS_LONGGANISA_IMAGE_URI,
      title: 'Lucban Longganisa',
      purpose: 'Lucban longganisa is a distinctive local sausage known for its garlicky flavor and characteristic seasoning.',
      description: 'The town’s well-known longganisa is a popular food associated with Lucban and a favorite among visitors.',
    },
  ];
  const pilaExhibits = [
    {
      image: PILA_ANCESTRAL_HOUSES_IMAGE_URI,
      title: 'Pila Historic Ancestral Houses',
      purpose: 'Ancestral houses preserve architectural features and domestic spaces from earlier periods. Their facades and layouts help show how families lived in the historic town.',
      description: 'Pila’s ancestral houses are a defining part of its heritage streetscape, preserving traditional architecture and the town’s historic character.',
    },
    {
      image: PILA_TOWN_PLAZA_IMAGE_URI,
      title: 'Pila Town Plaza',
      purpose: 'The town plaza is a shared civic space where residents gather and community events take place. In historic towns, important public buildings often face the plaza.',
      description: 'Pila’s plaza anchors the historic town center and connects the surrounding civic and religious landmarks.',
    },
    {
      image: PILA_SAN_ANTONIO_CHURCH_IMAGE_URI,
      title: 'San Antonio de Padua Church',
      purpose: 'The church is a place for Catholic worship and community religious observances. Its position near the plaza reflects the central role of the parish in town life.',
      description: 'San Antonio de Padua Church is a prominent religious landmark in Pila’s historic center.',
    },
    {
      image: PILA_MUNICIPAL_HALL_IMAGE_URI,
      title: 'Old Pila Municipal Hall',
      purpose: 'A municipal hall houses local government offices and public services. Historic examples also reflect the architectural style and civic identity of their period.',
      description: 'The old municipal hall represents the town’s civic history and is among the historic structures around the town center.',
    },
    {
      image: PILA_CAPIZ_WINDOWS_IMAGE_URI,
      title: 'Heritage House Capiz Windows',
      purpose: 'Capiz-shell window panels diffuse daylight while providing ventilation. They are a characteristic feature of many traditional Filipino houses.',
      description: 'These windows show a traditional building feature valued for its soft light, airflow, and distinctive appearance.',
    },
    {
      image: PILA_WOODEN_STAIRCASE_IMAGE_URI,
      title: 'Heritage House Wooden Staircase',
      purpose: 'A staircase connects the ground floor with the upper living spaces of a traditional house. Its construction and details reveal the craft used in the home.',
      description: 'The wooden staircase is both a practical feature and a prominent example of the interior craftsmanship found in heritage houses.',
    },
    {
      image: PILA_VENTANILLAS_GRILLS_IMAGE_URI,
      title: 'Ventanillas and Wrought-Iron Window Grills',
      purpose: 'Ventanillas are small openings below windows that allow air to circulate. Iron grills add security while forming decorative patterns.',
      description: 'Together, the ventanillas and wrought-iron grills show how traditional houses balanced ventilation, security, and ornament.',
    },
    {
      image: PILA_WOODEN_CEILINGS_IMAGE_URI,
      title: 'Antique Wooden Ceilings and Carvings',
      purpose: 'Decorated wooden ceilings finish and protect the rooms below the roof. Carved details display the workmanship and decorative style of the house.',
      description: 'The antique ceilings and carvings highlight the skilled woodwork preserved in Pila’s heritage interiors.',
    },
    {
      image: PILA_SPANISH_BRIDGE_IMAGE_URI,
      title: 'Spanish-Era Bridge',
      purpose: 'Bridges connect communities across waterways and support the movement of people and goods. Historic bridges also preserve evidence of earlier infrastructure.',
      description: 'This bridge is presented as a remnant of earlier infrastructure associated with the Spanish colonial period.',
    },
    {
      image: PILA_MUSEUM_ARTIFACTS_IMAGE_URI,
      title: 'Pila Museum and Archaeological Artifacts',
      purpose: 'Archaeological artifacts are material remains from past communities. Museums preserve and interpret them to help visitors understand local history.',
      description: 'The museum’s artifacts provide material evidence of Pila’s past and help tell the story of the community across different periods.',
    },
  ];
  const taalExhibits = [
    {
      image: TAAL_HERITAGE_HOUSES_IMAGE_URI,
      title: 'Taal Heritage Houses',
      purpose: 'The ancestral houses preserve the architecture and domestic spaces of earlier generations. Their facades and interiors reveal how local families lived and built homes.',
      description: 'Taal’s heritage houses are a defining part of the townscape, displaying traditional architecture and craftsmanship.',
    },
    {
      image: TAAL_BASILICA_IMAGE_URI,
      title: 'Minor Basilica of Saint Martin of Tours',
      purpose: 'The basilica is a Catholic place of worship dedicated to Saint Martin of Tours and serves the religious life of the community.',
      description: 'Known as Taal Basilica, this landmark is dedicated to Saint Martin of Tours and is central to the town’s religious heritage.',
    },
    {
      image: TAAL_CASA_VILLAVICENCIO_IMAGE_URI,
      title: 'Casa Villavicencio',
      purpose: 'Casa Villavicencio is a preserved ancestral residence. Its rooms and architectural details offer a view into the lifestyle of a prominent Taal family.',
      description: 'The house preserves domestic spaces and period details associated with Taal’s heritage and the Villavicencio family.',
    },
    {
      image: TAAL_WEDDING_GIFT_HOUSE_IMAGE_URI,
      title: 'Villavicencio Wedding Gift House',
      purpose: 'The house is associated with the wedding gift given by Eulalio Villavicencio to Gliceria Marella upon their marriage. It is remembered as a historic residence and symbol of their family story.',
      description: 'This ancestral house is known as the Villavicencio wedding gift house and connects the town’s built heritage with the story of Eulalio Villavicencio and Gliceria Marella.',
    },
    {
      image: TAAL_MARCELA_AGONCILLO_MUSEUM_IMAGE_URI,
      title: 'Marcela Agoncillo Museum',
      purpose: 'The museum commemorates Marcela Agoncillo, who helped sew the first Philippine flag, and presents materials related to her life and legacy.',
      description: 'Exhibits at the museum honor Marcela Agoncillo and her contribution to Philippine history.',
    },
    {
      image: TAAL_APACIBLE_MUSEUM_IMAGE_URI,
      title: 'Don Leon and Galicano Apacible Museum',
      purpose: 'A house museum preserves objects and stories connected with the people who lived there. This museum is associated with Don Leon and Galicano Apacible.',
      description: 'The museum shares the history of the Apacible family and the role of the house in Taal’s heritage.',
    },
    {
      image: TAAL_CAMERA_MUSEUM_IMAGE_URI,
      title: 'Galleria Taal Camera Museum',
      purpose: 'A camera museum displays photographic equipment and related objects, showing how cameras and photography developed over time.',
      description: 'The collection introduces visitors to historical cameras and the tools used to capture and preserve images.',
    },
    {
      image: TAAL_ESCUELA_PIA_IMAGE_URI,
      title: 'Escuela Pia',
      purpose: 'Escuela Pia is a historic school building that reflects the role of education in the town’s past.',
      description: 'This heritage structure is associated with schooling and community life in historic Taal.',
    },
    {
      image: TAAL_CASA_REAL_IMAGE_URI,
      title: 'Casa Real de Taal',
      purpose: 'A casa real served as a Spanish-era government building and administrative center. Such structures reflect how colonial local governance was organized.',
      description: 'Casa Real de Taal is a historic civic landmark connected with the town’s administration and public life.',
    },
  ];
  const taalVolcanoExhibits = [
    {
      image: TAAL_PANORAMIC_VIEW_IMAGE_URI,
      title: 'Panoramic View of Taal Volcano',
      purpose: 'A panoramic viewpoint reveals the relationship between the volcano, its island, and the surrounding lake and landscape.',
      description: 'This wide view shows Taal Volcano within its lake setting and helps visitors appreciate the scale of the volcanic landscape.',
    },
    {
      image: TAAL_LAKE_IMAGE_URI,
      title: 'Taal Lake',
      purpose: 'Taal Lake surrounds Volcano Island and forms part of the volcano’s nested caldera system.',
      description: 'The lake is a defining feature of the landscape around Taal Volcano and supports communities and ecosystems in the area.',
    },
    {
      image: TAAL_VOLCANO_ISLAND_IMAGE_URI,
      title: 'Volcano Island',
      purpose: 'Volcano Island sits within Taal Lake and contains volcanic features formed through repeated eruptions.',
      description: 'The island is the visible volcanic landmass within Taal Lake and includes the active volcanic complex.',
    },
    {
      image: TAAL_BININTIANG_MALAKI_IMAGE_URI,
      title: 'Binintiang Malaki',
      purpose: 'Binintiang Malaki is a prominent volcanic cone on Volcano Island and is one of the recognizable features of Taal.',
      description: 'This cone is a distinct landform on Volcano Island and has been associated with past eruptive activity.',
    },
    {
      image: TAAL_MAIN_CRATER_LAKE_IMAGE_URI,
      title: 'Main Crater Lake',
      purpose: 'The Main Crater Lake occupies the volcano’s main crater, with steep crater walls enclosing the water.',
      description: 'This crater lake is a striking feature within Volcano Island’s volcanic landscape.',
    },
    {
      image: TAAL_VULCAN_POINT_IMAGE_URI,
      title: 'Vulcan Point',
      purpose: 'Vulcan Point is a small volcanic island within Main Crater Lake, creating a nested island-within-a-lake setting.',
      description: 'The small point visible in the Main Crater Lake photo is Vulcan Point, a notable feature of Taal’s nested volcanic landscape.',
    },
    {
      image: TAAL_VOLCANIC_LANDSCAPE_IMAGE_URI,
      title: 'Volcanic Mountain Landscape',
      purpose: 'Volcanic slopes and ridges are shaped by eruptions, lava, ash, and erosion over time.',
      description: 'The surrounding terrain shows the varied landforms created by volcanic processes at Taal.',
    },
    {
      image: TAAL_STEAM_GAS_IMAGE_URI,
      title: 'Volcanic Steam and Gas Emissions',
      purpose: 'Steam and volcanic gases can escape through vents and fumaroles as heat moves through the ground. Emissions vary over time and are monitored by volcanologists.',
      description: 'This image shows steam and gas associated with volcanic activity; it should not be taken as a real-time indication of current conditions.',
    },
    {
      image: TAAL_2020_ERUPTION_IMAGE_URI,
      title: 'Taal Volcano 2020 Eruption',
      purpose: 'In January 2020, Taal Volcano produced an explosive eruption that sent ash high into the atmosphere and prompted evacuations around the volcano.',
      description: 'The 2020 eruption affected nearby communities and highlighted the importance of monitoring and preparedness in volcanic areas.',
    },
    {
      image: TAAL_GEOLOGICAL_FORMATIONS_IMAGE_URI,
      title: 'Volcanic Rocks and Geological Formations',
      purpose: 'Volcanic rocks form when magma or ash cools and hardens. Their textures and layers provide clues about past eruptions and geological processes.',
      description: 'These rocks and formations illustrate how volcanic activity has shaped the landscape over time.',
    },
  ];
  const makilingExhibits = [
    {
      image: MAKILING_MOUNTAIN_VIEW_IMAGE_URI,
      title: 'Mount Makiling Mountain View',
      purpose: 'A mountain viewpoint helps visitors see the forested slopes and the surrounding Laguna landscape.',
      description: 'This view introduces the mountain setting of the Mount Makiling Forest Reserve and its broad forested terrain.',
    },
    {
      image: MAKILING_BOTANIC_GARDENS_IMAGE_URI,
      title: 'Makiling Botanic Gardens',
      purpose: 'The gardens support the study, conservation, and display of plants native to the Philippines and other tropical regions.',
      description: 'Trails through the Botanic Gardens let visitors encounter forest plants and learn about botanical research and conservation.',
    },
    {
      image: MAKILING_HIKING_TRAIL_IMAGE_URI,
      title: 'Mariang Makiling Hiking Trail',
      purpose: 'The trail provides access for hikers to explore the mountain environment on foot. Visitors should follow marked routes and local safety guidance.',
      description: 'The hiking trail passes through forest habitat and is associated with the local legend of Mariang Makiling.',
    },
    {
      image: MAKILING_FOREST_CANOPY_IMAGE_URI,
      title: 'Mount Makiling Forest Canopy',
      purpose: 'The forest canopy is the upper layer formed by tree crowns. It provides habitat, shade, and shelter for many forest organisms.',
      description: 'The continuous tree cover illustrates the dense forest habitat protected within the reserve.',
    },
    {
      image: MAKILING_WILDLIFE_IMAGE_URI,
      title: 'Philippine Forest Wildlife',
      purpose: 'Forest wildlife depends on healthy habitat for food, shelter, and breeding. Protecting the reserve helps conserve native species.',
      description: 'This image presents wildlife in a forest setting and highlights the biodiversity associated with Mount Makiling.',
    },
    {
      image: MAKILING_RAFFLESIA_IMAGE_URI,
      title: 'Rafflesia Flower',
      purpose: 'Rafflesia is a rare parasitic plant known for producing one of the world’s largest flowers. It has no leaves, stems, or roots of its own and depends on a host vine.',
      description: 'The Rafflesia flower is a remarkable part of Philippine plant biodiversity. Its blooms are uncommon and short-lived, making conservation of its forest habitat important.',
    },
    {
      image: MAKILING_PEAK_II_IMAGE_URI,
      title: 'Mount Makiling Peak II',
      purpose: 'Peak II is one of the mountain’s summit areas and a destination along the Mount Makiling hiking routes.',
      description: 'This peak offers hikers a higher vantage point within Mount Makiling’s forested landscape.',
    },
    {
      image: MAKILING_FOREST_WATERWAYS_IMAGE_URI,
      title: 'Forest Waterways and Natural Streams',
      purpose: 'Streams carry water through the forest and provide habitat for aquatic organisms while connecting the mountain’s watershed.',
      description: 'These waterways show how forest cover supports natural streams and helps sustain the surrounding watershed.',
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
        {dest.name === 'Antipolo Cathedral' ? antipoloExhibits.map((exhibit, index) => (
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
        {dest.name === 'Lucban and the Pahiyas Festival' ? pahiyasExhibits.map((exhibit, index) => (
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
        {dest.name === 'Pila Historic Town Center' ? pilaExhibits.map((exhibit, index) => (
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
        {dest.name === 'Taal Heritage Town' ? taalExhibits.map((exhibit, index) => (
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
        {dest.name === 'Taal Volcano' ? taalVolcanoExhibits.map((exhibit, index) => (
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
        {dest.name === 'Mount Makiling Forest Reserve' ? makilingExhibits.map((exhibit, index) => (
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
            {photoMotionEnabled ? (
              <RotatingImage
                source={getDestinationImageSource(selectedExhibit.image)}
                width={viewerImageWidth}
                height={viewerImageHeight}
                accessibilityLabel={selectedExhibit.title}
              />
            ) : (
              <Image
                source={getDestinationImageSource(selectedExhibit.image)}
                resizeMode="cover"
                accessibilityLabel={selectedExhibit.title}
                style={{ width: viewerImageWidth, height: viewerImageHeight, borderRadius: 10 }}
              />
            )}
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
