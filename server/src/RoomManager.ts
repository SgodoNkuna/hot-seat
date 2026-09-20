import { WebSocket } from 'ws';
import { Deck, GameConfig, GameState, Team } from './shared/types';
import { createGame, startTurn, tick, markCorrect, markSkip, flipCard, nextCard, endTurn } from './shared/GameEngine';
import { DECKS } from './shared/decks';
import { RoomSnapshot, RoomTeam, ServerMessage } from './protocol';

interface Player {
  id: string;
  name: string;
  teamId: string;
  ws: WebSocket;
}

interface Room {
  code: string;
  hostPlayerId: string;
  players: Map<string, Player>;
  teams: RoomTeam[];
  config: GameConfig;
  customDecks: Deck[];
  status: 'lobby' | 'playing' | 'finished';
  gameState: GameState | null;
  tickHandle: ReturnType<typeof setInterval> | null;
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function genRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export class RoomManager {
  private rooms = new Map<string, Room>();
  private playerRoom = new Map<string, string>(); // playerId -> roomCode

  createRoom(hostWs: WebSocket, playerName: string, config: GameConfig, customDecks: Deck[] = []): { playerId: string; room: Room } {
    let code = genRoomCode();
    while (this.rooms.has(code)) code = genRoomCode();
    const hostId = genId();
    const teams: RoomTeam[] = [
      { id: 't1', name: 'Team 1', players: [{ id: hostId, name: playerName }] },
      { id: 't2', name: 'Team 2', players: [] },
    ];
    const room: Room = {
      code,
      hostPlayerId: hostId,
      players: new Map([[hostId, { id: hostId, name: playerName, teamId: 't1', ws: hostWs }]]),
      teams,
      config,
      customDecks,
      status: 'lobby',
      gameState: null,
      tickHandle: null,
    };
    this.rooms.set(code, room);
    this.playerRoom.set(hostId, code);
    return { playerId: hostId, room };
  }

  joinRoom(ws: WebSocket, roomCode: string, playerName: string): { playerId: string; room: Room } | { error: string } {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return { error: 'Room not found.' };
    if (room.status !== 'lobby') return { error: 'Game already started.' };
    const playerId = genId();
    const smallestTeam = [...room.teams].sort((a, b) => a.players.length - b.players.length)[0];
    smallestTeam.players.push({ id: playerId, name: playerName });
    room.players.set(playerId, { id: playerId, name: playerName, teamId: smallestTeam.id, ws });
    this.playerRoom.set(playerId, room.code);
    return { playerId, room };
  }

  getRoomByPlayer(playerId: string): Room | undefined {
    const code = this.playerRoom.get(playerId);
    return code ? this.rooms.get(code) : undefined;
  }

  setTeam(playerId: string, teamId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room || room.status !== 'lobby') return;
    const player = room.players.get(playerId);
    if (!player) return;
    const targetTeam = room.teams.find((t) => t.id === teamId);
    if (!targetTeam) return;
    room.teams.forEach((t) => (t.players = t.players.filter((p) => p.id !== playerId)));
    targetTeam.players.push({ id: playerId, name: player.name });
    player.teamId = teamId;
    this.broadcastRoom(room);
  }

  addTeam(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room || room.status !== 'lobby' || playerId !== room.hostPlayerId) return;
    const n = room.teams.length + 1;
    room.teams.push({ id: `t${n}`, name: `Team ${n}`, players: [] });
    this.broadcastRoom(room);
  }

  updateConfig(playerId: string, patch: Partial<GameConfig>) {
    const room = this.getRoomByPlayer(playerId);
    if (!room || room.status !== 'lobby' || playerId !== room.hostPlayerId) return;
    room.config = { ...room.config, ...patch };
    this.broadcastRoom(room);
  }

  startGame(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room || playerId !== room.hostPlayerId) return;
    const teamsForEngine: Team[] = room.teams
      .filter((t) => t.players.length > 0)
      .map((t) => ({ id: t.id, name: t.name, players: t.players.map((p) => p.name), score: 0 }));
    if (teamsForEngine.length < 2) {
      this.sendError(playerId, 'Need at least 2 teams with players.');
      return;
    }
    const allDecks = [...DECKS, ...room.customDecks];
    room.status = 'playing';
    room.gameState = createGame(teamsForEngine, room.config, allDecks);
    this.broadcastRoom(room);
    this.broadcastGame(room);
  }

  startTurn(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room?.gameState) return;
    room.gameState = startTurn(room.gameState);
    this.broadcastGame(room);
    this.runTicker(room);
  }

  correct(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room?.gameState) return;
    room.gameState = markCorrect(room.gameState);
    this.broadcastGame(room);
  }

  skip(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room?.gameState) return;
    room.gameState = markSkip(room.gameState);
    this.broadcastGame(room);
  }

  flip(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room?.gameState) return;
    room.gameState = flipCard(room.gameState);
    this.broadcastGame(room);
  }

  nextCard(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room?.gameState) return;
    room.gameState = nextCard(room.gameState);
    this.broadcastGame(room);
  }

  endTurnEarly(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room?.gameState) return;
    room.gameState = endTurn(room.gameState);
    this.stopTicker(room);
    this.broadcastGame(room);
    if (room.gameState.winnerId) room.status = 'finished';
  }

  leave(playerId: string) {
    const room = this.getRoomByPlayer(playerId);
    if (!room) return;
    room.players.delete(playerId);
    room.teams.forEach((t) => (t.players = t.players.filter((p) => p.id !== playerId)));
    this.playerRoom.delete(playerId);
    if (room.players.size === 0) {
      this.stopTicker(room);
      this.rooms.delete(room.code);
      return;
    }
    if (playerId === room.hostPlayerId) {
      room.hostPlayerId = [...room.players.keys()][0];
    }
    this.broadcastRoom(room);
  }

  private runTicker(room: Room) {
    this.stopTicker(room);
    room.tickHandle = setInterval(() => {
      if (!room.gameState) return;
      room.gameState = tick(room.gameState);
      this.broadcastGame(room);
      if (!room.gameState.isTurnActive) {
        this.stopTicker(room);
        if (room.gameState.winnerId) room.status = 'finished';
      }
    }, 1000);
  }

  private stopTicker(room: Room) {
    if (room.tickHandle) {
      clearInterval(room.tickHandle);
      room.tickHandle = null;
    }
  }

  snapshot(room: Room): RoomSnapshot {
    return {
      code: room.code,
      hostPlayerId: room.hostPlayerId,
      teams: room.teams,
      config: room.config,
      status: room.status,
    };
  }

  private send(playerId: string, msg: ServerMessage) {
    const room = this.getRoomByPlayer(playerId);
    const player = room?.players.get(playerId);
    if (player && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(msg));
    }
  }

  private sendError(playerId: string, message: string) {
    this.send(playerId, { type: 'error', message });
  }

  broadcastRoom(room: Room) {
    const msg: ServerMessage = { type: 'room_update', room: this.snapshot(room) };
    const payload = JSON.stringify(msg);
    room.players.forEach((p) => {
      if (p.ws.readyState === WebSocket.OPEN) p.ws.send(payload);
    });
  }

  broadcastGame(room: Room) {
    if (!room.gameState) return;
    const msg: ServerMessage = { type: 'game_update', state: room.gameState };
    const payload = JSON.stringify(msg);
    room.players.forEach((p) => {
      if (p.ws.readyState === WebSocket.OPEN) p.ws.send(payload);
    });
  }
}
