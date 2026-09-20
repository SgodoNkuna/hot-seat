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
  activePair: CardPair | null; // the pair currently drawn, kept for discard bookkeeping
  currentCard: string[] | null; // active side's words, fixed display order
  cardSide: CardSide;
  currentCardOtherSide: string[] | null; // other side's words, available to flip to once, until used
  pendingIndices: number[]; // indices into currentCard still to be guessed, in attempt order
  completedIndices: number[]; // indices into currentCard already guessed correctly
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
