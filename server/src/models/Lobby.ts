import { Player } from './Player';

export type LobbyStatus = 'waiting' | 'in-progress' | 'ended';

export interface Lobby {
  code: string;
  hostSocketId: string;
  players: Player[];
  status: LobbyStatus;
  createdAt: Date;
  maxPlayers: number;
  impostorId?: string;
  problem?: {
    id: string;
    title: string;
    description: string;
  };
}

export function createLobby(code: string, hostSocketId: string, hostName: string): Lobby {
  return {
    code,
    hostSocketId: hostSocketId,
    players: [{
      id: hostSocketId,
      name: hostName,
      isImpostor: false,
      codeSubmission: '',
      isReady: false
    }],
    status: 'waiting',
    createdAt: new Date(),
    maxPlayers: 8
  };
}
