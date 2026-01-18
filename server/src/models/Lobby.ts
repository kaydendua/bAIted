import { Player } from './Player';

export type LobbyStatus = 'waiting' | 'in-progress' | 'ended';

export interface Lobby {
  code: string;
  hostSocketId: string;
  players: Player[];
  status: LobbyStatus;
  createdAt: Date;
  maxPlayers: number;
  aiId?: string;
  problem?: {
    id: string;
    title: string;
    description: string;
  };
}

export function createLobby(code: string, hostSocketId: string, hostName: string, maxPlayers: number = 8): Lobby {
  return {
    code,
    hostSocketId: hostSocketId,
    players: [{
      id: hostSocketId,
      name: hostName,
      isAi: false,
      codeSubmission: '',
      isReady: false
    }],
    status: 'waiting',
    createdAt: new Date(),
    maxPlayers: maxPlayers
  };
}
