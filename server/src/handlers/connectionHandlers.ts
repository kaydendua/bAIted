import { Server, Socket } from 'socket.io';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';

export function handleConnection(socket: Socket) {
  // Send connection acknowledgment
  socket.emit('connected', { socketId: socket.id });
}

export function handleDisconnect(io: Server, socket: Socket) {
  logger.info(`Client disconnected: ${socket.id}`);
  
  // Remove player from any lobby they're in
  const result = lobbyManager.leaveLobby(socket.id);
  
  if (result.lobby) {
    // Notify remaining players
    io.to(result.lobby.code).emit('player-left', {
      lobby: result.lobby,
      playerId: socket.id
    });
  } else if (result.wasHost) {
    // Lobby was deleted, notify all players
    const lobbyCode = Array.from(socket.rooms).find(room => room !== socket.id);
    if (lobbyCode) {
      io.to(lobbyCode).emit('lobby-closed', {
        reason: 'Host disconnected'
      });
    }
  }
}
