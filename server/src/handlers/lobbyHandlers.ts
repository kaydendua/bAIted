import { Server, Socket } from 'socket.io';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';

export function handleCreateLobby(io: Server, socket: Socket, data: { playerName: string; maxPlayers?: number }) {
  try {
    const { playerName, maxPlayers } = data;
    
    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error', { message: 'Player name is required' });
      return;
    }

    const lobby = lobbyManager.createLobby(socket.id, playerName, maxPlayers);
    
    socket.join(lobby.code);
    
    socket.emit('lobby-created', { lobby });
    
    logger.info(`Lobby created: ${lobby.code}`);
  } catch (error) {
    logger.error('Error creating lobby:', error);
    socket.emit('error', { message: 'Failed to create lobby' });
  }
}

export function handleJoinLobby(io: Server, socket: Socket, data: { lobbyCode: string, playerName: string }) {
    const { lobbyCode, playerName } = data;

    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error', { message: 'Player name is required' });
      return;
    }

    if (!lobbyCode || lobbyCode.trim().length === 0) {
      socket.emit('error', { message: 'Lobby code is required' });
      return;
    }

    const lobby = lobbyManager.joinLobby(lobbyCode.toLowerCase(), socket.id, playerName)
    
    if (!lobby) {
        socket.emit('error', { message: 'Lobby not found or game already started' });
        return;
    }

    socket.join(lobby.code);

    socket.emit('lobby-joined', { lobby });

    io.to(lobby.code).emit('player-joined', {
      lobby,
      player: lobby.players.find(p => p.id === socket.id)
    });

    logger.info(`Player ${playerName} joined lobby ${lobbyCode}`);
}
