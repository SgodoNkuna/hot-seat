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

export function createGame(teams: Team[], config: GameConfig, allDecks: Deck[]): GameState {
  const pairs = buildDeckPairs(config.deckIds, allDecks, config.mode === 'reverse');
  return {
    config,
    teams: teams.map((t) => ({ ...t, score: 0 })),
    deck: shuffle(pairs),
    discard: [],
    currentTeamIndex: 0,
    currentCard: null,
    cardSide: 'blue',
    currentCardOtherSide: null,
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

function drawCard(state: GameState): GameState {
  let deck = state.deck;
  let discard = state.discard;
  if (deck.length === 0) {
    deck = shuffle(discard);
    discard = [];
  }
  const [pair, ...rest] = deck;
  return {
    ...state,
    deck: rest,
    currentCard: pair?.blue ?? null,
    cardSide: 'blue',
    currentCardOtherSide: state.config.allowFlip ? pair?.yellow ?? null : null,
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

/** Flips the current card between its blue and yellow side (view-only, no scoring effect). */
export function flipCard(state: GameState): GameState {
  if (!state.config.allowFlip || !state.isTurnActive || !state.currentCard || !state.currentCardOtherSide) {
    return state;
  }
  return {
    ...state,
    currentCard: state.currentCardOtherSide,
    currentCardOtherSide: state.currentCard,
    cardSide: state.cardSide === 'blue' ? 'yellow' : 'blue',
  };
}

function currentPair(state: GameState): CardPair | null {
  if (!state.currentCard) return null;
  return state.cardSide === 'blue'
    ? { blue: state.currentCard, yellow: state.currentCardOtherSide }
    : { blue: state.currentCardOtherSide ?? state.currentCard, yellow: state.currentCard };
}

export function markCorrect(state: GameState): GameState {
  if (!state.isTurnActive || !state.currentCard) return state;
  const teams = state.teams.map((t, i) =>
    i === state.currentTeamIndex ? { ...t, score: t.score + 1 } : t
  );
  const pair = currentPair(state);
  const discard = pair ? [...state.discard, pair] : state.discard;
  const withCard = drawCard({ ...state, teams, discard, deck: state.deck });
  return { ...withCard, guessedThisTurn: state.guessedThisTurn + 1 };
}

export function markSkip(state: GameState): GameState {
  if (!state.isTurnActive || !state.currentCard || !state.config.allowSkip) return state;
  const pair = currentPair(state);
  const discard = pair ? [...state.discard, pair] : state.discard;
  const withCard = drawCard({ ...state, discard });
  return { ...withCard, skippedThisTurn: state.skippedThisTurn + 1 };
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
  let next: GameState = {
    ...state,
    isTurnActive: false,
    currentCard: null,
    cardSide: 'blue',
    currentCardOtherSide: null,
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
