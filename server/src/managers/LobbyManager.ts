import { Lobby, createLobby } from '../models/Lobby';
import { Player, createPlayer } from '../models/Player';
import { generateLobbyCode } from '../utils/generateCode';
import { logger } from '../utils/logger';

class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerToLobby: Map<string, string> = new Map(); // playerId -> lobbyCode

  createLobby(hostId: string, hostName: string): Lobby {
    const code = generateLobbyCode();
    const lobby = createLobby(code, hostId, hostName);
    
    this.lobbies.set(code, lobby);
    this.playerToLobby.set(hostId, code);
    
    logger.info(`Lobby created: ${code} by ${hostName}`);
    return lobby;
  }

  joinLobby(code: string, playerId: string, playerName: string): Lobby | null {
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

    // Check if player already in lobby
    if (lobby.players.some(p => p.id === playerId)) {
      logger.info(`Player ${playerName} already in lobby ${code}`);
      return lobby;
    }

    const player = createPlayer(playerId, playerName);
    lobby.players.push(player);
    this.playerToLobby.set(playerId, code);
    
    logger.info(`Player ${playerName} joined lobby ${code}`);
    return lobby;
  }

  leaveLobby(playerId: string): { lobby: Lobby | null; wasHost: boolean } {
    const lobbyCode = this.playerToLobby.get(playerId);
    
    if (!lobbyCode) {
      return { lobby: null, wasHost: false };
    }

    const lobby = this.lobbies.get(lobbyCode);
    if (!lobby) {
      return { lobby: null, wasHost: false };
    }

    const wasHost = lobby.hostId === playerId;
    lobby.players = lobby.players.filter(p => p.id !== playerId);
    this.playerToLobby.delete(playerId);

    // If lobby is empty or host left, delete it
    if (lobby.players.length === 0 || wasHost) {
      this.lobbies.delete(lobbyCode);
      logger.info(`Lobby ${lobbyCode} deleted`);
      return { lobby: null, wasHost };
    }

    // Assign new host if needed
    if (wasHost && lobby.players.length > 0) {
      lobby.hostId = lobby.players[0].id;
      logger.info(`New host for lobby ${lobbyCode}: ${lobby.players[0].name}`);
    }

    logger.info(`Player ${playerId} left lobby ${lobbyCode}`);
    return { lobby, wasHost };
  }

  getLobby(code: string): Lobby | undefined {
    return this.lobbies.get(code);
  }

  getLobbyByPlayer(playerId: string): Lobby | undefined {
    const lobbyCode = this.playerToLobby.get(playerId);
    if (!lobbyCode) return undefined;
    return this.lobbies.get(lobbyCode);
  }

  startGame(code: string): Lobby | null {
    const lobby = this.lobbies.get(code);
    
    if (!lobby) {
      return null;
    }

    if (lobby.players.length < 3) {
      logger.warn(`Cannot start game in lobby ${code}: need at least 3 players`);
      return null;
    }

    // Randomly select impostor
    const randomIndex = Math.floor(Math.random() * lobby.players.length);
    const impostorId = lobby.players[randomIndex].id;
    lobby.players[randomIndex].isImpostor = true;
    lobby.impostorId = impostorId;
    lobby.status = 'in-progress';

    logger.info(`Game started in lobby ${code}, impostor: ${impostorId}`);
    return lobby;
  }

  cleanupInactiveLobbies(maxAge: number = 3600000) {
    // maxAge in milliseconds (default 1 hour)
    const now = new Date().getTime();
    
    for (const [code, lobby] of this.lobbies.entries()) {
      const age = now - lobby.createdAt.getTime();
      
      if (age > maxAge && lobby.status === 'waiting') {
        lobby.players.forEach(player => {
          this.playerToLobby.delete(player.id);
        });
        this.lobbies.delete(code);
        logger.info(`Cleaned up inactive lobby: ${code}`);
      }
    }
  }
}

export const lobbyManager = new LobbyManager();
