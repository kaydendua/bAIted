import { Lobby, createLobby } from '../models/Lobby';
import { Player, createPlayer } from '../models/Player';
import { generateLobbyCode } from '../utils/generateCode';
import { logger } from '../utils/logger';

class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerToLobby: Map<string, string> = new Map(); // playerId -> lobbyCode

  createLobby(hostSocketId: string, hostName: string, maxPlayers: number = 8): Lobby {
    const code = generateLobbyCode();
    const lobby = createLobby(code, hostSocketId, hostName, maxPlayers);
    
    this.lobbies.set(code, lobby);
    this.playerToLobby.set(hostSocketId, code);
    
    logger.info(`Lobby created: ${code} by ${hostName}`);
    return lobby;
  }

  joinLobby(code: string, playerSocketId: string, playerName: string): Lobby | null {
    const lobby = this.lobbies.get(code);
    
    if (!lobby) {
      logger.warn(`Lobby not found: ${code}`);
      return null;
    }

    if (lobby.status !== 'waiting') {
      logger.warn(`Cannot join lobby ${code}: game already started`);
      return null;
    }

    if (lobby.players.length >= lobby.maxPlayers) {
      logger.warn(`Lobby ${code} is full`);
      return null;
    }

    if (lobby.players.some(p => p.id === playerSocketId)) {
      logger.info(`Player ${playerName} already in lobby ${code}`);
      return lobby;
    }

    const player = createPlayer(playerSocketId, playerName);
    lobby.players.push(player);
    this.playerToLobby.set(playerSocketId, code);
    
    logger.info(`Player ${playerName} joined lobby ${code}`);
    return lobby;
  }
}

export const lobbyManager = new LobbyManager();
