import {
  AGUINALDO_IMAGE_URI, ANTIPOLO_COVER_IMAGE_URI, PAHIYAS_FESTIVAL_IMAGE_URI,
  PILA_HISTORIC_TOWN_CENTER_IMAGE_URI, RIZAL_SHRINE_IMAGE_URI,
  MAKILING_FOREST_RESERVE_IMAGE_URI, TAAL_HERITAGE_TOWN_IMAGE_URI, TAAL_VOLCANO_IMAGE_URI,
} from '../utils/destinationImages';

// Starter records for the CALABARZON provinces. Add destination photos through Edit destination.
export const SEED_DESTINATIONS = [
  {
    name: 'Aguinaldo Shrine',
    category: 'Historical',
    province: 'Cavite',
    address: 'Kawit, Cavite',
    latitude: 14.445,
    longitude: 120.90694,
    imageUri: AGUINALDO_IMAGE_URI,
    description:
      'The ancestral house of General Emilio Aguinaldo, where Philippine independence was proclaimed on June 12, 1898. Today it is kept as a national shrine and museum.',
    history:
      'Aguinaldo led revolutionary forces against Spain and became the first president of the Philippines. From the window of his family home in Kawit, he declared independence as the Philippine flag was unfurled and the Marcha Nacional Filipina was played. The house has since been preserved with personal belongings and memorabilia from the revolution.',
    significance:
      'The shrine marks the birthplace of Philippine independence. It is the focus of Independence Day celebrations every June 12 and reminds visitors of the sacrifices of the revolutionary generation.',
    quiz: [
      { question: 'What do the Aguinaldo Shrine’s historical museum exhibits help visitors explore?', options: ['Preserved objects and information about the shrine and its history', 'Modern transportation in Kawit', 'The geology of Taal Lake', 'The making of rice wafers'], answerIndex: 0, explanation: 'The exhibits present historical objects and information connected with the shrine.' },
      { question: 'Which personal artifact is shown in the Aguinaldo Shrine tour?', options: ['A printing press', 'General Aguinaldo’s personal sword', 'A pipe organ', 'A farming hoe'], answerIndex: 1, explanation: 'The tour includes General Aguinaldo’s personal sword.' },
      { question: 'What scene does the historical diorama portray?', options: ['A harvest festival parade', 'A church service', 'A revolutionary-era scene with a wooden barricade', 'A volcanic eruption'], answerIndex: 2, explanation: 'The diorama shows figures gathered behind a wooden defensive barrier.' },
      { question: 'Which room’s furnishings show a private place for rest in the Aguinaldo home?', options: ['The dining room', 'The library', 'The kitchen', 'General Aguinaldo’s bedroom'], answerIndex: 3, explanation: 'The preserved bedroom displays furnishings used for rest and daily life.' },
      { question: 'What activities took place in the antique dining room?', options: ['Shared meals and receiving guests', 'Storing farm tools', 'Holding school lessons', 'Displaying volcanic rocks'], answerIndex: 0, explanation: 'The dining room was used for household meals and receiving guests.' },
      { question: 'What is displayed across the dining-room ceiling?', options: ['A map of Taal Lake', 'A map of the Philippine archipelago', 'A painting of Mount Makiling', 'A collection of family portraits'], answerIndex: 1, explanation: 'The ceiling features a map of the Philippines.' },
      { question: 'What is the historical name of the Aguinaldo Shrine balcony in the tour?', options: ['Escuela Pia', 'Casa Real', 'Galeria de los Pecadores', 'Ventanillas'], answerIndex: 2, explanation: 'The balcony is known as the Galeria de los Pecadores, or “Balcony of Sinners.”' },
      { question: 'What was the antique medicine cabinet used to organize?', options: ['Books and maps', 'Photographs', 'Kitchen utensils', 'Remedies and medical supplies'], answerIndex: 3, explanation: 'Medicine cabinets were used to keep remedies and medical supplies organized.' },
      { question: 'What was General Aguinaldo’s personal lunch box meant to carry?', options: ['A meal', 'A medicine cabinet', 'A map', 'A set of books'], answerIndex: 0, explanation: 'A lunch box carries a meal to be eaten later.' },
      { question: 'What does the shrine’s secret passage lead to?', options: ['A church nave', 'A protected bomb-shelter area', 'A town plaza', 'A botanical garden'], answerIndex: 1, explanation: 'The concealed passage is identified as access to a bomb shelter.' },
    ],
  },
  {
    name: 'Rizal Shrine, Calamba',
    category: 'Historical',
    province: 'Laguna',
    address: 'Calamba, Laguna',
    imageUri: RIZAL_SHRINE_IMAGE_URI,
    latitude: 14.2116,
    longitude: 121.1653,
    description:
      'A replica of the ancestral house where national hero Dr. José Rizal was born on June 19, 1861. The shrine displays family memorabilia and exhibits on his life.',
    history:
      'José Rizal grew up in Calamba in a family of landowners. He became a physician, writer, and reformer, and wrote the novels Noli Me Tangere (1887) and El Filibusterismo (1891). He was executed by Spanish authorities on December 30, 1896.',
    significance:
      'Rizal is the Philippines’ national hero, and his writings helped awaken national consciousness. The shrine lets students connect his ideas to the town and home that shaped him.',
    quiz: [
      { question: 'What is the purpose of the ground-floor historical exhibits at Rizal Shrine?', options: ['To present objects and information about Rizal and his family', 'To explain how to weave buri hats', 'To display volcanic monitoring equipment', 'To teach visitors how to make longganisa'], answerIndex: 0, explanation: 'The exhibits introduce historical materials connected with Rizal and his family.' },
      { question: 'What age does the Young José Rizal Statue depict him as?', options: ['An adult physician', 'A child', 'A town mayor', 'A soldier in old age'], answerIndex: 1, explanation: 'The statue portrays José Rizal as a child.' },
      { question: 'What does Rizal’s childhood memorabilia preserve?', options: ['Objects from the Pahiyas harvest', 'Tools used in a church choir', 'Items associated with his early years', 'Artifacts from Taal Volcano'], answerIndex: 2, explanation: 'Childhood memorabilia preserves objects associated with Rizal’s early life.' },
      { question: 'Who is the library exhibit named after?', options: ['Emilio Aguinaldo', 'Marcela Agoncillo', 'San Antonio de Padua', 'Francisco Mercado, Rizal’s father'], answerIndex: 3, explanation: 'Francisco Mercado was José Rizal’s father.' },
      { question: 'What was the Family Dining Room used for?', options: ['Gathering to share meals', 'Storing archaeological artifacts', 'Holding a town council', 'Keeping medicines'], answerIndex: 0, explanation: 'The dining room was a place for the family to gather for meals.' },
      { question: 'What important event is associated with Rizal’s Birth Room?', options: ['The signing of the Treaty of Paris', 'José Rizal’s birth', 'The first Pahiyas Festival', 'The founding of UP Los Baños'], answerIndex: 1, explanation: 'The shrine preserves the room identified as José Rizal’s birthplace.' },
      { question: 'Who used the Boys’ Bedroom in the family home?', options: ['The household’s guests only', 'The girls in the household', 'The boys in the household', 'The town’s schoolchildren'], answerIndex: 2, explanation: 'The room represents sleeping quarters for boys in the household.' },
      { question: 'Who used the Girls’ Bedroom?', options: ['The boys in the household', 'The shrine’s museum staff', 'The family’s visitors only', 'The girls in the household'], answerIndex: 3, explanation: 'The room represents the girls’ sleeping quarters.' },
      { question: 'What does “comedor” mean in the Comedor and Traditional Ceiling Fan exhibit?', options: ['Dining room', 'Town plaza', 'School', 'Balcony'], answerIndex: 0, explanation: '“Comedor” means dining room.' },
      { question: 'What was the Traditional Kitchen and Household Items exhibit used to show?', options: ['How books were arranged in a library', 'Tools and workspaces for preparing food and daily chores', 'How a church organ works', 'How a volcanic crater forms'], answerIndex: 1, explanation: 'The kitchen exhibit shows household tools and spaces used for food preparation and daily work.' },
    ],
  },
  {
    name: 'Pila Historic Town Center',
    category: 'Cultural',
    province: 'Laguna',
    address: 'Pila, Laguna',
    imageUri: PILA_HISTORIC_TOWN_CENTER_IMAGE_URI,
    latitude: 14.2326,
    longitude: 121.3646,
    description:
      'A well-preserved Spanish colonial town center arranged around a plaza, with a church, a municipal hall, and ancestral houses that are still lived in.',
    history:
      'Pila grew as a Spanish-era town in Laguna, with its main buildings clustered around the plaza as colonial town planning required. The Church of San Antonio de Padua anchors the plaza, and several old houses have been restored in recent decades.',
    significance:
      'Pila shows how a Spanish colonial town was organized and how heritage buildings can remain part of everyday life. It is often visited by students of architecture and local history.',
    quiz: [
      { question: 'What type of buildings are featured in the Pila Historic Ancestral Houses exhibit?', options: ['Traditional homes preserved as part of the town’s heritage', 'Modern airport terminals', 'Volcanic research laboratories', 'Harvest storage silos'], answerIndex: 0, explanation: 'Pila’s ancestral houses preserve historic architecture and domestic spaces.' },
      { question: 'What is the role of Pila Town Plaza?', options: ['A private family bedroom', 'A shared civic space for gatherings and community events', 'A volcanic crater', 'A botanical research greenhouse'], answerIndex: 1, explanation: 'The town plaza is a shared public space where residents gather.' },
      { question: 'To whom is Pila’s featured church dedicated?', options: ['Saint Martin of Tours', 'San Isidro Labrador', 'San Antonio de Padua', 'Saint Michael the Archangel'], answerIndex: 2, explanation: 'The church is named San Antonio de Padua Church.' },
      { question: 'What kind of work took place in the Old Pila Municipal Hall?', options: ['Church choir performances', 'Camera repairs', 'Harvest decorating', 'Local government and public services'], answerIndex: 3, explanation: 'A municipal hall houses local government offices and public services.' },
      { question: 'What are Capiz-shell window panels known for doing?', options: ['Diffusing daylight while allowing ventilation', 'Carrying water across a river', 'Displaying archaeological artifacts', 'Blocking all airflow'], answerIndex: 0, explanation: 'Capiz windows diffuse light and help ventilate traditional houses.' },
      { question: 'What does a heritage-house wooden staircase connect?', options: ['The plaza with the church', 'The ground floor and upper living spaces', 'The crater lake and the volcano', 'The choir loft and the altar'], answerIndex: 1, explanation: 'A staircase connects the ground floor with upper rooms.' },
      { question: 'What is one function of ventanillas below traditional house windows?', options: ['To store food', 'To support a church bell', 'To allow air to circulate', 'To collect volcanic rocks'], answerIndex: 2, explanation: 'Ventanillas are small openings that allow air to circulate.' },
      { question: 'What do the carvings in Pila’s antique wooden ceilings highlight?', options: ['Modern metalwork', 'Agricultural products', 'Church music', 'Traditional wood craftsmanship'], answerIndex: 3, explanation: 'The carvings show the workmanship and decorative style of heritage interiors.' },
      { question: 'What is the purpose of the Spanish-Era Bridge exhibit?', options: ['To show historic infrastructure that connected communities', 'To explain how to make a pipe organ', 'To display a family’s dining room', 'To mark the top of Mount Makiling'], answerIndex: 0, explanation: 'Historic bridges preserve evidence of earlier infrastructure and transportation.' },
      { question: 'What do archaeological artifacts in the Pila Museum represent?', options: ['Only modern souvenirs', 'Material remains from past communities', 'Volcanic gases', 'Decorations made from kiping'], answerIndex: 1, explanation: 'Archaeological artifacts are material remains from past communities.' },
    ],
  },
  {
    name: 'Mount Makiling Forest Reserve',
    category: 'Nature',
    province: 'Laguna',
    address: 'Los Baños, Laguna',
    imageUri: MAKILING_FOREST_RESERVE_IMAGE_URI,
    latitude: 14.1478,
    longitude: 121.2437,
    description:
      'A forest reserve on the slopes of Mount Makiling, known for its biodiversity, trails, and the legend of the diwata Maria Makiling.',
    history:
      'The reserve is managed by the University of the Philippines Los Baños and serves as a living classroom for forestry and environmental science. Local storytellers have long told of Maria Makiling, a mountain spirit who watches over the forest and the people who respect it.',
    significance:
      'Makiling joins science and folklore: it protects native plants and animals while keeping a Filipino legend alive. Students can study ecology and oral tradition in the same place.',
    quiz: [
      { question: 'What does the Mount Makiling Mountain View introduce visitors to?', options: ['The mountain’s forested slopes and surrounding landscape', 'The streets of old Pila', 'The altar of Antipolo Cathedral', 'The houses decorated for Pahiyas'], answerIndex: 0, explanation: 'The viewpoint shows Mount Makiling’s forested slopes and surrounding landscape.' },
      { question: 'What is a purpose of the Makiling Botanic Gardens?', options: ['To display cameras from Taal', 'To support plant study and conservation', 'To store historic swords', 'To serve as a town hall'], answerIndex: 1, explanation: 'The gardens support the study, conservation, and display of plants.' },
      { question: 'What does the Mariang Makiling Hiking Trail provide access to?', options: ['A historic church nave', 'A museum of cameras', 'The mountain environment for hikers', 'The Taal Volcano Main Crater Lake'], answerIndex: 2, explanation: 'The trail lets hikers explore Mount Makiling on foot.' },
      { question: 'Which part of the forest is formed by the crowns of trees?', options: ['The watershed', 'The trail marker', 'The forest floor', 'The forest canopy'], answerIndex: 3, explanation: 'The canopy is the upper layer formed by tree crowns.' },
      { question: 'What does the Philippine Forest Wildlife exhibit emphasize?', options: ['The importance of healthy habitat for native species', 'The history of Spanish-era bridges', 'The making of traditional longganisa', 'The construction of ancestral houses'], answerIndex: 0, explanation: 'Forest wildlife depends on healthy habitat for food, shelter, and breeding.' },
      { question: 'How does Rafflesia obtain nutrients?', options: ['It grows as a tall tree with deep roots', 'It is a parasitic plant that depends on a host vine', 'It feeds on volcanic rocks', 'It lives entirely underwater'], answerIndex: 1, explanation: 'Rafflesia is a parasitic plant that depends on a host vine.' },
      { question: 'What is Mount Makiling Peak II in the tour?', options: ['A church bell tower', 'A historic town plaza', 'A summit area along the mountain hiking routes', 'A crater lake'], answerIndex: 2, explanation: 'Peak II is one of the mountain’s summit areas and a hiking destination.' },
      { question: 'Why are forest waterways and natural streams important?', options: ['They decorate heritage-house ceilings', 'They are used to make kiping', 'They form the cathedral’s nave', 'They provide habitat and help sustain the watershed'], answerIndex: 3, explanation: 'Streams provide aquatic habitat and connect the mountain watershed.' },
    ],
  },
  {
    name: 'Taal Heritage Town',
    category: 'Cultural',
    province: 'Batangas',
    address: 'Taal, Batangas',
    imageUri: TAAL_HERITAGE_TOWN_IMAGE_URI,
    latitude: 13.8797,
    longitude: 120.9236,
    description:
      'A town of stone streets and ancestral houses, home to the Basilica of St. Martin of Tours, one of the largest Catholic churches in Asia.',
    history:
      'After a major eruption of Taal Volcano in 1754, the town was moved to its present location. The basilica was rebuilt in the 19th century, and the surrounding streets filled with grand houses. Taal is also known for balisong knives and fine embroidery.',
    significance:
      'Taal preserves colonial architecture and local crafts in one walkable place. It is also tied to the story of the first Philippine flag through Marcela Agoncillo.',
    quiz: [
      { question: 'What do Taal’s heritage houses preserve?', options: ['Historic architecture and domestic spaces', 'Volcanic gases', 'Modern airport terminals', 'Farm machinery only'], answerIndex: 0, explanation: 'The ancestral houses preserve the town’s architecture and domestic spaces.' },
      { question: 'Which saint is the Minor Basilica of Taal dedicated to?', options: ['Saint Michael the Archangel', 'Saint Martin of Tours', 'San Isidro Labrador', 'San Antonio de Padua'], answerIndex: 1, explanation: 'Taal Basilica is dedicated to Saint Martin of Tours.' },
      { question: 'What kind of place is Casa Villavicencio?', options: ['A volcanic crater', 'A municipal bridge', 'A preserved ancestral residence', 'A botanical garden'], answerIndex: 2, explanation: 'Casa Villavicencio is a preserved ancestral residence.' },
      { question: 'Who gave the Villavicencio Wedding Gift House to Gliceria Marella?', options: ['Marcela Agoncillo', 'Don Leon Apacible', 'Francisco Mercado', 'Eulalio Villavicencio'], answerIndex: 3, explanation: 'The house is associated with the wedding gift from Eulalio Villavicencio to Gliceria Marella.' },
      { question: 'What historical contribution is commemorated at the Marcela Agoncillo Museum?', options: ['Her role in sewing the first Philippine flag', 'Her design of the Pila town plaza', 'Her discovery of Vulcan Point', 'Her founding of the Botanic Gardens'], answerIndex: 0, explanation: 'Marcela Agoncillo helped sew the first Philippine flag.' },
      { question: 'Which family is associated with the Don Leon and Galicano Apacible Museum?', options: ['The Rizal family', 'The Apacible family', 'The Mercado family', 'The Aguinaldo family'], answerIndex: 1, explanation: 'The museum is associated with Don Leon and Galicano Apacible.' },
      { question: 'What does Galleria Taal Camera Museum display?', options: ['Traditional kitchen utensils', 'Agricultural products', 'Historical cameras and photography objects', 'Wooden bridges'], answerIndex: 2, explanation: 'The museum introduces historical cameras and photographic equipment.' },
      { question: 'What does the Escuela Pia exhibit reflect?', options: ['Volcanic monitoring', 'Weaving buri hats', 'A family dining room', 'The history of education in Taal'], answerIndex: 3, explanation: 'Escuela Pia is a historic school building associated with education.' },
      { question: 'What role did Casa Real de Taal serve in the Spanish era?', options: ['A government and administrative center', 'A camera museum', 'A forest trail shelter', 'A harvest display house'], answerIndex: 0, explanation: 'A casa real served as a Spanish-era government building and administrative center.' },
    ],
  },
  {
    name: 'Taal Volcano',
    category: 'Nature',
    province: 'Batangas',
    address: 'Taal Lake, Batangas',
    imageUri: TAAL_VOLCANO_IMAGE_URI,
    latitude: 14.0021,
    longitude: 120.9934,
    description:
      'A small but active volcano on an island in the middle of Taal Lake, with a crater and surrounding lake that make one of the most recognized views in the region.',
    history:
      'Taal has erupted many times, including the 1754 eruption that moved nearby towns. A major eruption in January 2020 forced thousands of residents to evacuate. The Philippine Institute of Volcanology and Seismology (PHIVOLCS) monitors it closely.',
    significance:
      'Taal teaches how communities live with natural hazards. Its history shapes settlement, farming, and disaster preparedness around the lake.',
    quiz: [
      { question: 'What does the panoramic view of Taal Volcano show?', options: ['The volcano within its surrounding lake and landscape', 'A street festival in Lucban', 'The nave of Antipolo Cathedral', 'An ancestral house in Pila'], answerIndex: 0, explanation: 'The panoramic view shows Taal Volcano in its lake setting.' },
      { question: 'Which body of water surrounds Volcano Island?', options: ['Laguna de Bay', 'Taal Lake', 'Manila Bay', 'Lake Lanao'], answerIndex: 1, explanation: 'Volcano Island is located within Taal Lake.' },
      { question: 'Where is Volcano Island located?', options: ['In the middle of Manila Bay', 'On the coast of Quezon', 'Within Taal Lake', 'At the summit of Mount Makiling'], answerIndex: 2, explanation: 'Volcano Island sits within Taal Lake.' },
      { question: 'What is Binintiang Malaki?', options: ['A historic school building', 'A church nave', 'A forest stream', 'A prominent volcanic cone on Volcano Island'], answerIndex: 3, explanation: 'Binintiang Malaki is a recognizable volcanic cone on Volcano Island.' },
      { question: 'Where is the Main Crater Lake located?', options: ['Within the volcano’s main crater', 'Inside Casa Villavicencio', 'At the center of Pila Town Plaza', 'Under the Makiling forest canopy'], answerIndex: 0, explanation: 'The Main Crater Lake occupies the volcano’s main crater.' },
      { question: 'What is Vulcan Point?', options: ['A historic bridge', 'A small volcanic island within Main Crater Lake', 'A church altar', 'A forest hiking trail'], answerIndex: 1, explanation: 'Vulcan Point is a small island within Main Crater Lake.' },
      { question: 'What processes help shape Taal’s volcanic mountain landscape?', options: ['Weaving and carving', 'Church construction only', 'Eruptions and erosion', 'Festival decorations'], answerIndex: 2, explanation: 'Eruptions and erosion shape volcanic slopes and ridges over time.' },
      { question: 'How can steam and volcanic gases reach the surface?', options: ['Through Capiz windows', 'Through the town plaza', 'Through a church choir loft', 'Through vents and fumaroles'], answerIndex: 3, explanation: 'Steam and gases can escape through volcanic vents and fumaroles.' },
      { question: 'What happened during the major Taal Volcano eruption in January 2020?', options: ['Ash was sent high into the atmosphere and nearby communities evacuated', 'The volcano became a heritage school', 'A new town plaza was built', 'The Pahiyas Festival moved to Batangas'], answerIndex: 0, explanation: 'The 2020 eruption produced an ash column and prompted evacuations.' },
      { question: 'How do volcanic rocks form?', options: ['When wood is carved', 'When magma or ash cools and hardens', 'When Capiz shells are woven', 'When water freezes in a lake'], answerIndex: 1, explanation: 'Volcanic rocks form when magma or ash cools and hardens.' },
    ],
  },
  {
    name: 'Lucban and the Pahiyas Festival',
    category: 'Cultural',
    province: 'Quezon',
    address: 'Lucban, Quezon',
    imageUri: PAHIYAS_FESTIVAL_IMAGE_URI,
    latitude: 14.1142,
    longitude: 121.5556,
    description:
      'A hillside town famous for the Pahiyas Festival, when house fronts are decorated with colorful rice wafers called kiping, fruits, and vegetables.',
    history:
      'The festival began as a thanksgiving for the harvest and honors San Isidro Labrador, the patron saint of farmers. Each year on May 15, families compete to make the most creative decorations for their homes.',
    significance:
      'Pahiyas shows how faith, farming, and craft meet in Filipino community life. Lucban is also known for its longganisa and pancit habhab.',
    quiz: [
      { question: 'What is a signature sight of the Pahiyas Festival in Lucban?', options: ['Colorfully decorated house fronts', 'Volcanic craters inside a church', 'A row of camera studios', 'A forest canopy above the plaza'], answerIndex: 0, explanation: 'Decorated homes are a signature sight of the Pahiyas Festival.' },
      { question: 'What are kiping decorations made from?', options: ['Woven buri palm', 'Colorful leaf-shaped rice wafers', 'Carved volcanic rock', 'Capiz window panels'], answerIndex: 1, explanation: 'Kiping are colorful, leaf-shaped rice wafers used as decorations.' },
      { question: 'What do the agricultural products displays celebrate?', options: ['The history of photography', 'The construction of a basilica', 'The harvest and farming community', 'The founding of a forest reserve'], answerIndex: 2, explanation: 'Fruits, vegetables, and farm products celebrate the harvest.' },
      { question: 'What do flowers add to Pahiyas Festival decorations?', options: ['A way to store medicines', 'A roof for the town hall', 'A map of the Philippines', 'Natural color and texture'], answerIndex: 3, explanation: 'Flowers add color and texture to festival displays.' },
      { question: 'Who is San Isidro Labrador, honored during Pahiyas?', options: ['The patron saint of farmers', 'The patron saint of camera makers', 'A Spanish-era governor', 'A volcanic island'], answerIndex: 0, explanation: 'San Isidro Labrador is honored as the patron saint of farmers.' },
      { question: 'To whom is Lucban’s featured Minor Basilica dedicated?', options: ['Saint Martin of Tours', 'Saint Michael the Archangel', 'San Antonio de Padua', 'Saint Joseph'], answerIndex: 1, explanation: 'The Lucban basilica is dedicated to Saint Michael the Archangel.' },
      { question: 'What farm animal appears in the traditional harvest decorations?', options: ['Carabao', 'Camel', 'Reindeer', 'Llama'], answerIndex: 0, explanation: 'The decorations feature the carabao, an animal associated with farm work.' },
      { question: 'What is buri?', options: ['A kind of volcanic stone', 'A musical instrument', 'A palm used in weaving', 'A type of rice noodle'], answerIndex: 2, explanation: 'Buri is a palm used to make woven hats and other crafts.' },
      { question: 'How is Pancit Habhab traditionally eaten?', options: ['With a silver fork only', 'From a church plate', 'Wrapped in Capiz shells', 'Directly from a banana leaf, without utensils'], answerIndex: 3, explanation: 'Pancit Habhab is traditionally eaten directly from a banana leaf without utensils.' },
      { question: 'What is a characteristic flavor of Lucban Longganisa?', options: ['Garlicky seasoning', 'Sweet chocolate', 'Mint and citrus', 'Smoked seaweed'], answerIndex: 0, explanation: 'Lucban Longganisa is known for its garlicky flavor.' },
    ],
  },
  {
    name: 'Antipolo Cathedral',
    category: 'Religious',
    province: 'Rizal',
    address: 'Antipolo, Rizal',
    imageUri: ANTIPOLO_COVER_IMAGE_URI,
    latitude: 14.5864,
    longitude: 121.1761,
    description:
      'The shrine of Our Lady of Peace and Good Voyage, a major pilgrimage destination for Catholics from across the country.',
    history:
      'The venerated image was brought from Mexico in 1626 and has been associated with safe travel ever since. Pilgrims traditionally walk to Antipolo, especially during the month of May.',
    significance:
      'The cathedral is a living center of devotion and tradition. Pilgrimage season shows how faith shapes local culture, food, and community life.',
    quiz: [
      { question: 'What is the main altar and sanctuary at Antipolo Cathedral?', options: ['The central liturgical space for worship and Mass', 'A museum of cameras', 'A town hall office', 'A forest lookout'], answerIndex: 0, explanation: 'The altar is the focal point of the cathedral’s principal worship area.' },
      { question: 'Which image is venerated at Antipolo Cathedral?', options: ['The Black Nazarene', 'Our Lady of Peace and Good Voyage', 'San Isidro Labrador', 'Saint Martin of Tours'], answerIndex: 1, explanation: 'The cathedral is the shrine of Our Lady of Peace and Good Voyage.' },
      { question: 'What is the nave of a cathedral?', options: ['A small opening below a window', 'A room for storing harvest crops', 'The central area where the congregation gathers', 'A tower used to observe volcanoes'], answerIndex: 2, explanation: 'The nave is the central part of a church where the congregation gathers.' },
      { question: 'What effect do the cathedral’s stained-glass windows create?', options: ['They carry water into the church', 'They store books for the choir', 'They block all daylight', 'They filter daylight into colored light and imagery'], answerIndex: 3, explanation: 'Stained glass filters daylight and can display religious imagery.' },
      { question: 'What does the cathedral dome do to the interior space?', options: ['Creates a high, open interior and draws the eye upward', 'Turns the nave into a town plaza', 'Provides storage for farming tools', 'Serves as a bridge over a stream'], answerIndex: 0, explanation: 'A dome creates a high, open space and draws attention upward.' },
      { question: 'How does the Cathedral Pipe Organ produce music?', options: ['By striking metal bells with hammers', 'By sending air through pipes', 'By turning a water wheel', 'By vibrating Capiz shells'], answerIndex: 1, explanation: 'A pipe organ produces sound as air passes through pipes.' },
      { question: 'What does the Black Nazarene statue depict?', options: ['Saint Michael holding a shield', 'A farmer at harvest', 'Jesus carrying the cross', 'A pilgrim walking to Antipolo'], answerIndex: 2, explanation: 'The Black Nazarene depicts Jesus carrying the cross.' },
      { question: 'What event does the Santo Entierro image recall?', options: ['The harvest of Lucban', 'The birth of José Rizal', 'The building of the basilica', 'The burial of Jesus after the crucifixion'], answerIndex: 3, explanation: 'Santo Entierro depicts the body of Jesus after the crucifixion.' },
      { question: 'What is bas-relief?', options: ['Sculpture that projects slightly from a flat background', 'A type of woven rice decoration', 'A camera used in the 19th century', 'A small lake inside a crater'], answerIndex: 0, explanation: 'Bas-relief is sculpted imagery that projects slightly from a flat surface.' },
      { question: 'What is the purpose of the cathedral’s choir loft?', options: ['To display agricultural products', 'To provide an elevated area for singers and musicians', 'To house the main altar', 'To store volcanic samples'], answerIndex: 1, explanation: 'A choir loft is an elevated area used by singers and musicians during services.' },
    ],
  },
];

// Question text from the previous built-in quizzes. These sets allow upgrades to
// replace untouched defaults without overwriting a quiz someone has edited.
export const LEGACY_QUIZ_QUESTIONS = {
  'Aguinaldo Shrine': [
    [
      'On what date was Philippine independence proclaimed at the Aguinaldo Shrine?',
      'In which province is the Aguinaldo Shrine located?',
      'Who proclaimed independence from this house?',
    ],
    [
      'On what date was Philippine independence proclaimed at the Aguinaldo Shrine?',
      'In which Cavite town is the shrine located?',
      'Who proclaimed independence from the shrine’s balcony?',
      'Which tune was first played during the proclamation?',
      'Who composed the music of the national anthem?',
    ],
  ],
  'Rizal Shrine, Calamba': [
    [
      'In which town was José Rizal born?',
      'Which of these novels did Rizal write?',
      'In what year was Rizal born?',
    ],
    [
      'When was José Rizal born?',
      'Which Laguna town is his birthplace?',
      'Which novels did Rizal write?',
      'What was Rizal’s profession?',
      'Where was Rizal executed in 1896?',
    ],
  ],
  'Pila Historic Town Center': [
    [
      'In which province is Pila located?',
      'Which period of Philippine history do Pila’s old buildings mostly reflect?',
      'What anchors the town plaza?',
    ],
    [
      'In which province is Pila located?',
      'Who is the patron saint of Pila’s church?',
      'What does “bahay na bato” mean?',
      'What is the upper floor of a bahay na bato usually made of?',
      'What stood at the center of Spanish-era towns?',
    ],
  ],
  'Mount Makiling Forest Reserve': [
    [
      'Who is the legendary guardian of Mount Makiling?',
      'Which university manages the Makiling Forest Reserve?',
      'In which province is Mount Makiling?',
    ],
    [
      'In which province is Mount Makiling mainly located?',
      'According to legend, who guards the mountain?',
      'Which university manages the forest reserve?',
      'What kind of mountain is Mount Makiling?',
      'Which feature is a popular attraction in the reserve?',
    ],
  ],
  'Taal Heritage Town': [
    [
      'The basilica in Taal is dedicated to which saint?',
      'Taal is well known for which local craft?',
      'Marcela Agoncillo, linked to sewing the first Philippine flag, came from which town?',
    ],
    [
      'In which province is Taal located?',
      'The Taal Basilica honors which saint?',
      'Which traditional blade is Taal famous for?',
      'Which cured meat is a Taal specialty?',
      'Who sewed the first Philippine flag and was born in Taal?',
    ],
  ],
  'Taal Volcano': [
    [
      'Taal Volcano sits in the middle of which body of water?',
      'Which agency monitors volcanoes in the Philippines?',
      'In which year did the eruption that forced mass evacuations occur?',
    ],
    [
      'Taal Volcano sits in the middle of which body of water?',
      'On which island is the volcano located?',
      'Which agency monitors Philippine volcanoes?',
      'In which year did Taal have a major eruption near Tagaytay?',
      'Taal is often called one of the world’s ___ active volcanoes.',
    ],
  ],
  'Lucban and the Pahiyas Festival': [
    [
      'On what date is the Pahiyas Festival celebrated?',
      'What colorful rice wafer decorates the houses?',
      'Whom does the festival honor?',
    ],
    [
      'In which month is the Pahiyas Festival held?',
      'Which saint does the festival honor?',
      'What are the colorful rice wafers that decorate the houses called?',
      'Which noodle dish is Lucban famous for?',
      'Lucban belongs to which province?',
    ],
  ],
  'Antipolo Cathedral': [
    [
      'Which image is venerated at Antipolo Cathedral?',
      'In which province is Antipolo?',
      'Which month is the traditional main pilgrimage season?',
    ],
    [
      'Which image is venerated at Antipolo Cathedral?',
      'In which province is Antipolo located?',
      'What is the pilgrims’ walk to Antipolo called?',
      'From which country did the image arrive in 1626?',
      'Which treat is Antipolo famous for?',
    ],
  ],
};
