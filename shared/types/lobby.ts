import { Player } from './player';

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
