import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './RoomManager';
import { ClientMessage, ServerMessage } from './protocol';

const PORT = Number(process.env.PORT) || 4000;
const rooms = new RoomManager();

const wss = new WebSocketServer({ port: PORT });

interface ConnState {
  playerId: string | null;
}

wss.on('connection', (ws: WebSocket) => {
  const conn: ConnState = { playerId: null };

  ws.on('message', (raw) => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case 'create_room': {
        const { playerId, room } = rooms.createRoom(ws, msg.playerName, msg.config, msg.customDecks);
        conn.playerId = playerId;
        send(ws, { type: 'joined', playerId, room: rooms.snapshot(room) });
        break;
      }
      case 'join_room': {
        const result = rooms.joinRoom(ws, msg.roomCode, msg.playerName);
        if ('error' in result) {
          send(ws, { type: 'error', message: result.error });
          return;
        }
        conn.playerId = result.playerId;
        send(ws, { type: 'joined', playerId: result.playerId, room: rooms.snapshot(result.room) });
        rooms.broadcastRoom(result.room);
        break;
      }
      case 'set_team':
        if (conn.playerId) rooms.setTeam(conn.playerId, msg.teamId);
        break;
      case 'add_team':
        if (conn.playerId) rooms.addTeam(conn.playerId);
        break;
      case 'update_config':
        if (conn.playerId) rooms.updateConfig(conn.playerId, msg.config);
        break;
      case 'start_game':
        if (conn.playerId) rooms.startGame(conn.playerId);
        break;
      case 'start_turn':
        if (conn.playerId) rooms.startTurn(conn.playerId);
        break;
      case 'correct':
        if (conn.playerId) rooms.correct(conn.playerId);
        break;
      case 'skip':
        if (conn.playerId) rooms.skip(conn.playerId);
        break;
      case 'flip':
        if (conn.playerId) rooms.flip(conn.playerId);
        break;
      case 'end_turn':
        if (conn.playerId) rooms.endTurnEarly(conn.playerId);
        break;
      case 'leave':
        if (conn.playerId) rooms.leave(conn.playerId);
        conn.playerId = null;
        break;
    }
  });

  ws.on('close', () => {
    if (conn.playerId) rooms.leave(conn.playerId);
  });
});

function send(ws: WebSocket, msg: ServerMessage) {
  ws.send(JSON.stringify(msg));
}

console.log(`30 Seconds WebSocket server listening on ws://localhost:${PORT}`);
