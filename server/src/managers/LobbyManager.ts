import { Lobby, createLobby } from '../models/Lobby';
import { Player, createPlayer } from '../models/Player';
import { generateLobbyCode } from '../utils/generateCode';
import { logger } from '../utils/logger';

class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerToLobby: Map<string, string> = new Map(); // playerId -> lobbyCode

  createLobby(hostSocketId: string, hostName: string): Lobby {
    const code = generateLobbyCode();
    const lobby = createLobby(code, hostSocketId, hostName);
    
    this.lobbies.set(code, lobby);
    this.playerToLobby.set(hostSocketId, code);
    
    logger.info(`Lobby created: ${code} by ${hostName}`);
    return lobby;
  }

}

export const lobbyManager = new LobbyManager();
