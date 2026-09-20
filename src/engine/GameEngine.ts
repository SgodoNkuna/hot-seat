import { CardPair, Deck, GameConfig, GameState, Team } from './types';
import { buildDeckPairs } from '../data/decks';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createGame(teams: Team[], config: GameConfig, allDecks: Deck[]): GameState {
  const pairs = buildDeckPairs(config.deckIds, allDecks, config.mode === 'reverse');
  return {
    config,
    teams: teams.map((t) => ({ ...t, score: 0 })),
    deck: shuffle(pairs),
    discard: [],
    currentTeamIndex: 0,
    activePair: null,
    currentCard: null,
    cardSide: 'blue',
    currentCardOtherSide: null,
    pendingIndices: [],
    completedIndices: [],
    guessedThisTurn: 0,
    skippedThisTurn: 0,
    timeRemaining: config.turnSeconds,
    isTurnActive: false,
    winnerId: null,
    round: 1,
    eliminatedTeamIds: [],
    turnsPlayedThisRound: 0,
    suddenDeathActive: false,
    suddenDeathTurnsRemaining: 0,
  };
}

/** Draws a fresh card pair from the deck (reshuffling the discard pile if needed). */
function drawCard(state: GameState, discard: CardPair[] = state.discard): GameState {
  let deck = state.deck;
  let pool = discard;
  if (deck.length === 0) {
    deck = shuffle(pool);
    pool = [];
  }
  const [pair, ...rest] = deck;
  const blue = pair?.blue ?? null;
  return {
    ...state,
    deck: rest,
    discard: pool,
    activePair: pair ?? null,
    currentCard: blue,
    cardSide: 'blue',
    currentCardOtherSide: state.config.allowFlip ? pair?.yellow ?? null : null,
    pendingIndices: blue ? blue.map((_, i) => i) : [],
    completedIndices: [],
  };
}

export function startTurn(state: GameState): GameState {
  const withCard = drawCard(state);
  return {
    ...withCard,
    guessedThisTurn: 0,
    skippedThisTurn: 0,
    timeRemaining: state.config.turnSeconds,
    isTurnActive: true,
  };
}

export function tick(state: GameState): GameState {
  if (!state.isTurnActive) return state;
  const next = state.timeRemaining - 1;
  if (next <= 0) {
    return endTurn({ ...state, timeRemaining: 0 });
  }
  return { ...state, timeRemaining: next };
}

/** Marks the current active word correct. Only advances to a new card once every word on this side is done and no flip is available. */
export function markCorrect(state: GameState): GameState {
  if (!state.isTurnActive || !state.currentCard || state.pendingIndices.length === 0) return state;
  const [idx, ...restPending] = state.pendingIndices;
  const teams = state.teams.map((t, i) =>
    i === state.currentTeamIndex ? { ...t, score: t.score + 1 } : t
  );
  const completedIndices = [...state.completedIndices, idx];
  const base = { ...state, teams, completedIndices, guessedThisTurn: state.guessedThisTurn + 1 };

  if (restPending.length > 0) {
    return { ...base, pendingIndices: restPending };
  }

  // side complete
  if (state.config.allowFlip && state.currentCardOtherSide) {
    // wait for an explicit flip or "next card" action
    return { ...base, pendingIndices: [] };
  }
  const discard = state.activePair ? [...state.discard, state.activePair] : state.discard;
  return drawCard(base, discard);
}

/** Skips the current active word — it moves to the back of this side's queue, not discarded. */
export function markSkip(state: GameState): GameState {
  if (!state.isTurnActive || !state.currentCard || !state.config.allowSkip || state.pendingIndices.length === 0) {
    return state;
  }
  const [first, ...rest] = state.pendingIndices;
  return { ...state, pendingIndices: [...rest, first], skippedThisTurn: state.skippedThisTurn + 1 };
}

/** Flips to the other side, only once the current side's words are all guessed. Usable once per card. */
export function flipCard(state: GameState): GameState {
  if (
    !state.isTurnActive ||
    !state.config.allowFlip ||
    state.pendingIndices.length !== 0 ||
    !state.currentCardOtherSide
  ) {
    return state;
  }
  const words = state.currentCardOtherSide;
  return {
    ...state,
    currentCard: words,
    currentCardOtherSide: null,
    cardSide: state.cardSide === 'blue' ? 'yellow' : 'blue',
    pendingIndices: words.map((_, i) => i),
    completedIndices: [],
  };
}

/** Declines the flip (or there's nothing left to flip to) and draws a brand new card. Only usable once the current side is fully done. */
export function nextCard(state: GameState): GameState {
  if (!state.isTurnActive || state.pendingIndices.length !== 0) return state;
  const discard = state.activePair ? [...state.discard, state.activePair] : state.discard;
  return drawCard(state, discard);
}

function activeTeams(state: GameState): Team[] {
  return state.teams.filter((t) => !state.eliminatedTeamIds.includes(t.id));
}

function nextActiveIndex(state: GameState, fromIndex: number): number {
  const n = state.teams.length;
  let idx = fromIndex;
  for (let i = 0; i < n; i++) {
    idx = (idx + 1) % n;
    if (!state.eliminatedTeamIds.includes(state.teams[idx].id)) return idx;
  }
  return fromIndex;
}

function applyElimination(state: GameState): GameState {
  const active = activeTeams(state);
  if (active.length <= 1) return state;
  const minScore = Math.min(...active.map((t) => t.score));
  const toEliminate = active.filter((t) => t.score === minScore);
  const remainingAfter = active.length - toEliminate.length;
  if (remainingAfter < 1) {
    const keep = toEliminate[0];
    const eliminatedIds = [
      ...state.eliminatedTeamIds,
      ...toEliminate.filter((t) => t.id !== keep.id).map((t) => t.id),
    ];
    return { ...state, eliminatedTeamIds: eliminatedIds };
  }
  const eliminatedIds = [...state.eliminatedTeamIds, ...toEliminate.map((t) => t.id)];
  return { ...state, eliminatedTeamIds: eliminatedIds };
}

function classicWinner(state: GameState): Team | undefined {
  return state.teams.find(
    (t) => !state.eliminatedTeamIds.includes(t.id) && t.score >= state.config.targetScore
  );
}

function highestScoreWinner(state: GameState): Team | undefined {
  const active = activeTeams(state);
  const max = Math.max(...active.map((t) => t.score));
  const leaders = active.filter((t) => t.score === max);
  return leaders.length === 1 ? leaders[0] : undefined;
}

export function endTurn(state: GameState): GameState {
  const discard = state.activePair ? [...state.discard, state.activePair] : state.discard;
  let next: GameState = {
    ...state,
    isTurnActive: false,
    activePair: null,
    currentCard: null,
    cardSide: 'blue',
    currentCardOtherSide: null,
    pendingIndices: [],
    completedIndices: [],
    discard,
  };

  if (next.config.mode === 'elimination') {
    const turnsPlayed = next.turnsPlayedThisRound + 1;
    const active = activeTeams(next);
    if (turnsPlayed >= active.length) {
      next = applyElimination({ ...next, turnsPlayedThisRound: 0 });
      const stillActive = activeTeams(next);
      if (stillActive.length === 1) {
        return {
          ...next,
          winnerId: stillActive[0].id,
          currentTeamIndex: nextActiveIndex(next, next.currentTeamIndex),
        };
      }
    } else {
      next = { ...next, turnsPlayedThisRound: turnsPlayed };
    }
    const nextIndex = nextActiveIndex(next, next.currentTeamIndex);
    return { ...next, currentTeamIndex: nextIndex, round: nextIndex <= next.currentTeamIndex ? next.round + 1 : next.round };
  }

  if (next.config.mode === 'suddenDeath') {
    if (!next.suddenDeathActive) {
      const trigger = next.teams.some(
        (t) => t.score >= next.config.targetScore - next.config.suddenDeathMargin
      );
      if (trigger) {
        next = { ...next, suddenDeathActive: true, suddenDeathTurnsRemaining: next.teams.length };
      }
    }
    if (next.suddenDeathActive) {
      const remaining = next.suddenDeathTurnsRemaining - 1;
      if (remaining <= 0) {
        const winner = highestScoreWinner(next);
        if (winner) {
          return { ...next, winnerId: winner.id };
        }
        next = { ...next, suddenDeathTurnsRemaining: next.teams.length };
      } else {
        next = { ...next, suddenDeathTurnsRemaining: remaining };
      }
    }
    const nextIndex = (next.currentTeamIndex + 1) % next.teams.length;
    return {
      ...next,
      currentTeamIndex: nextIndex,
      round: nextIndex === 0 ? next.round + 1 : next.round,
    };
  }

  // classic, blitz, themed, reverse
  const winner = classicWinner(next);
  const nextIndex = (next.currentTeamIndex + 1) % next.teams.length;
  return {
    ...next,
    currentTeamIndex: nextIndex,
    round: nextIndex === 0 ? next.round + 1 : next.round,
    winnerId: winner ? winner.id : null,
  };
}

export function getCurrentTeam(state: GameState): Team {
  return state.teams[state.currentTeamIndex];
}

export function isTeamEliminated(state: GameState, teamId: string): boolean {
  return state.eliminatedTeamIds.includes(teamId);
}
