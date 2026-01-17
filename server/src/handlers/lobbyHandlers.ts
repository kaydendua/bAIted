import { Server, Socket } from 'socket.io';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';

export function handleCreateLobby(io: Server, socket: Socket, data: { playerName: string }) {
  try {
    const { playerName } = data;
    
    if (!playerName || playerName.trim().length === 0) {
      socket.emit('error', { message: 'Player name is required' });
      return;
    }

    const lobby = lobbyManager.createLobby(socket.id, playerName);
    
    socket.join(lobby.code);
    
    socket.emit('lobby-created', { lobby });
    
    logger.info(`Lobby created: ${lobby.code}`);
  } catch (error) {
    logger.error('Error creating lobby:', error);
    socket.emit('error', { message: 'Failed to create lobby' });
  }
}
