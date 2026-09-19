import React, { createContext, useContext, useState, useCallback } from 'react';
import { GameState, Team, GameConfig } from '../engine/types';
import { Deck } from '../engine/types';
import { createGame } from '../engine/GameEngine';

interface MatchInfo {
  matchNumber: number;
  matchWins: Record<string, number>;
  teams: Team[];
  config: GameConfig;
  allDecks: Deck[];
}

interface GameContextValue {
  state: GameState | null;
  setState: (s: GameState | null) => void;
  update: (fn: (s: GameState) => GameState) => void;
  match: MatchInfo | null;
  beginMatch: (teams: Team[], config: GameConfig, allDecks: Deck[]) => void;
  recordMatchWinAndContinue: () => 'next' | 'champion';
  startNextMatchGame: () => void;
  clearMatch: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

const MATCH_TARGET_WINS = 2; // best of 3

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);
  const [match, setMatch] = useState<MatchInfo | null>(null);

  const update = useCallback((fn: (s: GameState) => GameState) => {
    setState((prev) => (prev ? fn(prev) : prev));
  }, []);

  const beginMatch = useCallback((teams: Team[], config: GameConfig, allDecks: Deck[]) => {
    const wins: Record<string, number> = {};
    teams.forEach((t) => (wins[t.id] = 0));
    setMatch({ matchNumber: 1, matchWins: wins, teams, config, allDecks });
    setState(createGame(teams, config, allDecks));
  }, []);

  const recordMatchWinAndContinue = useCallback((): 'next' | 'champion' => {
    if (!state?.winnerId || !match) return 'champion';
    const wins = { ...match.matchWins, [state.winnerId]: (match.matchWins[state.winnerId] ?? 0) + 1 };
    const championId = Object.keys(wins).find((id) => wins[id] >= MATCH_TARGET_WINS);
    setMatch({ ...match, matchWins: wins });
    if (championId) return 'champion';
    return 'next';
  }, [state, match]);

  const startNextMatchGame = useCallback(() => {
    if (!match) return;
    setMatch((prev) => (prev ? { ...prev, matchNumber: prev.matchNumber + 1 } : prev));
    setState(createGame(match.teams, match.config, match.allDecks));
  }, [match]);

  const clearMatch = useCallback(() => {
    setMatch(null);
    setState(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        state,
        setState,
        update,
        match,
        beginMatch,
        recordMatchWinAndContinue,
        startNextMatchGame,
        clearMatch,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
