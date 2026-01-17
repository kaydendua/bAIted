import { Player } from './player';

export type LobbyStatus = 'waiting' | 'in-progress' | 'ended';

export interface Lobby {
  code: string;
  hostId: string;
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
