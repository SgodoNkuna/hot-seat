import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameConfig, GameState, Deck } from '../engine/types';
import { ClientMessage, RoomSnapshot, ServerMessage } from './protocol';

interface Session {
  serverUrl: string;
  roomCode: string;
  playerId: string;
}

const SESSION_KEY = 'hotseat:online-session';
const MAX_RECONNECTS = 15;

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
  nextCard: () => void;
  endTurn: () => void;
  adjustScore: (delta: number) => void;
  confirmScore: () => void;
  undo: () => void;
  pause: (paused: boolean) => void;
  renameTeam: (teamId: string, name: string) => void;
  savedSession: Session | null;
  rejoin: () => void;
  reconnecting: boolean;
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
  const [savedSession, setSavedSession] = useState<Session | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const serverUrlRef = useRef('');
  const sessionRef = useRef<Session | null>(null);
  const leavingRef = useRef(false);
  const retriesRef = useRef(0);

  const storeSession = useCallback((session: Session | null) => {
    sessionRef.current = session;
    setSavedSession(session);
    (session ? AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session)) : AsyncStorage.removeItem(SESSION_KEY)).catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) {
          sessionRef.current = JSON.parse(raw);
          setSavedSession(sessionRef.current);
        }
      })
      .catch(() => {});
  }, []);

  const handleMessage = useCallback((raw: string) => {
    const msg: ServerMessage = JSON.parse(raw);
    switch (msg.type) {
      case 'joined':
        setPlayerId(msg.playerId);
        setRoom(msg.room);
        retriesRef.current = 0;
        setReconnecting(false);
        storeSession({ serverUrl: serverUrlRef.current, roomCode: msg.room.code, playerId: msg.playerId });
        break;
      case 'room_update':
        setRoom(msg.room);
        break;
      case 'game_update':
        setGameState(msg.state);
        break;
      case 'error':
        setError(msg.message);
        if (msg.message.includes('seat expired')) {
          storeSession(null);
          setReconnecting(false);
        }
        break;
    }
  }, []);

  function openSocket(serverUrl: string, onOpen: (ws: WebSocket) => void) {
    setStatus('connecting');
    setError(null);
    leavingRef.current = false;
    serverUrlRef.current = serverUrl;
    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      setStatus('open');
      onOpen(ws);
    };
    ws.onmessage = (e) => handleMessage(e.data);
    ws.onerror = () => setStatus('error');
    ws.onclose = () => {
      if (wsRef.current !== ws) return;
      setStatus('closed');
      // dropped mid-game (phone locked, wifi blip): quietly try to take our seat back
      const session = sessionRef.current;
      if (!leavingRef.current && session && retriesRef.current < MAX_RECONNECTS) {
        retriesRef.current += 1;
        setReconnecting(true);
        setTimeout(() => {
          if (!leavingRef.current) openSocket(session.serverUrl, (w) => w.send(JSON.stringify({ type: 'rejoin', roomCode: session.roomCode, playerId: session.playerId })));
        }, 2000);
      } else {
        setReconnecting(false);
      }
    };
  }

  const rejoin = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    retriesRef.current = 0;
    openSocket(session.serverUrl, (w) => w.send(JSON.stringify({ type: 'rejoin', roomCode: session.roomCode, playerId: session.playerId })));
  }, []);

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
  const nextCard = useCallback(() => send({ type: 'next_card' }), [send]);
  const endTurn = useCallback(() => send({ type: 'end_turn' }), [send]);
  const adjustScore = useCallback((delta: number) => send({ type: 'adjust_score', delta }), [send]);
  const confirmScore = useCallback(() => send({ type: 'confirm_score' }), [send]);
  const undo = useCallback(() => send({ type: 'undo' }), [send]);
  const pause = useCallback((paused: boolean) => send({ type: 'pause', paused }), [send]);
  const renameTeam = useCallback((teamId: string, name: string) => send({ type: 'rename_team', teamId, name }), [send]);

  const leaveAndDisconnect = useCallback(() => {
    leavingRef.current = true;
    storeSession(null);
    setReconnecting(false);
    send({ type: 'leave' });
    wsRef.current?.close();
    wsRef.current = null;
    setStatus('idle');
    setPlayerId(null);
    setRoom(null);
    setGameState(null);
    setError(null);
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
        nextCard,
        endTurn,
        adjustScore,
        confirmScore,
        undo,
        pause,
        renameTeam,
        savedSession,
        rejoin,
        reconnecting,
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
