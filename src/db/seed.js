import { AGUINALDO_IMAGE_URI, RIZAL_SHRINE_IMAGE_URI } from '../utils/destinationImages';

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
      { question: 'On what date was Philippine independence proclaimed at the Aguinaldo Shrine?', options: ['June 12, 1898', 'July 4, 1946', 'December 30, 1896', 'August 23, 1896'], answerIndex: 0, explanation: 'Independence was proclaimed on June 12, 1898.' },
      { question: 'In which Cavite town is the shrine located?', options: ['Imus', 'Kawit', 'Silang', 'Naic'], answerIndex: 1, explanation: 'The shrine is in Kawit, Cavite.' },
      { question: 'Who proclaimed independence from the shrine’s balcony?', options: ['Andres Bonifacio', 'Apolinario Mabini', 'Emilio Aguinaldo', 'Antonio Luna'], answerIndex: 2, explanation: 'Emilio Aguinaldo proclaimed independence from the balcony.' },
      { question: 'Which tune was first played during the proclamation?', options: ['Bayan Ko', 'Dahil Sa Iyo', 'Sampaguita', 'Marcha Filipina Magdalo'], answerIndex: 3, explanation: 'Marcha Filipina Magdalo, later the national anthem, was played.' },
      { question: 'Who composed the music of the national anthem?', options: ['Julian Felipe', 'José Palma', 'Nicanor Abelardo', 'Francisco Santiago'], answerIndex: 0, explanation: 'Julian Felipe composed the music.' },
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
      { question: 'When was José Rizal born?', options: ['December 30, 1861', 'June 19, 1861', 'June 12, 1861', 'June 19, 1896'], answerIndex: 1, explanation: 'José Rizal was born on June 19, 1861.' },
      { question: 'Which Laguna town is his birthplace?', options: ['Calamba', 'Pila', 'Los Baños', 'Liliw'], answerIndex: 0, explanation: 'He was born in Calamba, Laguna.' },
      { question: 'Which novels did Rizal write?', options: ['Florante at Laura', 'Ibong Adarna', 'Noli Me Tangere and El Filibusterismo', 'Banaag at Sikat'], answerIndex: 2, explanation: 'He wrote Noli Me Tangere and El Filibusterismo.' },
      { question: 'What was Rizal’s profession?', options: ['Architect', 'Ophthalmologist', 'Lawyer', 'Engineer'], answerIndex: 1, explanation: 'Rizal was an ophthalmologist.' },
      { question: 'Where was Rizal executed in 1896?', options: ['Bagumbayan', 'Corregidor', 'Fort Bonifacio', 'Cavite Beach'], answerIndex: 0, explanation: 'He was executed at Bagumbayan, now Rizal Park.' },
    ],
  },
  {
    name: 'Pila Historic Town Center',
    category: 'Cultural',
    province: 'Laguna',
    address: 'Pila, Laguna',
    latitude: 14.2326,
    longitude: 121.3646,
    description:
      'A well-preserved Spanish colonial town center arranged around a plaza, with a church, a municipal hall, and ancestral houses that are still lived in.',
    history:
      'Pila grew as a Spanish-era town in Laguna, with its main buildings clustered around the plaza as colonial town planning required. The Church of San Antonio de Padua anchors the plaza, and several old houses have been restored in recent decades.',
    significance:
      'Pila shows how a Spanish colonial town was organized and how heritage buildings can remain part of everyday life. It is often visited by students of architecture and local history.',
    quiz: [
      { question: 'In which province is Pila located?', options: ['Laguna', 'Batangas', 'Quezon', 'Cavite'], answerIndex: 0, explanation: 'Pila is a town in Laguna.' },
      { question: 'Who is the patron saint of Pila’s church?', options: ['San Isidro', 'San Antonio de Padua', 'San Pedro', 'San Roque'], answerIndex: 1, explanation: 'The church is dedicated to San Antonio de Padua.' },
      { question: 'What does “bahay na bato” mean?', options: ['House of wood', 'House on stilts', 'House of stone', 'House of bamboo'], answerIndex: 2, explanation: 'Bahay na bato means house of stone.' },
      { question: 'What is the upper floor of a bahay na bato usually made of?', options: ['Concrete', 'Glass', 'Steel', 'Wood'], answerIndex: 3, explanation: 'The upper floor was usually wood.' },
      { question: 'What stood at the center of Spanish-era towns?', options: ['Lighthouse', 'Factory', 'Plaza and church', 'Harbor'], answerIndex: 2, explanation: 'Spanish-era towns were centered on the plaza and church.' },
    ],
  },
  {
    name: 'Mount Makiling Forest Reserve',
    category: 'Nature',
    province: 'Laguna',
    address: 'Los Baños, Laguna',
    latitude: 14.1478,
    longitude: 121.2437,
    description:
      'A forest reserve on the slopes of Mount Makiling, known for its biodiversity, trails, and the legend of the diwata Maria Makiling.',
    history:
      'The reserve is managed by the University of the Philippines Los Baños and serves as a living classroom for forestry and environmental science. Local storytellers have long told of Maria Makiling, a mountain spirit who watches over the forest and the people who respect it.',
    significance:
      'Makiling joins science and folklore: it protects native plants and animals while keeping a Filipino legend alive. Students can study ecology and oral tradition in the same place.',
    quiz: [
      { question: 'In which province is Mount Makiling mainly located?', options: ['Cavite', 'Laguna', 'Rizal', 'Bataan'], answerIndex: 1, explanation: 'Mount Makiling is mainly in Laguna.' },
      { question: 'According to legend, who guards the mountain?', options: ['Maria Makiling', 'Maria Clara', 'Mariang Sinukuan', 'Malakas'], answerIndex: 0, explanation: 'Maria Makiling is said to guard the mountain.' },
      { question: 'Which university manages the forest reserve?', options: ['UP Diliman', 'UP Los Baños', 'Ateneo', 'UST'], answerIndex: 1, explanation: 'UP Los Baños manages the reserve.' },
      { question: 'What kind of mountain is Mount Makiling?', options: ['Limestone hill', 'Sand dune', 'Potentially active volcano', 'Coral atoll'], answerIndex: 2, explanation: 'Mount Makiling is a potentially active volcano.' },
      { question: 'Which feature is a popular attraction in the reserve?', options: ['Chocolate Hills', 'Rice terraces', 'Underground river', 'Mudspring'], answerIndex: 3, explanation: 'The Mudspring is a popular stop in the reserve.' },
    ],
  },
  {
    name: 'Taal Heritage Town',
    category: 'Cultural',
    province: 'Batangas',
    address: 'Taal, Batangas',
    latitude: 13.8797,
    longitude: 120.9236,
    description:
      'A town of stone streets and ancestral houses, home to the Basilica of St. Martin of Tours, one of the largest Catholic churches in Asia.',
    history:
      'After a major eruption of Taal Volcano in 1754, the town was moved to its present location. The basilica was rebuilt in the 19th century, and the surrounding streets filled with grand houses. Taal is also known for balisong knives and fine embroidery.',
    significance:
      'Taal preserves colonial architecture and local crafts in one walkable place. It is also tied to the story of the first Philippine flag through Marcela Agoncillo.',
    quiz: [
      { question: 'In which province is Taal located?', options: ['Laguna', 'Batangas', 'Cavite', 'Rizal'], answerIndex: 1, explanation: 'Taal is in Batangas.' },
      { question: 'The Taal Basilica honors which saint?', options: ['St. Anthony', 'St. Peter', 'St. Martin of Tours', 'St. Joseph'], answerIndex: 2, explanation: 'The basilica honors St. Martin of Tours.' },
      { question: 'Which traditional blade is Taal famous for?', options: ['Bolo', 'Kris', 'Kampilan', 'Balisong'], answerIndex: 3, explanation: 'Taal is famous for the balisong.' },
      { question: 'Which cured meat is a Taal specialty?', options: ['Longganisa Lucban', 'Tapang Taal', 'Tocino', 'Tuyo'], answerIndex: 1, explanation: 'Tapang Taal is a local specialty.' },
      { question: 'Who sewed the first Philippine flag and was born in Taal?', options: ['Marcela Agoncillo', 'Gabriela Silang', 'Melchora Aquino', 'Teresa Magbanua'], answerIndex: 0, explanation: 'Marcela Agoncillo was born in Taal and sewed the first flag.' },
    ],
  },
  {
    name: 'Taal Volcano',
    category: 'Nature',
    province: 'Batangas',
    address: 'Taal Lake, Batangas',
    latitude: 14.0021,
    longitude: 120.9934,
    description:
      'A small but active volcano on an island in the middle of Taal Lake, with a crater and surrounding lake that make one of the most recognized views in the region.',
    history:
      'Taal has erupted many times, including the 1754 eruption that moved nearby towns. A major eruption in January 2020 forced thousands of residents to evacuate. The Philippine Institute of Volcanology and Seismology (PHIVOLCS) monitors it closely.',
    significance:
      'Taal teaches how communities live with natural hazards. Its history shapes settlement, farming, and disaster preparedness around the lake.',
    quiz: [
      { question: 'Taal Volcano sits in the middle of which body of water?', options: ['Laguna de Bay', 'Taal Lake', 'Manila Bay', 'Lake Lanao'], answerIndex: 1, explanation: 'The volcano sits in Taal Lake.' },
      { question: 'On which island is the volcano located?', options: ['Corregidor', 'Fortune Island', 'Volcano Island', 'Verde Island'], answerIndex: 2, explanation: 'The cone is on Volcano Island.' },
      { question: 'Which agency monitors Philippine volcanoes?', options: ['PAGASA', 'PHIVOLCS', 'NDRRMC', 'DOST-ASTI'], answerIndex: 1, explanation: 'PHIVOLCS monitors Philippine volcanoes.' },
      { question: 'In which year did Taal have a major eruption near Tagaytay?', options: ['2020', '2010', '2015', '2005'], answerIndex: 0, explanation: 'A major eruption happened in 2020.' },
      { question: 'Taal is often called one of the world’s ___ active volcanoes.', options: ['tallest', 'smallest', 'oldest', 'widest'], answerIndex: 1, explanation: 'Taal is often called one of the world’s smallest active volcanoes.' },
    ],
  },
  {
    name: 'Lucban and the Pahiyas Festival',
    category: 'Cultural',
    province: 'Quezon',
    address: 'Lucban, Quezon',
    latitude: 14.1142,
    longitude: 121.5556,
    description:
      'A hillside town famous for the Pahiyas Festival, when house fronts are decorated with colorful rice wafers called kiping, fruits, and vegetables.',
    history:
      'The festival began as a thanksgiving for the harvest and honors San Isidro Labrador, the patron saint of farmers. Each year on May 15, families compete to make the most creative decorations for their homes.',
    significance:
      'Pahiyas shows how faith, farming, and craft meet in Filipino community life. Lucban is also known for its longganisa and pancit habhab.',
    quiz: [
      { question: 'In which month is the Pahiyas Festival held?', options: ['April', 'May', 'June', 'July'], answerIndex: 1, explanation: 'Pahiyas is held in May.' },
      { question: 'Which saint does the festival honor?', options: ['San Isidro Labrador', 'Santo Niño', 'San Pedro', 'San Jose'], answerIndex: 0, explanation: 'The festival honors San Isidro Labrador.' },
      { question: 'What are the colorful rice wafers that decorate the houses called?', options: ['Puto', 'Kiping', 'Bibingka', 'Turon'], answerIndex: 1, explanation: 'The rice wafers are called kiping.' },
      { question: 'Which noodle dish is Lucban famous for?', options: ['Pancit Canton', 'Pancit Malabon', 'Pancit Habhab', 'Pancit Palabok'], answerIndex: 2, explanation: 'Lucban is famous for pancit habhab.' },
      { question: 'Lucban belongs to which province?', options: ['Batangas', 'Laguna', 'Cavite', 'Quezon'], answerIndex: 3, explanation: 'Lucban is in Quezon.' },
    ],
  },
  {
    name: 'Antipolo Cathedral',
    category: 'Religious',
    province: 'Rizal',
    address: 'Antipolo, Rizal',
    latitude: 14.5864,
    longitude: 121.1761,
    description:
      'The shrine of Our Lady of Peace and Good Voyage, a major pilgrimage destination for Catholics from across the country.',
    history:
      'The venerated image was brought from Mexico in 1626 and has been associated with safe travel ever since. Pilgrims traditionally walk to Antipolo, especially during the month of May.',
    significance:
      'The cathedral is a living center of devotion and tradition. Pilgrimage season shows how faith shapes local culture, food, and community life.',
    quiz: [
      { question: 'Which image is venerated at Antipolo Cathedral?', options: ['Black Nazarene', 'Our Lady of Peace and Good Voyage', 'Santo Niño de Cebu', 'Our Lady of Manaoag'], answerIndex: 1, explanation: 'The cathedral venerates Our Lady of Peace and Good Voyage.' },
      { question: 'In which province is Antipolo located?', options: ['Laguna', 'Cavite', 'Rizal', 'Quezon'], answerIndex: 2, explanation: 'Antipolo is in Rizal.' },
      { question: 'What is the pilgrims’ walk to Antipolo called?', options: ['Simbang Gabi', 'Salubong', 'Panata', 'Alay Lakad'], answerIndex: 3, explanation: 'The pilgrimage walk is called Alay Lakad.' },
      { question: 'From which country did the image arrive in 1626?', options: ['Mexico', 'Spain', 'Portugal', 'China'], answerIndex: 0, explanation: 'The image arrived from Mexico in 1626.' },
      { question: 'Which treat is Antipolo famous for?', options: ['Buko pie', 'Suman and kasoy', 'Pastillas', 'Lambanog'], answerIndex: 1, explanation: 'Antipolo is famous for suman and kasoy.' },
    ],
  },
];

// Question text from the previous 3-item starter quizzes. Used once to swap those
// records for the 5-question set without touching a quiz someone has edited.
export const LEGACY_QUIZ_QUESTIONS = {
  'Aguinaldo Shrine': [
    'On what date was Philippine independence proclaimed at the Aguinaldo Shrine?',
    'In which province is the Aguinaldo Shrine located?',
    'Who proclaimed independence from this house?',
  ],
  'Rizal Shrine, Calamba': [
    'In which town was José Rizal born?',
    'Which of these novels did Rizal write?',
    'In what year was Rizal born?',
  ],
  'Pila Historic Town Center': [
    'In which province is Pila located?',
    'Which period of Philippine history do Pila’s old buildings mostly reflect?',
    'What anchors the town plaza?',
  ],
  'Mount Makiling Forest Reserve': [
    'Who is the legendary guardian of Mount Makiling?',
    'Which university manages the Makiling Forest Reserve?',
    'In which province is Mount Makiling?',
  ],
  'Taal Heritage Town': [
    'The basilica in Taal is dedicated to which saint?',
    'Taal is well known for which local craft?',
    'Marcela Agoncillo, linked to sewing the first Philippine flag, came from which town?',
  ],
  'Taal Volcano': [
    'Taal Volcano sits in the middle of which body of water?',
    'Which agency monitors volcanoes in the Philippines?',
    'In which year did the eruption that forced mass evacuations occur?',
  ],
  'Lucban and the Pahiyas Festival': [
    'On what date is the Pahiyas Festival celebrated?',
    'What colorful rice wafer decorates the houses?',
    'Whom does the festival honor?',
  ],
  'Antipolo Cathedral': [
    'Which image is venerated at Antipolo Cathedral?',
    'In which province is Antipolo?',
    'Which month is the traditional main pilgrimage season?',
  ],
};
