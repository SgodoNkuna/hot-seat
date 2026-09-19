import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { GameConfig, GameState, Deck } from '../engine/types';
import { ClientMessage, RoomSnapshot, ServerMessage } from './protocol';

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

interface OnlineContextValue {
  status: ConnectionStatus;
  playerId: string | null;
  room: RoomSnapshot | null;
  gameState: GameState | null;
  error: string | null;
  connectAndCreate: (serverUrl: string, playerName: string, config: GameConfig, customDecks?: Deck[]) => void;
  connectAndJoin: (serverUrl: string, playerName: string, roomCode: string) => void;
  setTeam: (teamId: string) => void;
  addTeam: () => void;
  updateConfig: (patch: Partial<GameConfig>) => void;
  startGame: () => void;
  startTurn: () => void;
  correct: () => void;
  skip: () => void;
  flip: () => void;
  endTurn: () => void;
  leaveAndDisconnect: () => void;
  clearError: () => void;
}

const OnlineContext = createContext<OnlineContextValue | undefined>(undefined);

export function OnlineProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMessage = useCallback((raw: string) => {
    const msg: ServerMessage = JSON.parse(raw);
    switch (msg.type) {
      case 'joined':
        setPlayerId(msg.playerId);
        setRoom(msg.room);
        break;
      case 'room_update':
        setRoom(msg.room);
        break;
      case 'game_update':
        setGameState(msg.state);
        break;
      case 'error':
        setError(msg.message);
        break;
    }
  }, []);

  function openSocket(serverUrl: string, onOpen: (ws: WebSocket) => void) {
    setStatus('connecting');
    setError(null);
    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus('open');
      onOpen(ws);
    };
    ws.onmessage = (e) => handleMessage(e.data);
    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('closed');
  }

  const send = useCallback((msg: ClientMessage) => {
    wsRef.current?.send(JSON.stringify(msg));
  }, []);

  const connectAndCreate = useCallback(
    (serverUrl: string, playerName: string, config: GameConfig, customDecks?: Deck[]) => {
      openSocket(serverUrl, (ws) => {
        ws.send(JSON.stringify({ type: 'create_room', playerName, config, customDecks } satisfies ClientMessage));
      });
    },
    [handleMessage]
  );

  const connectAndJoin = useCallback(
    (serverUrl: string, playerName: string, roomCode: string) => {
      openSocket(serverUrl, (ws) => {
        ws.send(JSON.stringify({ type: 'join_room', playerName, roomCode } satisfies ClientMessage));
      });
    },
    [handleMessage]
  );

  const setTeam = useCallback((teamId: string) => send({ type: 'set_team', teamId }), [send]);
  const addTeam = useCallback(() => send({ type: 'add_team' }), [send]);
  const updateConfig = useCallback((patch: Partial<GameConfig>) => send({ type: 'update_config', config: patch }), [send]);
  const startGame = useCallback(() => send({ type: 'start_game' }), [send]);
  const startTurn = useCallback(() => send({ type: 'start_turn' }), [send]);
  const correct = useCallback(() => send({ type: 'correct' }), [send]);
  const skip = useCallback(() => send({ type: 'skip' }), [send]);
  const flip = useCallback(() => send({ type: 'flip' }), [send]);
  const endTurn = useCallback(() => send({ type: 'end_turn' }), [send]);

  const leaveAndDisconnect = useCallback(() => {
    send({ type: 'leave' });
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('idle');
    setPlayerId(null);
    setRoom(null);
    setGameState(null);
  }, [send]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <OnlineContext.Provider
      value={{
        status,
        playerId,
        room,
        gameState,
        error,
        connectAndCreate,
        connectAndJoin,
        setTeam,
        addTeam,
        updateConfig,
        startGame,
        startTurn,
        correct,
        skip,
        flip,
        endTurn,
        leaveAndDisconnect,
        clearError,
      }}
    >
      {children}
    </OnlineContext.Provider>
  );
}

export function useOnline() {
  const ctx = useContext(OnlineContext);
  if (!ctx) throw new Error('useOnline must be used within OnlineProvider');
  return ctx;
}
