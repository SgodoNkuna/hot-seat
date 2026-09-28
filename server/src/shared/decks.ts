import { CardPair, Deck } from './types';
import { MORE } from './moreCards';
import { EXTRA } from './extraCards';
import { SA_MORE } from './saCards';
import { BATCH4 } from './batch4Cards';
import { LANG_DECKS } from './langCards';

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
  'Pyramids of Giza', 'Stonehenge', 'Cleopatra', 'Julius Caesar', 'Vikings',
  'Ancient Rome', 'Ancient Greece', 'Mount Fuji', 'Aurora Borealis', 'Black Hole',
  'Milky Way', 'Big Bang Theory', 'Evolution', 'Vaccine', 'Antibiotics',
  'Electricity', 'Compass', 'Wheel', 'Alphabet', 'Currency',
  'United Nations', 'Olympic Games', 'Space Race', 'Moon Landing', 'Titanic Ship',
  'Great Depression', 'Berlin Wall', 'Silk Road', 'Gunpowder', 'Compass Rose',
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
  'Hanging Gardens of Babylon', 'Stonehenge Solstice', 'Hatshepsut', 'Spartacus', 'Norse Mythology',
  'Byzantine Empire', 'Peloponnesian War', 'Kilimanjaro Glacier', 'Aurora Australis', 'Event Horizon',
  'Andromeda Galaxy', 'Cosmic Inflation', 'Natural Selection', 'Penicillin', 'Antimicrobial Resistance',
  'Static Electricity', 'Magnetic Compass', 'Cog Wheel', 'Cuneiform', 'Barter System',
  'League of Nations', 'Paralympic Games', 'Sputnik', 'Apollo 11', 'RMS Lusitania',
  'Dust Bowl', 'Iron Curtain Fall', 'Grand Trunk Road', 'Black Powder', 'Hieroglyphics',
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
  'The Dark Knight', 'Interstellar', 'Gladiator II', 'Top Gun', 'Die Hard',
  'The Terminator', 'Alien', 'Predator', 'Men in Black', 'The Incredibles',
  'Up', 'Coco', 'Moana', 'Encanto', 'Zootopia',
  'The Grinch', 'Elf', 'Home Alone 2', 'National Lampoon', 'Dumb and Dumber',
  'The Hunger Games', "Twilight", 'Divergent', 'Percy Jackson', 'The Maze Runner',
  'John Wick', 'Mission Impossible', 'James Bond', 'Fast and Furious', 'The Bourne Identity',
  'The Wolf of Wall Street', 'The Social Network', 'A Beautiful Mind', 'The Pursuit of Happyness', 'The Blind Side',
];

const moviesYellow = [
  'Citizen Kane', 'Metropolis', 'Rashomon', 'Persona', 'The Seventh Seal',
  'Apocalypse Now', 'Chinatown', 'Blade Runner', 'The Third Man', 'Sunset Boulevard',
  "Pan's Labyrinth", 'Amélie', 'City of God', 'Oldboy', 'Parasite',
  'No Country for Old Men', 'There Will Be Blood', 'Mulholland Drive', 'Memento', 'The Prestige',
  'Vertigo', 'Rear Window', 'North by Northwest', 'Notorious', 'Rope',
  '2001: A Space Odyssey', 'A Clockwork Orange', 'The Shining', 'Full Metal Jacket', 'Barry Lyndon',
  'Goodfellas', 'Raging Bull', 'The Departed', 'Casino', 'Mean Streets',
  'Whiplash', 'La Haine', 'Twelve Monkeys', 'Delicatessen', 'Amadeus',
  'The Seventh Continent', 'Wild Strawberries', 'The Passion of Joan of Arc', 'Ordet', 'Stalker',
  'Solaris', 'Andrei Rublev', 'Come and See', 'Ivan\'s Childhood', 'The Mirror',
  'Yojimbo', 'Seven Samurai', 'Ikiru', 'High and Low', 'Throne of Blood',
  'Cléo from 5 to 7', 'Breathless', 'The 400 Blows', 'Jules and Jim', 'Wings of Desire',
  'Nosferatu', 'M', 'The Cabinet of Dr. Caligari', 'Sunrise', 'Battleship Potemkin',
  'Through a Glass Darkly', 'Fanny and Alexander', 'Cries and Whispers', 'Autumn Sonata', 'Scenes from a Marriage',
  'Belle de Jour', 'The Discreet Charm of the Bourgeoisie', 'Eraserhead', 'Videodrome', 'The Fly',
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
  'Snowboarding', 'Ice Skating', 'Bowling', 'Darts', 'Snooker',
  'Badminton', 'Squash', 'Handball', 'Water Polo', 'Rock Climbing',
  'Triathlon', 'Pole Vault', 'Long Jump', 'High Jump', 'Shot Put',
  'Serena Williams Slam', 'LeBron James', 'Cristiano Ronaldo', 'Tiger Woods', 'Roger Federer',
  'Free Kick', 'Corner Kick', 'Yellow Card', 'Red Card', 'Extra Time',
  'Coach', 'Captain', 'Umpire', 'Linesman', 'Substitute',
  'Weightlifting', 'Judo Throw', 'Sumo Wrestling', 'Motocross', 'Sailing',
];

const sportsYellow = [
  'Curling', 'Biathlon', 'Sepak Takraw', 'Kabaddi', 'Pelota',
  'Steeplechase', 'Decathlon', 'Modern Pentathlon', 'Luge', 'Skeleton',
  'Photo Finish', 'False Start', 'Offside Trap', 'Power Play', 'Match Point',
  'Yellow Jersey', 'Grand Slam', 'Hat Trick', 'Clean Sheet', 'Perfect Game',
  'Martina Navratilova', 'Carl Lewis', 'Simone Biles', 'Eliud Kipchoge', 'Katie Ledecky',
  'Wimbledon', 'Tour de France', 'Ryder Cup', 'Ashes Series', "America's Cup",
  'Free Throw', 'Power Forward', 'Wicketkeeper', 'Scrum Half', 'Goalkeeper',
  'Epee', 'Compound Bow', 'Judo', 'Coxswain', 'Canoe Slalom',
  'Cross-Country Skiing', 'Ski Jumping', 'Bobsled', 'Short Track Speed Skating', 'Synchronized Swimming',
  'Rhythmic Gymnastics', 'Trampoline', 'BMX Racing', 'Mountain Biking', 'Race Walking',
  'Beach Volleyball', 'Field Hockey', 'Lacrosse', 'Netball', 'Polo',
  'Duckpin Bowling', 'Bocce', 'Jai Alai', 'Cornhole', 'Petanque',
  'Novak Djokovic', 'Rafael Nadal', 'Michael Phelps', 'Nadia Comaneci', 'Jesse Owens',
  'Davis Cup', 'Stanley Cup', 'Copa America', 'Six Nations', 'Commonwealth Games',
  'Libero', 'Sweeper', 'Enforcer', 'Pinch Hitter', 'Designated Hitter',
];

const geography = [
  'France', 'Japan', 'Brazil', 'Egypt', 'Australia',
  'Canada', 'India', 'South Africa', 'Mexico', 'Germany',
  'Mount Kilimanjaro', 'Lake Victoria', 'Arabian Desert', 'Amazon Rainforest', 'Andes Mountains',
  'Tokyo', 'Paris', 'New York City', 'Cape Town', 'Rio de Janeiro',
  'Equator', 'North Pole', 'South Pole', 'Continent', 'Peninsula',
  'Island', 'Mount Etna', 'Desert', 'Ocean', 'Coral Reef',
  'Forbidden City', 'Niagara Falls', 'Victoria Falls', 'Dead Sea', 'Red Sea',
  'Antarctica', 'Greenland', 'Madagascar', 'Iceland', 'New Zealand',
  'Italy', 'Spain', 'China', 'Russia', 'Argentina',
  'Nairobi', 'Cairo', 'London', 'Sydney', 'Moscow',
  'Amazon River Delta', 'Danube River', 'Mississippi River', 'Yellow River', 'Ganges River',
  'Rocky Mountains', 'Himalayas', 'Alps', 'Andes Mountains Peak', 'Atlas Mountains',
  'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Mediterranean Sea',
  'Sahara Sand Dunes', 'Thar Desert', 'Kalahari Desert', 'Mojave Desert', 'Outback',
  'Time Zone', 'Latitude', 'Longitude', 'Border', 'Capital City',
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
  'Ashgabat', 'Astana', 'Dushanbe', 'Sana\'a', 'Thimphu',
  'Karst Landscape', 'Escarpment', 'Alluvial Plain', 'Cordillera', 'Butte',
  'Sundarbans', 'Okavango Delta', 'Pantanal', 'Doñana Wetlands', 'Everglades',
  'Ring of Fire', 'Fault Line', 'Subduction Zone', 'Geyser Basin', 'Caldera',
  'Transcaucasia', 'Anatolia', 'Levant', 'Maghreb', 'Horn of Africa',
  'Trade Wind', 'Jet Stream', 'Rain Shadow', 'Doldrums', 'Coriolis Effect',
  'Terra Incognita', 'Antipodes', 'Geodetic Datum', 'Contour Line', 'Isthmus of Panama',
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
  'Rihanna', 'Ed Sheeran', 'Adele', 'Drake', 'Ariana Grande',
  'Spotify', 'YouTube', 'TikTok', 'Podcast', 'Livestream',
  'Red Carpet', 'Paparazzi', 'Celebrity', 'Autograph', 'Fan Club',
  'Magic Show', 'Escape Room', 'Theme Park', 'Roller Coaster', 'Arcade',
  'Sequel', 'Prequel', 'Spin-off', 'Reboot', 'Crossover Episode',
  'Musical', 'Opera Singer', 'Orchestra', 'Conductor', 'Symphony',
  'Stand-up Special', 'Late Night Show', 'Talk Show', 'Game Show', 'Variety Show',
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
  'Kurt Cobain', 'Amy Winehouse', 'Janis Joplin', 'Jim Morrison', 'Billie Holiday',
  'Sundance Institute', 'Toronto Film Festival', 'Telluride', 'Locarno Festival', 'Rotterdam Festival',
  'Meisner Technique', 'Stanislavski System', 'Commedia dell\'Arte', 'Kabuki Theatre', 'Noh Theatre',
  'Minstrel Show', 'Music Hall', 'Cabaret', 'Pantomime', 'Shadow Puppetry',
  'Prestige TV', 'Anthology Series', 'Slow Cinema', 'Found Footage', 'Mockumentary',
  'Free Jazz', 'Krautrock', 'Shoegaze', 'Post-Punk', 'Chamber Music',
  'Contact Improvisation', 'Krump', 'Voguing', 'Capoeira', 'Butoh',
  'Light Novel', 'Webtoon', 'Zine', 'Fan Art', 'Original Character',
];

const saTrending = [
  'Madlanga Commission', 'Nhlanhla Mkhwanazi', 'Cyril Ramaphosa', 'Government of National Unity', 'BRICS Summit',
  'Eskom', 'Load Shedding', 'Operation Vulindlela', 'Rand Exchange Rate', 'Fuel Price Hike',
  'Unemployment Rate', 'Inflation Rate', 'Sharpeville Massacre Inquiry', 'National Housing Finance Corporation', 'JMPD',
  'SABC News', 'SAnews', 'Interim Report', 'Judicial Inquiry', 'Cabinet Reshuffle',
  'Municipal Elections', 'Coalition Government', 'State Capture', 'Public Protector', 'Auditor-General',
  'Xenophobia Debate', 'Refugee Camp Raid', 'Land Reform', 'NHI Bill', 'Budget Speech',
  'Petrol Price', 'Repo Rate', 'GDP Growth', 'Stats SA', 'Reserve Bank',
  'Loadshedding-Free Streak', 'Water Crisis', 'Potholes Campaign', 'Matric Results', 'Minimum Wage',
  'Steve Biko', 'Oliver Tambo', 'Walter Sisulu', 'Winnie Madikizela-Mandela', 'Chris Hani',
  'Robben Island', 'Soweto Uprising', 'Truth and Reconciliation Commission', 'Freedom Charter', 'Rivonia Trial',
  'District Six', 'Sharpeville Massacre', 'Apartheid', 'Pass Laws', 'Day of Reconciliation',
  'Julius Malema', 'Helen Zille', 'John Steenhuisen', 'Mmusi Maimane', 'Kgalema Motlanthe',
  'Thabo Mbeki', 'Jacob Zuma', 'F.W. de Klerk', 'Desmond Tutu', 'Madiba Day',
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State',
  'Johannesburg', 'Pretoria', 'Durban', 'Soweto', 'Stellenbosch',
  'Springbok Emblem', 'King Protea Flower', 'Rainbow Nation', 'Big Five', 'Braai Culture',
  'Biltong', 'Rooibos Tea', 'Bunny Chow', 'National Anthem', 'South African Flag',
  'Siya Kolisi', 'AB de Villiers', 'Caster Semenya', 'Comrades Marathon', 'Two Oceans Marathon',
  'Springboks', 'Proteas Cricket', 'Bafana Bafana', 'Rugby World Cup Win', 'Cricket World Cup',
  'Naspers', 'Sasol', 'MTN Group', 'Shoprite', 'Standard Bank',
  'Johannesburg Stock Exchange', 'Anglo American', 'Vodacom', 'Pick n Pay', 'Absa',
  'isiZulu', 'isiXhosa', 'Afrikaans', 'Sesotho', 'Setswana',
  'University of Cape Town', 'Wits University', 'Stellenbosch University', 'University of Pretoria', 'Rhodes University',
  'Table Mountain', 'Kruger National Park', 'Cape Point', 'Drakensberg Mountains', 'Garden Route',
  'Robben Island Tour', 'Apartheid Museum', 'Constitution Hill', 'Boulders Beach Penguins', 'Blyde River Canyon',
  'Amapiano Music', 'Kwaito', 'Brenda Fassie', 'Miriam Makeba', 'Hugh Masekela',
  'Bobotie', 'Boerewors', 'Melktert', 'Koeksisters', 'Chakalaka',
  'Freedom Day', 'Human Rights Day', 'Youth Day', 'Heritage Day', 'Constitution of South Africa',
  'Knysna', 'Hermanus', 'Franschhoek', 'Kimberley', 'East London',
  'Eish', 'Lekker', 'Howzit', 'Ubuntu', 'Robot (Traffic Light)',
  'Cradle of Humankind', 'Union Buildings', 'Nando\'s', 'Woolworths SA', 'Toyota SA',
  'Albertina Sisulu', 'Ruth First', 'Joe Slovo', 'Helen Suzman', 'Trevor Manuel',
  'Pravin Gordhan', 'Albert Luthuli', 'Robert Sobukwe', 'Limpopo', 'Mpumalanga',
  'North West Province', 'Northern Cape', 'Bloemfontein', 'Gqeberha', 'George',
  'Nedbank', 'First National Bank', 'Discovery Limited', 'Transnet', 'South African Airways',
  'Ernie Els', 'Gary Player', 'Percy Tau', 'Lucas Radebe', 'Makhaya Ntini',
  'Hashim Amla', 'Dale Steyn', 'Francois Pienaar', 'Lion', 'Elephant',
  'Rhino', 'Cape Buffalo', 'Leopard', 'Cheetah', 'Wildebeest',
  'Great White Shark', 'Whale Watching Hermanus', 'Hluhluwe-Imfolozi Park', 'Women\'s Day', 'Bill of Rights',
  'Ubuntu Philosophy', '1994 Elections', 'Voortrekker Monument', 'Gold Reef City', 'Loftus Versfeld',
  'Newlands Stadium', 'Ellis Park Stadium', 'Moses Mabhida Stadium', 'FNB Stadium', 'Cape Town Stadium',
  'Sandton City', 'V&A Waterfront', 'Gold Fields Mining', 'Anglo Platinum', 'Great Trek',
  'Boer War', 'Union of South Africa', 'Diamond Mining', 'Gold Rush Era', 'Apartheid Signage',
  'Long Walk to Freedom', 'Invictus Rugby Match', 'Marikana', 'Zondo Commission', 'Cadre Deployment',
  'Blue Bulls', 'Golden Lions', 'Sharks Rugby', 'Kaizer Chiefs', 'Orlando Pirates',
  'Mamelodi Sundowns', 'SuperSport Park', 'Highveld Lightning', 'Durban July', 'Cape Argus Cycle Tour',
  'National Development Plan', 'Broad-Based BEE', 'Just Energy Transition', 'Renewable Energy Independent Power Producer', 'Social Grant',
  'Rand Weakness', 'Credit Rating Downgrade', 'Infrastructure Bond', 'Port Congestion', 'Load Curtailment',
  'Constitutional Court', 'Chapter Nine Institution', 'Electoral Commission', 'Independent Communications Authority', 'Competition Commission',
  'Just Transition Fund', 'Carbon Tax', 'Green Hydrogen Hub', 'Special Economic Zone', 'Township Economy',
];

const saTrendingYellow = [
  'Amapiano Dance Challenge', 'Skeur Dance', 'Scorpion Kings Live', 'Afro House Set', 'FNB Stadium Concert',
  'Princess Sachiko', 'Wian van den Berg', 'Tyla', 'Dean Schneider', 'BigmanKG',
  'Musa Khawula', 'Crystal Katsini', 'Chad Jones', 'Elihle Masimula', 'Shandor Larenty',
  'TikTok Duet', 'Viral Skit', 'Braai Content', 'Thrift Haul', 'Girlhood Trend',
  'Ghanaian Afrobeats', 'Accra Creator Trip', 'Black Sherif', 'Jollof Rice Debate', 'Amapiano vs Afrobeats',
  'Cross-Border Collab', 'Micro-Influencer', 'Brand Ambassador', 'Sponsored Trip', 'Engagement Rate',
  'Load Shedding Meme', 'Petrol Price Skit', 'Eskom Joke', 'Rand Weakness Meme', 'Pothole Prank',
  'Trending Sound', 'For You Page', 'Comment Section Roast', 'Reaction Video', 'Livestream Shopping',
  'Ronald Lamola', 'Enoch Godongwana', 'Naledi Pandor', 'Gwede Mantashe', 'Fikile Mbalula',
  'Bantu Education Act', 'Group Areas Act', 'Defiance Campaign', 'Black Consciousness Movement', 'Treason Trial',
  'Capitec Bank', 'Discovery Health', 'Investec', 'Old Mutual', 'Sanlam',
  'Sun City', 'Addo Elephant Park', 'Golden Gate Highlands', 'Cederberg', 'Wild Coast',
  'Faf du Plessis', 'Quinton de Kock', 'Kagiso Rabada', 'Bryan Habana', 'Eben Etzebeth',
  'Banyana Banyana', 'Itumeleng Khune', 'Wayde van Niekerk', 'Chad le Clos', 'Tendai Mtawarira',
  'Nasty C', 'DJ Zinhle', 'Kabza De Small', 'DJ Maphorisa', 'Uncle Waffles',
  'Trevor Noah', 'Loyiso Gola', 'Leon Schuster', 'Uzalo', 'Muvhango',
  'Generations The Legacy', '7de Laan', 'Skeem Saam', 'Rhythm City', 'The Queen Mzansi',
  'Sharp Sharp', 'Ag Man', 'Boet', 'Just Now', 'Sho\'t Left',
  'Umngqusho', 'Amagwinya', 'Gatsby Sandwich', 'Sosaties', 'Umqombothi',
  'Freedom Park', 'Cape Winelands', 'Maropeng Visitor Centre', 'iSimangaliso Wetland Park', 'Nelson Mandela Bridge',
  'Casper Nyovest', 'AKA Rapper', 'Black Coffee DJ', 'Master KG', 'Riky Rick',
  'Zahara Singer', 'Sjava', 'Focalistic', 'Big Zulu', 'Kwesta',
  'Bonang Matheba', 'Somizi Mhlongo', 'Minnie Dlamini', 'Pearl Thusi', 'Nomzamo Mbatha',
  'Idols SA', 'Big Brother Mzansi', 'Date My Family', 'The Voice SA', 'Strictly Come Dancing SA',
  'e.tv News', 'DStv Compact', 'Showmax', 'Mzansi Magic', 'SABC 1',
  'Sho Madjozi', 'Prince Kaybee', 'Heavy K', 'DJ Tira', 'Distruction Boyz',
  'Springbok Sevens', 'Rassie Erasmus', 'Handre Pollard', 'Cheslin Kolbe', 'Makazole Mapimpi',
  'Proteas T20', 'Temba Bavuma', 'Aiden Markram', 'Anrich Nortje', 'Lungi Ngidi',
  'Orlando Stadium', 'Peter Mokaba Stadium', 'Mbombela Stadium', 'Royal Bafokeng Stadium', 'Free State Stadium',
  'Chesa Nyama', 'Rusks', 'Malva Pudding', 'Potjiekos', 'Samp and Beans',
  'Vetkoek', 'Pap and Vleis', 'Tripe and Pap', 'Mogodu', 'Umleqwa',
  'Sharp Left', 'China (Friend)', 'Aunty', 'Bru', 'Now Now',
  'Kasi Vibes', 'Hood Content', 'Township Tour', 'Street Vendor Trend', 'Spaza Shop',
  'Stokvel', 'Lobola Negotiation', 'Umembeso Ceremony', 'Traditional Wedding', 'Initiation Season',
  'Diski Dance', 'Vosho Dance', 'Bhenga Dance', 'Pantsula Dance', 'Gwara Gwara',
  'Jerusalema Song', 'Jerusalema Challenge', 'Water Challenge', 'Toilet Paper Challenge', 'Ice Bucket Challenge SA',
  'Comedy Central Africa', 'Trevor Noah Special', 'Loyiso Madinga', 'Celeste Ntuli', 'Tumi Morake',
  'Kaya FM', '947 Radio', 'Metro FM', '5FM', 'Ukhozi FM',
  'City Press', 'Sunday Times SA', 'Mail & Guardian', 'Daily Sun', 'Sowetan',
  'Rand Show', 'Comic Con Africa', 'Cape Town Jazz Festival', 'Splashy Fen Festival', 'Oppikoppi',
  'Rocking the Daisies', 'Ultra South Africa', 'Afropunk Joburg', 'Design Indaba', 'Kirstenbosch Concerts',
  'Hluhluwe Game Drive', 'Sabi Sands Safari', 'Table Mountain Sunset', 'Chapman\'s Peak Drive', 'Robberg Nature Reserve',
  'Karoo Landscape', 'Namaqualand Flowers', 'Tsitsikamma Canopy Tour', 'Baviaanskloof', 'Golden Mile Durban',
  'Long Street Cape Town', 'Maboneng Precinct', 'Braamfontein', 'Melville 7th Street', 'Rosebank Rooftop Market',
  'Neighbourgoods Market', 'Bryanston Market', 'Milnerton Market', 'Greenmarket Square', 'Bo-Kaap',
  'Robben Island Ferry', 'Kirstenbosch Boma', 'Two Oceans Aquarium', 'Cape Town Cycle Tour', 'Gansbaai Shark Cage Diving',
  'Bloukrans Bungee Jump', 'Oribi Gorge', 'Sun City Superbowl', 'Lost City Waterpark', 'Gold Reef City Rides',
  'uShaka Marine World', 'Gateway Theatre of Shopping', 'Menlyn Park', 'Canal Walk', 'Eastgate Shopping Centre',
  'Load Shedding App', 'EskomSePush', 'Solar Panel Boom', 'Inverter Sales', 'Generator Rentals',
  'Mzansi Meme Page', 'SA Twitter Roast', 'Trending Hashtag ZA', 'Screenshot Culture', 'Group Chat Drama',
];

// keeps blue/yellow card counts equal so every card can flip
function pairLen(a: string[], b: string[]): number {
  return Math.floor(Math.min(a.length, b.length) / 5) * 5;
}

export const DECKS: Deck[] = [
  { id: 'general', name: 'General Knowledge', cards: chunkIntoCards([...generalKnowledge.slice(0, pairLen(generalKnowledge, generalKnowledgeYellow)), ...MORE.general.blue, ...EXTRA.general.blue, ...BATCH4.general.blue]), cardsYellow: chunkIntoCards([...generalKnowledgeYellow.slice(0, pairLen(generalKnowledge, generalKnowledgeYellow)), ...MORE.general.yellow, ...EXTRA.general.yellow, ...BATCH4.general.yellow]) },
  { id: 'movies', name: 'Movies', cards: chunkIntoCards([...movies.slice(0, pairLen(movies, moviesYellow)), ...MORE.movies.blue, ...EXTRA.movies.blue, ...BATCH4.movies.blue]), cardsYellow: chunkIntoCards([...moviesYellow.slice(0, pairLen(movies, moviesYellow)), ...MORE.movies.yellow, ...EXTRA.movies.yellow, ...BATCH4.movies.yellow]) },
  { id: 'sports', name: 'Sports', cards: chunkIntoCards([...sports.slice(0, pairLen(sports, sportsYellow)), ...MORE.sports.blue, ...EXTRA.sports.blue, ...BATCH4.sports.blue]), cardsYellow: chunkIntoCards([...sportsYellow.slice(0, pairLen(sports, sportsYellow)), ...MORE.sports.yellow, ...EXTRA.sports.yellow, ...BATCH4.sports.yellow]) },
  { id: 'geography', name: 'Geography', cards: chunkIntoCards([...geography.slice(0, pairLen(geography, geographyYellow)), ...MORE.geography.blue, ...EXTRA.geography.blue, ...BATCH4.geography.blue]), cardsYellow: chunkIntoCards([...geographyYellow.slice(0, pairLen(geography, geographyYellow)), ...MORE.geography.yellow, ...EXTRA.geography.yellow, ...BATCH4.geography.yellow]) },
  { id: 'entertainment', name: 'Entertainment', cards: chunkIntoCards([...entertainment.slice(0, pairLen(entertainment, entertainmentYellow)), ...MORE.entertainment.blue, ...EXTRA.entertainment.blue, ...BATCH4.entertainment.blue]), cardsYellow: chunkIntoCards([...entertainmentYellow.slice(0, pairLen(entertainment, entertainmentYellow)), ...MORE.entertainment.yellow, ...EXTRA.entertainment.yellow, ...BATCH4.entertainment.yellow]) },
  { id: 'sa-trending', name: 'SA Trending', cards: chunkIntoCards([...saTrending, ...SA_MORE.blue]), cardsYellow: chunkIntoCards([...saTrendingYellow, ...SA_MORE.yellow]) },
  ...Object.entries(LANG_DECKS).map(([id, d]) => ({ id: 'lang-' + id, name: d.name, cards: chunkIntoCards(d.blue), cardsYellow: chunkIntoCards(d.yellow) })),
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
