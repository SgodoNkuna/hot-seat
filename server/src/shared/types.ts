export type GameMode = 'classic' | 'suddenDeath' | 'elimination' | 'reverse' | 'blitz' | 'themed';

export type MatchFormat = 'single' | 'bestOf3';

export type CardSide = 'blue' | 'yellow';

export interface Team {
  id: string;
  name: string;
  players: string[];
  score: number;
}

export interface Deck {
  id: string;
  name: string;
  cards: string[][]; // blue (default) side, each card = N words (5 normally, 1 in reverse mode)
  cardsYellow?: string[][]; // optional harder/alternate side, same length & order as cards
  isCustom?: boolean;
}

export interface CardPair {
  blue: string[];
  yellow: string[] | null;
}

export interface GameConfig {
  mode: GameMode;
  targetScore: number; // first team to reach this wins (classic/blitz/themed/elimination-round-cap unused)
  turnSeconds: number;
  deckIds: string[];
  allowSkip: boolean;
  allowFlip: boolean; // blue/yellow two-sided card rule
  matchFormat: MatchFormat;
  suddenDeathMargin: number; // how close to targetScore triggers sudden death
}

export interface GameState {
  config: GameConfig;
  teams: Team[];
  deck: CardPair[]; // shuffled remaining card pairs
  discard: CardPair[];
  currentTeamIndex: number;
  currentCard: string[] | null;
  cardSide: CardSide;
  currentCardOtherSide: string[] | null; // words for the inactive side, if flip is available for this card
  guessedThisTurn: number;
  skippedThisTurn: number;
  timeRemaining: number;
  isTurnActive: boolean;
  winnerId: string | null;
  round: number;
  eliminatedTeamIds: string[];
  turnsPlayedThisRound: number;
  suddenDeathActive: boolean;
  suddenDeathTurnsRemaining: number;
}
