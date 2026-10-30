// Starter records for the CALABARZON provinces. Photos are intentionally empty:
// add your own through Edit destination so every image is one you may use.
export const SEED_DESTINATIONS = [
  {
    name: 'Aguinaldo Shrine',
    category: 'Historical',
    province: 'Cavite',
    address: 'Kawit, Cavite',
    latitude: 14.445,
    longitude: 120.90694,
    description:
      'The ancestral house of General Emilio Aguinaldo, where Philippine independence was proclaimed on June 12, 1898. Today it is kept as a national shrine and museum.',
    history:
      'Aguinaldo led revolutionary forces against Spain and became the first president of the Philippines. From the window of his family home in Kawit, he declared independence as the Philippine flag was unfurled and the Marcha Nacional Filipina was played. The house has since been preserved with personal belongings and memorabilia from the revolution.',
    significance:
      'The shrine marks the birthplace of Philippine independence. It is the focus of Independence Day celebrations every June 12 and reminds visitors of the sacrifices of the revolutionary generation.',
    quiz: [
      { question: 'On what date was Philippine independence proclaimed at the Aguinaldo Shrine?', options: ['June 12, 1898', 'July 4, 1946', 'December 30, 1896', 'August 23, 1896'], answerIndex: 0, explanation: 'Independence was proclaimed on June 12, 1898, which is why Independence Day is celebrated on that date.' },
      { question: 'In which province is the Aguinaldo Shrine located?', options: ['Laguna', 'Cavite', 'Batangas', 'Quezon'], answerIndex: 1, explanation: 'The shrine is in Kawit, Cavite.' },
      { question: 'Who proclaimed independence from this house?', options: ['José Rizal', 'Andrés Bonifacio', 'Emilio Aguinaldo', 'Apolinario Mabini'], answerIndex: 2, explanation: 'Emilio Aguinaldo made the proclamation from his family home.' },
    ],
  },
  {
    name: 'Rizal Shrine, Calamba',
    category: 'Historical',
    province: 'Laguna',
    address: 'Calamba, Laguna',
    description:
      'A replica of the ancestral house where national hero Dr. José Rizal was born on June 19, 1861. The shrine displays family memorabilia and exhibits on his life.',
    history:
      'José Rizal grew up in Calamba in a family of landowners. He became a physician, writer, and reformer, and wrote the novels Noli Me Tangere (1887) and El Filibusterismo (1891). He was executed by Spanish authorities on December 30, 1896.',
    significance:
      'Rizal is the Philippines’ national hero, and his writings helped awaken national consciousness. The shrine lets students connect his ideas to the town and home that shaped him.',
    quiz: [
      { question: 'In which town was José Rizal born?', options: ['Calamba', 'Kawit', 'Lucban', 'Taal'], answerIndex: 0, explanation: 'Rizal was born in Calamba, Laguna.' },
      { question: 'Which of these novels did Rizal write?', options: ['Florante at Laura', 'Noli Me Tangere', 'Banaag at Sikat', 'Ibong Adarna'], answerIndex: 1, explanation: 'Noli Me Tangere was published in 1887.' },
      { question: 'In what year was Rizal born?', options: ['1851', '1861', '1871', '1881'], answerIndex: 1, explanation: 'He was born on June 19, 1861.' },
    ],
  },
  {
    name: 'Pila Historic Town Center',
    category: 'Cultural',
    province: 'Laguna',
    address: 'Pila, Laguna',
    description:
      'A well-preserved Spanish colonial town center arranged around a plaza, with a church, a municipal hall, and ancestral houses that are still lived in.',
    history:
      'Pila grew as a Spanish-era town in Laguna, with its main buildings clustered around the plaza as colonial town planning required. The Church of San Antonio de Padua anchors the plaza, and several old houses have been restored in recent decades.',
    significance:
      'Pila shows how a Spanish colonial town was organized and how heritage buildings can remain part of everyday life. It is often visited by students of architecture and local history.',
    quiz: [
      { question: 'In which province is Pila located?', options: ['Cavite', 'Rizal', 'Laguna', 'Batangas'], answerIndex: 2, explanation: 'Pila is a town in Laguna.' },
      { question: 'Which period of Philippine history do Pila’s old buildings mostly reflect?', options: ['Spanish colonial period', 'Japanese occupation', 'Pre-colonial period', 'Martial law era'], answerIndex: 0, explanation: 'The town plan and heritage houses reflect the Spanish colonial period.' },
      { question: 'What anchors the town plaza?', options: ['A market', 'A church', 'A lighthouse', 'A fort'], answerIndex: 1, explanation: 'Colonial towns were centered on the church and plaza.' },
    ],
  },
  {
    name: 'Mount Makiling Forest Reserve',
    category: 'Nature',
    province: 'Laguna',
    address: 'Los Baños, Laguna',
    description:
      'A forest reserve on the slopes of Mount Makiling, known for its biodiversity, trails, and the legend of the diwata Maria Makiling.',
    history:
      'The reserve is managed by the University of the Philippines Los Baños and serves as a living classroom for forestry and environmental science. Local storytellers have long told of Maria Makiling, a mountain spirit who watches over the forest and the people who respect it.',
    significance:
      'Makiling joins science and folklore: it protects native plants and animals while keeping a Filipino legend alive. Students can study ecology and oral tradition in the same place.',
    quiz: [
      { question: 'Who is the legendary guardian of Mount Makiling?', options: ['Maria Clara', 'Maria Makiling', 'Maria Cristina', 'Maria Sinukuan'], answerIndex: 1, explanation: 'Maria Makiling is the diwata said to protect the mountain.' },
      { question: 'Which university manages the Makiling Forest Reserve?', options: ['UP Los Baños', 'De La Salle University', 'Ateneo de Manila', 'Batangas State University'], answerIndex: 0, explanation: 'UP Los Baños manages the reserve.' },
      { question: 'In which province is Mount Makiling?', options: ['Laguna', 'Quezon', 'Rizal', 'Cavite'], answerIndex: 0, explanation: 'The reserve is in Los Baños, Laguna.' },
    ],
  },
  {
    name: 'Taal Heritage Town',
    category: 'Cultural',
    province: 'Batangas',
    address: 'Taal, Batangas',
    description:
      'A town of stone streets and ancestral houses, home to the Basilica of St. Martin of Tours, one of the largest Catholic churches in Asia.',
    history:
      'After a major eruption of Taal Volcano in 1754, the town was moved to its present location. The basilica was rebuilt in the 19th century, and the surrounding streets filled with grand houses. Taal is also known for balisong knives and fine embroidery.',
    significance:
      'Taal preserves colonial architecture and local crafts in one walkable place. It is also tied to the story of the first Philippine flag through Marcela Agoncillo.',
    quiz: [
      { question: 'The basilica in Taal is dedicated to which saint?', options: ['St. Martin of Tours', 'St. Francis of Assisi', 'St. Anthony of Padua', 'St. Isidore'], answerIndex: 0, explanation: 'It is the Basilica of St. Martin of Tours.' },
      { question: 'Taal is well known for which local craft?', options: ['Kiping', 'Balisong', 'Salakot', 'Banig'], answerIndex: 1, explanation: 'Balisong, the folding knife, is a famous Batangas craft.' },
      { question: 'Marcela Agoncillo, linked to sewing the first Philippine flag, came from which town?', options: ['Taal', 'Pila', 'Antipolo', 'Lucban'], answerIndex: 0, explanation: 'Marcela Agoncillo was from Taal, Batangas.' },
    ],
  },
  {
    name: 'Taal Volcano',
    category: 'Nature',
    province: 'Batangas',
    address: 'Taal Lake, Batangas',
    description:
      'A small but active volcano on an island in the middle of Taal Lake, with a crater and surrounding lake that make one of the most recognized views in the region.',
    history:
      'Taal has erupted many times, including the 1754 eruption that moved nearby towns. A major eruption in January 2020 forced thousands of residents to evacuate. The Philippine Institute of Volcanology and Seismology (PHIVOLCS) monitors it closely.',
    significance:
      'Taal teaches how communities live with natural hazards. Its history shapes settlement, farming, and disaster preparedness around the lake.',
    quiz: [
      { question: 'Taal Volcano sits in the middle of which body of water?', options: ['Laguna de Bay', 'Taal Lake', 'Manila Bay', 'Lake Lanao'], answerIndex: 1, explanation: 'The volcano island is in Taal Lake.' },
      { question: 'Which agency monitors volcanoes in the Philippines?', options: ['PAGASA', 'NDRRMC', 'PHIVOLCS', 'DENR'], answerIndex: 2, explanation: 'PHIVOLCS monitors volcanic and seismic activity.' },
      { question: 'In which year did the eruption that forced mass evacuations occur?', options: ['2010', '2015', '2020', '2023'], answerIndex: 2, explanation: 'Taal erupted in January 2020.' },
    ],
  },
  {
    name: 'Lucban and the Pahiyas Festival',
    category: 'Cultural',
    province: 'Quezon',
    address: 'Lucban, Quezon',
    description:
      'A hillside town famous for the Pahiyas Festival, when house fronts are decorated with colorful rice wafers called kiping, fruits, and vegetables.',
    history:
      'The festival began as a thanksgiving for the harvest and honors San Isidro Labrador, the patron saint of farmers. Each year on May 15, families compete to make the most creative decorations for their homes.',
    significance:
      'Pahiyas shows how faith, farming, and craft meet in Filipino community life. Lucban is also known for its longganisa and pancit habhab.',
    quiz: [
      { question: 'On what date is the Pahiyas Festival celebrated?', options: ['January 9', 'May 15', 'June 12', 'December 25'], answerIndex: 1, explanation: 'Pahiyas is held every May 15.' },
      { question: 'What colorful rice wafer decorates the houses?', options: ['Kiping', 'Bibingka', 'Puto', 'Turon'], answerIndex: 0, explanation: 'Kiping is the leaf-shaped rice wafer that is a symbol of the festival.' },
      { question: 'Whom does the festival honor?', options: ['San Isidro Labrador', 'Santo Niño', 'San Pedro', 'Santa Clara'], answerIndex: 0, explanation: 'Pahiyas honors San Isidro Labrador, patron saint of farmers.' },
    ],
  },
  {
    name: 'Antipolo Cathedral',
    category: 'Religious',
    province: 'Rizal',
    address: 'Antipolo, Rizal',
    description:
      'The shrine of Our Lady of Peace and Good Voyage, a major pilgrimage destination for Catholics from across the country.',
    history:
      'The venerated image was brought from Mexico in 1626 and has been associated with safe travel ever since. Pilgrims traditionally walk to Antipolo, especially during the month of May.',
    significance:
      'The cathedral is a living center of devotion and tradition. Pilgrimage season shows how faith shapes local culture, food, and community life.',
    quiz: [
      { question: 'Which image is venerated at Antipolo Cathedral?', options: ['Our Lady of Peace and Good Voyage', 'Our Lady of Manaoag', 'Santo Niño de Cebu', 'Black Nazarene'], answerIndex: 0, explanation: 'Our Lady of Peace and Good Voyage is the patroness of Antipolo.' },
      { question: 'In which province is Antipolo?', options: ['Rizal', 'Cavite', 'Laguna', 'Batangas'], answerIndex: 0, explanation: 'Antipolo is the capital of Rizal province.' },
      { question: 'Which month is the traditional main pilgrimage season?', options: ['March', 'May', 'August', 'November'], answerIndex: 1, explanation: 'Many pilgrims travel to Antipolo in May.' },
    ],
  },
];
