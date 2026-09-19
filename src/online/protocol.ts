import { Deck, GameConfig, GameState } from '../engine/types';

export interface RoomTeam {
  id: string;
  name: string;
  players: { id: string; name: string }[];
}

export interface RoomSnapshot {
  code: string;
  hostPlayerId: string;
  teams: RoomTeam[];
  config: GameConfig;
  status: 'lobby' | 'playing' | 'finished';
}

// client -> server
export type ClientMessage =
  | { type: 'create_room'; playerName: string; config: GameConfig; customDecks?: Deck[] }
  | { type: 'join_room'; roomCode: string; playerName: string }
  | { type: 'set_team'; teamId: string }
  | { type: 'add_team' }
  | { type: 'update_config'; config: Partial<GameConfig> }
  | { type: 'start_game' }
  | { type: 'start_turn' }
  | { type: 'correct' }
  | { type: 'skip' }
  | { type: 'flip' }
  | { type: 'end_turn' }
  | { type: 'leave' };

// server -> client
export type ServerMessage =
  | { type: 'joined'; playerId: string; room: RoomSnapshot }
  | { type: 'room_update'; room: RoomSnapshot }
  | { type: 'game_update'; state: GameState }
  | { type: 'error'; message: string };
