import { CardPair, Deck } from '../engine/types';

function chunkIntoCards(words: string[]): string[][] {
  const cards: string[][] = [];
  for (let i = 0; i < words.length; i += 5) {
    const chunk = words.slice(i, i + 5);
    if (chunk.length === 5) cards.push(chunk);
  }
  return cards;
}

const generalKnowledge = [
  'Albert Einstein', 'Mount Everest', 'Great Wall of China', 'Amazon River', 'Leonardo da Vinci',
  'Sahara Desert', 'William Shakespeare', 'Eiffel Tower', 'Nile River', 'Isaac Newton',
  'Great Barrier Reef', 'Marie Curie', 'Statue of Liberty', 'Charles Darwin', 'Grand Canyon',
  'Mona Lisa', 'Christopher Columbus', 'Taj Mahal', 'Nelson Mandela', 'Machu Picchu',
  'Solar System', 'Periodic Table', 'DNA', 'Gravity', 'Photosynthesis',
  'Volcano', 'Earthquake', 'Tsunami', 'Rainforest', 'Glacier',
  'Democracy', 'Renaissance', 'Industrial Revolution', 'World War II', 'Cold War',
  'Internet', 'Telephone', 'Light Bulb', 'Printing Press', 'Steam Engine',
];

const generalKnowledgeYellow = [
  'Genghis Khan', 'Rosetta Stone', 'Great Rift Valley', 'Amazon Basin', 'Michelangelo',
  'Gobi Desert', 'Geoffrey Chaucer', 'Colosseum', 'Yangtze River', 'Michael Faraday',
  'Coral Triangle', 'Ada Lovelace', 'Mount Rushmore', 'Alfred Wegener', 'Antelope Canyon',
  'Girl with a Pearl Earring', 'Ferdinand Magellan', 'Petra', 'Mahatma Gandhi', 'Angkor Wat',
  'Higgs Boson', "Mendeleev's Table", 'RNA', 'Electromagnetism', 'Chlorophyll',
  'Tectonic Plate', 'Richter Scale', 'Storm Surge', 'Canopy Layer', 'Ice Core',
  'Magna Carta', 'Enlightenment', 'Agricultural Revolution', 'Cuban Missile Crisis', 'Iron Curtain',
  'Telegraph', 'Morse Code', 'Vacuum Tube', 'Movable Type', 'Locomotive',
];

const movies = [
  'Titanic', 'The Lion King', 'Star Wars', 'Jurassic Park', 'The Godfather',
  'Forrest Gump', 'Inception', 'The Matrix', 'Jaws', 'Rocky',
  'E.T.', 'Frozen', 'Shrek', 'Toy Story', 'Finding Nemo',
  'Batman', 'Spider-Man', 'Iron Man', 'The Avengers', 'Black Panther',
  'Harry Potter', 'The Hobbit', 'Avatar', 'Gladiator', 'Braveheart',
  'The Wizard of Oz', 'Casablanca', 'Psycho', 'Jurassic World', 'Home Alone',
  'Ghostbusters', 'Back to the Future', 'Indiana Jones', 'Pirates of the Caribbean', 'Mad Max',
  'La La Land', 'The Lion, the Witch and the Wardrobe', 'Cinderella', 'Aladdin', 'Mulan',
];

const moviesYellow = [
  'Citizen Kane', 'Metropolis', 'Rashomon', 'Persona', 'The Seventh Seal',
  'Apocalypse Now', 'Chinatown', 'Blade Runner', 'The Third Man', 'Sunset Boulevard',
  "Pan's Labyrinth", 'Amélie', 'City of God', 'Oldboy', 'Parasite',
  'No Country for Old Men', 'There Will Be Blood', 'Mulholland Drive', 'Memento', 'The Prestige',
  'Vertigo', 'Rear Window', 'North by Northwest', 'Notorious', 'Rope',
  '2001: A Space Odyssey', 'A Clockwork Orange', 'The Shining', 'Full Metal Jacket', 'Barry Lyndon',
  'Goodfellas', 'Raging Bull', 'The Departed', 'Casino', 'Mean Streets',
  'Whiplash', 'La Haine', 'Brazil', 'Delicatessen', 'Amadeus',
];

const sports = [
  'Football', 'Basketball', 'Tennis', 'Cricket', 'Rugby',
  'Olympics', 'World Cup', 'Marathon', 'Swimming', 'Boxing',
  'Golf', 'Baseball', 'Hockey', 'Volleyball', 'Table Tennis',
  'Formula 1', 'Cycling', 'Gymnastics', 'Wrestling', 'Archery',
  'Michael Jordan', 'Serena Williams', 'Usain Bolt', 'Lionel Messi', 'Muhammad Ali',
  'Penalty Kick', 'Home Run', 'Slam Dunk', 'Touchdown', 'Checkmate',
  'Referee', 'Scoreboard', 'Stadium', 'Trophy', 'Medal',
  'Surfing', 'Skiing', 'Karate', 'Fencing', 'Rowing',
];

const sportsYellow = [
  'Curling', 'Biathlon', 'Sepak Takraw', 'Kabaddi', 'Pelota',
  'Steeplechase', 'Decathlon', 'Modern Pentathlon', 'Luge', 'Skeleton',
  'Photo Finish', 'False Start', 'Offside Trap', 'Power Play', 'Match Point',
  'Yellow Jersey', 'Grand Slam', 'Hat Trick', 'Clean Sheet', 'Perfect Game',
  'Serena Williams', 'Usain Bolt', 'Simone Biles', 'Eliud Kipchoge', 'Katie Ledecky',
  'Wimbledon', 'Tour de France', 'Ryder Cup', 'Ashes Series', "America's Cup",
  'Free Throw', 'Power Forward', 'Wicketkeeper', 'Scrum Half', 'Goalkeeper',
  'Fencing', 'Archery', 'Judo', 'Rowing', 'Water Polo',
];

const geography = [
  'France', 'Japan', 'Brazil', 'Egypt', 'Australia',
  'Canada', 'India', 'South Africa', 'Mexico', 'Germany',
  'Mount Kilimanjaro', 'Lake Victoria', 'Sahara Desert', 'Amazon Rainforest', 'Andes Mountains',
  'Tokyo', 'Paris', 'New York City', 'Cape Town', 'Rio de Janeiro',
  'Equator', 'North Pole', 'South Pole', 'Continent', 'Peninsula',
  'Island', 'Volcano', 'Desert', 'Ocean', 'Coral Reef',
  'Great Wall of China', 'Niagara Falls', 'Victoria Falls', 'Dead Sea', 'Red Sea',
  'Antarctica', 'Greenland', 'Madagascar', 'Iceland', 'New Zealand',
];

const geographyYellow = [
  'Timbuktu', 'Kathmandu', 'Reykjavik', 'Vanuatu', 'Kyrgyzstan',
  'Strait of Malacca', 'Bering Strait', 'Tropic of Capricorn', 'Prime Meridian', 'International Date Line',
  'Fjord', 'Archipelago', 'Isthmus', 'Plateau', 'Steppe',
  'Serengeti', 'Patagonia', 'Atacama Desert', 'Siberian Tundra', 'Amazon Delta',
  'Ulaanbaatar', 'Nouakchott', 'Bishkek', 'Vientiane', 'Ljubljana',
  'Continental Drift', 'Monsoon Season', 'El Niño', 'Permafrost', 'Mangrove Swamp',
  'Galápagos Islands', 'Socotra', 'Svalbard', 'Tierra del Fuego', 'Kamchatka Peninsula',
  'Equatorial Guinea', 'Landlocked Country', 'Exclave', 'Archipelagic State', 'Microstate',
];

const entertainment = [
  'Beyonce', 'Michael Jackson', 'The Beatles', 'Elvis Presley', 'Taylor Swift',
  'Netflix', 'Broadway', 'Grammy Awards', 'Oscar Awards', 'Hollywood',
  'Stand-up Comedy', 'Musical Theatre', 'Karaoke', 'Talent Show', 'Reality TV',
  'Video Game', 'Board Game', 'Magic Trick', 'Circus', 'Puppet Show',
  'Disney', 'Pixar', 'Cartoon', 'Sitcom', 'Soap Opera',
  'Rock Music', 'Jazz', 'Hip Hop', 'Classical Music', 'Opera',
  'Dance', 'Ballet', 'Fashion Show', 'Photography', 'Painting',
  'Comic Book', 'Superhero', 'Fairy Tale', 'Mythology', 'Fantasy Novel',
];

const entertainmentYellow = [
  'Freddie Mercury', 'David Bowie', 'Prince', 'Nina Simone', 'Aretha Franklin',
  'Cannes Film Festival', 'Sundance', 'Tribeca', 'Venice Film Festival', 'Berlinale',
  'Improv Comedy', 'Method Acting', 'Foley Artist', 'Understudy', 'Table Read',
  'Vaudeville', 'Burlesque', 'Puppetry', 'Mime', 'Ventriloquism',
  'Streaming Wars', 'Binge Watching', 'Post-Credits Scene', 'Cliffhanger', 'Plot Twist',
  'Bebop', 'Fusion Jazz', 'Progressive Rock', 'Synthwave', 'Baroque Music',
  'Contemporary Dance', 'Tap Dance', 'Flamenco', 'Tango', 'Breakdancing',
  'Graphic Novel', 'Manga', 'Anime', 'Cosplay', 'Fan Fiction',
];

export const DECKS: Deck[] = [
  { id: 'general', name: 'General Knowledge', cards: chunkIntoCards(generalKnowledge), cardsYellow: chunkIntoCards(generalKnowledgeYellow) },
  { id: 'movies', name: 'Movies', cards: chunkIntoCards(movies), cardsYellow: chunkIntoCards(moviesYellow) },
  { id: 'sports', name: 'Sports', cards: chunkIntoCards(sports), cardsYellow: chunkIntoCards(sportsYellow) },
  { id: 'geography', name: 'Geography', cards: chunkIntoCards(geography), cardsYellow: chunkIntoCards(geographyYellow) },
  { id: 'entertainment', name: 'Entertainment', cards: chunkIntoCards(entertainment), cardsYellow: chunkIntoCards(entertainmentYellow) },
];

export function getDeckById(id: string, allDecks: Deck[] = DECKS): Deck | undefined {
  return allDecks.find((d) => d.id === id);
}

/** Builds shuffled card pairs (blue + optional yellow flip side) for a game. */
export function buildDeckPairs(deckIds: string[], allDecks: Deck[], reverse: boolean): CardPair[] {
  const pairs: CardPair[] = [];
  for (const id of deckIds) {
    const deck = getDeckById(id, allDecks);
    if (!deck) continue;
    deck.cards.forEach((blueCard, i) => {
      pairs.push({ blue: blueCard, yellow: deck.cardsYellow?.[i] ?? null });
    });
  }
  if (!reverse) return pairs;
  const words = pairs.flatMap((p) => p.blue);
  return words.map((w) => ({ blue: [w], yellow: null }));
}
