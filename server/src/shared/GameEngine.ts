import { CardPair, Deck, GameConfig, GameState, Team } from './types';
import { buildDeckPairs } from './decks';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function cardKey(pair: CardPair): string {
  return pair.blue.join('|');
}

/** seenKeys: cards shown in earlier games; those go to the back so fresh cards come first. */
export function createGame(
  teams: Team[],
  config: GameConfig,
  allDecks: Deck[],
  seenKeys: string[] = [],
  flaggedWords: string[] = []
): GameState {
  const seen = new Set(seenKeys);
  const flagged = new Set(flaggedWords);
  const all = buildDeckPairs(config.deckIds, allDecks, config.mode === 'reverse');
  const usable = all.filter((p) => ![...p.blue, ...(p.yellow ?? [])].some((w) => flagged.has(w)));
  // never flag away the whole pool
  const shuffled = shuffle(usable.length > 0 ? usable : all);
  const pairs = [...shuffled.filter((p) => !seen.has(cardKey(p))), ...shuffled.filter((p) => seen.has(cardKey(p)))];
  return {
    config,
    teams: teams.map((t) => ({ ...t, score: 0 })),
    deck: pairs,
    discard: [],
    currentTeamIndex: 0,
    activePair: null,
    currentCard: null,
    cardSide: 'blue',
    currentCardOtherSide: null,
    pendingIndices: [],
    completedIndices: [],
    guessedThisTurn: 0,
    guessedWords: [],
    skippedThisTurn: 0,
    timeRemaining: config.turnSeconds,
    isTurnActive: false,
    winnerId: null,
    round: 1,
    eliminatedTeamIds: [],
    turnsPlayedThisRound: 0,
    suddenDeathActive: false,
    suddenDeathTurnsRemaining: 0,
    lastTurnTeamId: null,
    lastTurnGuessed: 0,
    lastTurnWords: [],
    lastTurnSkipped: 0,
    scoreConfirmed: true,
    isPaused: false,
    describerIndex: Object.fromEntries(teams.map((t) => [t.id, 0])),
    undo: null,
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
  const yellowFirst = !!(state.config.randomSide && pair?.yellow && Math.random() < 0.5);
  const shown = (yellowFirst ? pair?.yellow : pair?.blue) ?? null;
  const other = (yellowFirst ? pair?.blue : pair?.yellow) ?? null;
  return {
    ...state,
    deck: rest,
    discard: pool,
    activePair: pair ?? null,
    currentCard: shown,
    cardSide: yellowFirst ? 'yellow' : 'blue',
    currentCardOtherSide: state.config.allowFlip ? other : null,
    pendingIndices: shown ? shown.map((_, i) => i) : [],
    completedIndices: [],
  };
}

export function startTurn(state: GameState): GameState {
  const withCard = drawCard(state);
  return {
    ...withCard,
    guessedThisTurn: 0,
    guessedWords: [],
    skippedThisTurn: 0,
    timeRemaining: state.config.turnSeconds,
    isTurnActive: true,
    isPaused: false,
    undo: null,
  };
}

export function tick(state: GameState): GameState {
  if (!state.isTurnActive || state.isPaused) return state;
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
  const guessedWords = [...state.guessedWords, state.currentCard[idx]];
  const base = { ...state, teams, completedIndices, guessedWords, guessedThisTurn: state.guessedThisTurn + 1, undo: snapshot(state) };

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
  return { ...state, pendingIndices: [...rest, first], skippedThisTurn: state.skippedThisTurn + 1, undo: snapshot(state) };
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
    undo: null,
  };
}

/** Declines the flip (or there's nothing left to flip to) and draws a brand new card. Only usable once the current side is fully done. */
export function nextCard(state: GameState): GameState {
  if (!state.isTurnActive || state.pendingIndices.length !== 0) return state;
  const discard = state.activePair ? [...state.discard, state.activePair] : state.discard;
  return { ...drawCard(state, discard), undo: null };
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
    lastTurnTeamId: state.teams[state.currentTeamIndex].id,
    lastTurnGuessed: state.guessedThisTurn,
    lastTurnWords: state.guessedWords,
    lastTurnSkipped: state.skippedThisTurn,
    scoreConfirmed: false,
    isPaused: false,
    undo: null,
    describerIndex: {
      ...state.describerIndex,
      [state.teams[state.currentTeamIndex].id]: (state.describerIndex[state.teams[state.currentTeamIndex].id] ?? 0) + 1,
    },
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

  // classic, blitz, themed, reverse — winner is determined once the score is confirmed (see confirmScore)
  const nextIndex = (next.currentTeamIndex + 1) % next.teams.length;
  return {
    ...next,
    currentTeamIndex: nextIndex,
    round: nextIndex === 0 ? next.round + 1 : next.round,
    winnerId: null,
  };
}

/** Lets the non-playing team correct the just-finished team's score before play continues. */
export function adjustScore(state: GameState, delta: number): GameState {
  if (state.scoreConfirmed || !state.lastTurnTeamId) return state;
  const teams = state.teams.map((t) =>
    t.id === state.lastTurnTeamId ? { ...t, score: Math.max(0, t.score + delta) } : t
  );
  return { ...state, teams, lastTurnGuessed: Math.max(0, state.lastTurnGuessed + delta) };
}

/** Locks in the just-finished team's score and, for score-target modes, checks for a winner. */
export function confirmScore(state: GameState): GameState {
  if (state.scoreConfirmed) return state;
  let winnerId = state.winnerId;
  if (!winnerId && ['classic', 'blitz', 'themed', 'reverse', 'board'].includes(state.config.mode)) {
    const winner = classicWinner(state);
    if (winner) winnerId = winner.id;
  }
  return { ...state, scoreConfirmed: true, winnerId };
}

function snapshot(state: GameState): GameState {
  return { ...state, undo: null };
}

/** Reverts the last RIGHT!/SKIP tap. The clock keeps its current time. */
export function undoLast(state: GameState): GameState {
  if (!state.isTurnActive || !state.undo) return state;
  return { ...state.undo, timeRemaining: state.timeRemaining, isPaused: state.isPaused, undo: null };
}

export function setPaused(state: GameState, paused: boolean): GameState {
  if (!state.isTurnActive) return state;
  return { ...state, isPaused: paused };
}

/** The player on this team whose turn it is to describe (null if the team has no named players). */
export function currentDescriber(state: GameState, teamId: string): string | null {
  const team = state.teams.find((t) => t.id === teamId);
  if (!team || team.players.length === 0) return null;
  return team.players[(state.describerIndex[teamId] ?? 0) % team.players.length];
}

export function getCurrentTeam(state: GameState): Team {
  return state.teams[state.currentTeamIndex];
}

export function isTeamEliminated(state: GameState, teamId: string): boolean {
  return state.eliminatedTeamIds.includes(teamId);
}
