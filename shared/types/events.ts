import { Lobby } from './lobby';
import { Player } from './player';

export interface ClientToServerEvents {
  'create-lobby': (data: { playerName: string }) => void;
  'join-lobby': (data: { code: string; playerName: string }) => void;
  'leave-lobby': () => void;
  'start-game': (data: { code: string }) => void;
  'code-update': (data: { code: string }) => void;
  'submit-code': (data: { code: string }) => void;
}

export interface ServerToClientEvents {
  connected: (data: { socketId: string }) => void;
  'lobby-created': (data: { lobby: Lobby }) => void;
  'lobby-joined': (data: { lobby: Lobby }) => void;
  'lobby-left': (data: { success: boolean }) => void;
  'lobby-closed': (data: { reason: string }) => void;
  'player-joined': (data: { lobby: Lobby; player?: Player }) => void;
  'player-left': (data: { lobby: Lobby; playerId: string }) => void;
  'game-started': (data: { lobby: Lobby }) => void;
  'you-are-impostor': (data: { message: string }) => void;
  'player-code-updated': (data: { playerId: string; code: string }) => void;
  'player-submitted': (data: { playerId: string; playerName?: string }) => void;
  'game-ended': (data: { lobby: Lobby; players: Player[] }) => void;
  error: (data: { message: string }) => void;
}
